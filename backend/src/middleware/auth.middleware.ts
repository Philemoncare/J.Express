import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'josephotoo774@gmail.com').toLowerCase();

export interface AuthRequest extends Request {
    user?: any;
}

/**
 * Harden Authentication Middleware
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn(`[AUTH] Missing or invalid auth header from ${req.ip}`);
            res.status(401).json({ status: 'Error', message: 'Authentication required' });
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ status: 'Error', message: 'Token missing' });
            return;
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        console.log(`[AUTH] Token verified for user ID: ${decoded.id}`);

        // Fetch user and verify they are STILL the authorized admin
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            console.error(`[AUTH] User not found for ID: ${decoded.id}`);
            res.status(401).json({ status: 'Error', message: 'Unauthorized session' });
            return;
        }

        if (user.email.toLowerCase() !== ADMIN_EMAIL) {
            console.error(`[AUTH] User ${user.email} is not the authorized admin`);
            res.status(401).json({ status: 'Error', message: 'Unauthorized session' });
            return;
        }

        // Check token version to handle session invalidation
        if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
            res.status(401).json({ status: 'Error', message: 'Session invalidated. Please login again.' });
            return;
        }

        req.user = {
            ...user,
            isSecure: !!decoded.isSecure
        };
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ status: 'Error', message: 'Token expired' });
            return;
        }
        res.status(401).json({ status: 'Error', message: 'Invalid token' });
    }
};

/**
 * Middleware to require a Secure Session (Level 2 Access)
 */
export const requireSecureSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // This assumes authenticate middleware has already run
    if (!req.user) {
        res.status(401).json({ status: 'Error', message: 'Authentication required' });
        return;
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ status: 'Error', message: 'Token missing' });
        return;
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);

        if (!decoded.isSecure) {
            res.status(403).json({
                status: 'Error',
                message: 'Elevated security access required for this operation.',
                code: 'SECURE_ACCESS_REQUIRED'
            });
            return;
        }

        next();
    } catch (error) {
        res.status(401).json({ status: 'Error', message: 'Session invalid or expired' });
    }
};
