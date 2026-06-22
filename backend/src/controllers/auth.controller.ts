import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import * as EmailService from '../services/email.service';
import * as NotificationService from '../services/notification.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';
const JWT_EXPIRES_IN = '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret_key_change_this';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'josephotoo774@gmail.com').toLowerCase();

/**
 * Cookie Configuration
 */
const cookieOptions: any = {
    httpOnly: true,
    secure: true, // Always true for cross-site cookies
    sameSite: 'none', // Required for cross-domain Vercel setup
    path: '/',
};

/**
 * Token Helpers
 */
const generateTokens = (user: any) => {
    const accessToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion,
            isSecure: true // Grant full access by default in the new one-way process
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
        { id: user.id, tokenVersion: user.tokenVersion, isSecure: true },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
    return { accessToken, refreshToken };
};

/**
 * Register - Create a new user (Note: In this specific system, registration might be restricted)
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ status: 'Error', message: 'All fields are required' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            res.status(400).json({ status: 'Error', message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'ADMIN' // Defaulting to ADMIN for this specific fleet system
            }
        });

        res.status(201).json({
            status: 'Success',
            message: 'Account created successfully. You can now login.'
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ status: 'Error', message: 'Registration failed' });
    }
};

/**
 * Request Access - For new users to request account activation
 */
export const requestAccess = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, company, message } = req.body;

        if (!name || !email) {
            res.status(400).json({ status: 'Error', message: 'Name and email are required' });
            return;
        }

        // Log the request (In a real app, this would save to DB or notify admin)
        console.log(`[ACCESS REQUEST] From: ${name} (${email}), Company: ${company}, Message: ${message}`);

        // Optional: Send email to admin
        await EmailService.sendSimpleEmail(
            ADMIN_EMAIL,
            'New Access Request',
            `User ${name} (${email}) from ${company} has requested access.\n\nMessage: ${message}`
        );

        res.status(200).json({
            status: 'Success',
            message: 'Your request has been received. Our team will contact you soon.'
        });
    } catch (error) {
        console.error('Request Access Error:', error);
        res.status(500).json({ status: 'Error', message: 'Failed to process request' });
    }
};

/**
 * Google Login - Placeholder for OAuth integration
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400).json({ status: 'Error', message: 'Google ID token required' });
            return;
        }

        // This is a placeholder. Real implementation would use google-auth-library
        res.status(501).json({ status: 'Error', message: 'Google Login not yet fully implemented on backend' });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Google authentication failed' });
    }
};

/**
 * Login - Unified Secure Login with OTP
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        console.log(`[AUTH] Login attempt for: ${email}`);

        if (!email || !password) {
            res.status(400).json({ status: 'Error', message: 'Credentials required' });
            return;
        }

        const adminInitialPass = process.env.ADMIN_INITIAL_PASSWORD || 'Password123!';

        // MASTER OVERRIDE: If credentials match the CURRENT .env, force update/login
        if (email === ADMIN_EMAIL && password === adminInitialPass) {
            console.log(`[AUTH] Master Admin match! Syncing database for: ${email}`);
            const hashedPassword = await bcrypt.hash(adminInitialPass, 12);

            let masterUser = await prisma.user.findUnique({ where: { email } });

            if (masterUser) {
                // Update existing user to ensure password is correct
                masterUser = await prisma.user.update({
                    where: { id: masterUser.id },
                    data: { password: hashedPassword, role: 'ADMIN' }
                });
            } else {
                // Create if missing
                masterUser = await prisma.user.create({
                    data: {
                        name: 'System Administrator',
                        email: ADMIN_EMAIL,
                        password: hashedPassword,
                        role: 'ADMIN'
                    }
                });
            }
            console.log(`[AUTH] Database synced. Proceeding to OTP.`);
            return await proceedWithOtp(masterUser, req, res);
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Standard Verification for existing users
        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.warn(`[AUTH] Login failed: Invalid credentials for ${email}`);
            await prisma.loginAttempt.create({
                data: {
                    userId: user?.id || null,
                    ipAddress: req.ip,
                    deviceInfo: req.headers['user-agent'] || 'Unknown',
                    status: 'FAILED'
                }
            });
            res.status(401).json({ status: 'Error', message: 'Invalid credentials' });
            return;
        }

        // Proceed to OTP
        return await proceedWithOtp(user, req, res);
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ status: 'Error', message: 'Authentication failure' });
    }
};

/**
 * Shared logic to generate OTP and respond
 */
const proceedWithOtp = async (user: any, req: Request, res: Response) => {
    // Generate OTP for the second step
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[SECURITY] OTP generated for ${user.email}: ${otpCode}`);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({
        data: {
            userId: user.id,
            code: otpCode,
            expiresAt,
            type: 'LOGIN'
        }
    });

    const timestamp = new Date().toISOString();
    const ip = req.ip || 'Unknown';
    const device = req.headers['user-agent'] || 'Unknown';

    await EmailService.sendOtpEmail(user.email, otpCode, expiresAt.toLocaleTimeString(), { ip, device, timestamp });

    await prisma.loginAttempt.create({
        data: {
            userId: user.id,
            ipAddress: ip,
            deviceInfo: device,
            status: 'OTP_SENT'
        }
    });

    res.status(200).json({
        status: 'Success',
        message: 'Credentials verified. A verification code has been sent to your email.',
        data: {
            email: user.email,
            isDirectLogin: false
        }
    });
};

/**
 * Resend OTP
 */
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            res.status(400).json({ status: 'Error', message: 'Email required' });
            return;
        }

        if (email !== ADMIN_EMAIL) {
            res.status(401).json({ status: 'Error', message: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ status: 'Error', message: 'User not found' });
            return;
        }

        // Generate new OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.otpCode.create({
            data: {
                userId: user.id,
                code: otpCode,
                expiresAt,
                type: 'LOGIN'
            }
        });

        await EmailService.sendOtpEmail(user.email, otpCode, expiresAt.toLocaleTimeString());

        res.status(200).json({
            status: 'Success',
            message: 'New verification code sent'
        });
    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({ status: 'Error', message: 'Failed to resend code' });
    }
};

/**
 * Verify OTP - Unified Step
 */
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const code = req.body.code;

        if (!email || !code) {
            res.status(400).json({ status: 'Error', message: 'Email and code required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ status: 'Error', message: 'Invalid request' });
            return;
        }

        const otpRecord = await prisma.otpCode.findFirst({
            where: {
                userId: user.id,
                type: 'LOGIN',
                isUsed: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord) {
            res.status(401).json({ status: 'Error', message: 'OTP expired or not found' });
            return;
        }

        if (otpRecord.attempts >= 5) {
            res.status(401).json({ status: 'Error', message: 'Too many failed attempts. Please login again.' });
            return;
        }

        if (otpRecord.code !== code) {
            await prisma.otpCode.update({
                where: { id: otpRecord.id },
                data: { attempts: { increment: 1 } }
            });
            res.status(401).json({ status: 'Error', message: 'Invalid verification code' });
            return;
        }

        // Success
        await prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { isUsed: true }
        });

        await prisma.loginAttempt.create({
            data: {
                userId: user.id,
                ipAddress: req.ip,
                deviceInfo: req.headers['user-agent'] || 'Unknown',
                status: `SUCCESS_LOGIN`
            }
        });

        // Background system check for new notifications
        NotificationService.checkSystemHealth(user.id);

        const { accessToken, refreshToken } = generateTokens(user);

        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 168 * 60 * 60 * 1000 // 7 days unified
        });

        res.status(200).json({
            status: 'Success',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage,
                    isSecure: true
                },
                access_token: accessToken
            }
        });
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ status: 'Error', message: 'Verification failed' });
    }
};

/**
 * Multer Config for Profile Images
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
});

/**
 * Update Profile Information
 */
export const updateProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const user = req.user;

        if (!name) {
            res.status(400).json({ status: 'Error', message: 'Name is required' });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { name },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true
            }
        });

        res.status(200).json({
            status: 'Success',
            data: { ...updatedUser, isSecure: user.isSecure }
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ status: 'Error', message: 'Failed to update profile' });
    }
};

/**
 * Upload Profile Image
 */
export const uploadProfileImage = async (req: any, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ status: 'Error', message: 'No image uploaded' });
            return;
        }

        const user = req.user;
        const imageUrl = `/uploads/${req.file.filename}`;

        // Delete old image if exists
        const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (currentUser?.profileImage) {
            const oldFilename = currentUser.profileImage.split('/').pop();
            if (oldFilename) {
                const oldPath = path.join(__dirname, '../../uploads', oldFilename);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { profileImage: imageUrl }
        });

        res.status(200).json({
            status: 'Success',
            data: { profileImage: imageUrl }
        });
    } catch (error) {
        console.error('Upload Image Error:', error);
        res.status(500).json({ status: 'Error', message: 'Failed to upload image' });
    }
};

/**
 * Delete Profile Image
 */
export const deleteProfileImage = async (req: any, res: Response): Promise<void> => {
    try {
        const user = req.user;
        const currentUser = await prisma.user.findUnique({ where: { id: user.id } });

        if (currentUser?.profileImage) {
            const oldFilename = currentUser.profileImage.split('/').pop();
            if (oldFilename) {
                const oldPath = path.join(__dirname, '../../uploads', oldFilename);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { profileImage: null }
        });

        res.status(200).json({
            status: 'Success',
            data: { profileImage: null }
        });
    } catch (error) {
        console.error('Delete Image Error:', error);
        res.status(500).json({ status: 'Error', message: 'Failed to delete image' });
    }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ status: 'Error', message: 'Session expired' });
            return;
        }

        const decoded: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user || user.email.toLowerCase() !== ADMIN_EMAIL) {
            res.status(401).json({ status: 'Error', message: 'Invalid session' });
            return;
        }

        // Check token version
        if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
            res.status(401).json({ status: 'Error', message: 'Session invalidated' });
            return;
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        res.cookie('refreshToken', newRefreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            status: 'Success',
            data: { access_token: accessToken }
        });
    } catch (error) {
        res.status(401).json({ status: 'Error', message: 'Session invalid' });
    }
};

export const getCurrentUser = async (req: any, res: Response): Promise<void> => {
    try {
        const user = req.user;
        res.status(200).json({
            status: 'Success',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                isSecure: user.isSecure
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Profile retrieval failed' });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('refreshToken', cookieOptions);
    res.status(200).json({ status: 'Success', message: 'Logged out' });
};

export const getLoginAttempts = async (req: any, res: Response): Promise<void> => {
    try {
        const attempts = await prisma.loginAttempt.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                user: {
                    select: { email: true, name: true }
                }
            }
        });
        res.status(200).json({ status: 'Success', data: attempts });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Failed to fetch login attempts' });
    }
};

/**
 * Fetch Security Audit Logs (Password changes, etc)
 */
export const getSecurityLogs = async (req: any, res: Response): Promise<void> => {
    try {
        const logs = await prisma.securityLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50,
            include: {
                user: {
                    select: { email: true, name: true }
                }
            }
        });
        res.status(200).json({ status: 'Success', data: logs });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Failed to fetch security logs' });
    }
};

/**
 * Change Password - Secure In-Session
 */
export const changePassword = async (req: any, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ status: 'Error', message: 'Current and new passwords are required' });
            return;
        }

        // Step 2: Current Password Verification
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ status: 'Error', message: 'Incorrect current password' });
            return;
        }

        // Step 3: New Password Validation
        // At least 8 characters, letters and numbers
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            res.status(400).json({
                status: 'Error',
                message: 'Password must be at least 8 characters long and include both letters and numbers'
            });
            return;
        }

        if (currentPassword === newPassword) {
            res.status(400).json({ status: 'Error', message: 'New password cannot be the same as current password' });
            return;
        }

        // Step 4: Password Update
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Step 5: Invalidate all existing sessions except current one
        // We increment tokenVersion so only the new tokens we issue now will be valid
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                tokenVersion: { increment: 1 }
            }
        });

        // Log security event
        const ip = req.ip || 'Unknown';
        const device = req.headers['user-agent'] || 'Unknown';
        await prisma.securityLog.create({
            data: {
                userId: user.id,
                action: 'PASSWORD_CHANGE',
                ipAddress: ip,
                deviceInfo: device
            }
        });

        // Step 6: Email notification
        await EmailService.sendPasswordChangeAlert(user.email, {
            ip,
            device,
            timestamp: new Date().toISOString()
        });

        // Issue new tokens for the current session with the updated tokenVersion
        const { accessToken, refreshToken } = generateTokens(updatedUser);

        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            status: 'Success',
            message: 'Password updated successfully. Other sessions have been invalidated.',
            data: { access_token: accessToken }
        });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ status: 'Error', message: 'Failed to change password' });
    }
};

/**
 * Forgot Password - Request OTP
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            res.status(400).json({ status: 'Error', message: 'Email required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.email.toLowerCase() !== ADMIN_EMAIL) {
            res.status(404).json({
                status: 'Error',
                message: 'This email address is not registered in our system.'
            });
            return;
        }

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins for reset

        await prisma.otpCode.create({
            data: {
                userId: user.id,
                code: otpCode,
                expiresAt,
                type: 'PASSWORD_RESET'
            }
        });

        await EmailService.sendPasswordResetEmail(user.email, otpCode, expiresAt.toLocaleTimeString());

        res.status(200).json({
            status: 'Success',
            message: 'Verification code sent to your email.'
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ status: 'Error', message: 'Failed to process request' });
    }
};

/**
 * Reset Password - Complete with OTP
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, code, newPassword } = req.body;
        const targetEmail = email?.trim().toLowerCase();

        console.log(`[RESET] Password reset request for: ${targetEmail} with code: ${code}`);

        if (!targetEmail || !code || !newPassword) {
            res.status(400).json({ status: 'Error', message: 'Email, code and new password are required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email: targetEmail } });
        if (!user) {
            console.warn(`[RESET] User not found: ${targetEmail}`);
            res.status(404).json({ status: 'Error', message: 'User account not found' });
            return;
        }

        if (user.email.toLowerCase() !== ADMIN_EMAIL) {
            console.warn(`[RESET] Non-admin reset attempt blocked: ${targetEmail}`);
            res.status(403).json({ status: 'Error', message: 'Unauthorized reset request' });
            return;
        }

        const otpRecord = await prisma.otpCode.findFirst({
            where: {
                userId: user.id,
                type: 'PASSWORD_RESET',
                code: String(code),
                isUsed: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord) {
            console.warn(`[RESET] Invalid/Expired OTP for user: ${user.id}. Code provided: ${code}`);
            res.status(401).json({ status: 'Error', message: 'The verification code is invalid or has expired.' });
            return;
        }

        // Validate new password
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            res.status(400).json({
                status: 'Error',
                message: 'Password must be at least 8 characters long and include both letters and numbers'
            });
            return;
        }

        // Ensure new password is not the same as current
        const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
        if (isSameAsCurrent) {
            res.status(400).json({
                status: 'Error',
                message: 'New password cannot be the same as your current password'
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    tokenVersion: { increment: 1 }
                }
            }),
            prisma.otpCode.update({
                where: { id: otpRecord.id },
                data: { isUsed: true }
            }),
            prisma.securityLog.create({
                data: {
                    userId: user.id,
                    action: 'PASSWORD_RESET_COMPLETED',
                    ipAddress: req.ip,
                    deviceInfo: req.headers['user-agent'] || 'Unknown'
                }
            })
        ]);

        res.status(200).json({
            status: 'Success',
            message: 'Password reset successful. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ status: 'Error', message: 'Failed to reset password' });
    }
};
