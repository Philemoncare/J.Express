import nodemailer from 'nodemailer';
import path from 'path';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendLoginAlert = async (email: string, details: { ip: string; device: string; timestamp: string }) => {
    const mailOptions = {
        from: `"J.Express Security" <${process.env.SMTP_FROM || 'security@jexpress.com'}>`,
        to: email,
        subject: '⚠️ Login Attempt Detected',
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #d32f2f;">Login Attempt Detected</h2>
                <p>A login attempt was made to your J.Express account.</p>
                <hr />
                <p><strong>Timestamp:</strong> ${details.timestamp}</p>
                <p><strong>IP Address:</strong> ${details.ip}</p>
                <p><strong>Device:</strong> ${details.device}</p>
                <hr />
                <p>If this wasn't you, please secure your account immediately.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Login alert sent to ${email}`);
    } catch (error) {
        console.error('❌ Failed to send login alert email:', error);
    }
};

export const sendOtpEmail = async (email: string, otp: string, expiresAt: string, details?: { ip: string; device: string; timestamp: string }) => {
    const mailOptions = {
        from: `"J.Express Security" <${process.env.SMTP_FROM || 'security@jexpress.com'}>`,
        to: email,
        subject: '🔐 Secure Login Verification Code',
        html: `
            <div style="background-color: #f8fafc; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;">

                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; padding: 12px; background-color: #f0fdf4; border-radius: 16px; margin-bottom: 16px;">
                            <span style="font-size: 32px;">🔐</span>
                        </div>
                        <h2 style="color: #1e293b; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">Identity Verification</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Use the code below to complete your login.</p>
                    </div>

                    <div style="background: #f8fafc; padding: 24px; text-align: center; border-radius: 16px; border: 1px dashed #e2e8f0; margin-bottom: 24px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #10b981;">
                            ${otp}
                        </span>
                        <p style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 12px; letter-spacing: 0.05em;">
                            Valid for 10 minutes (Until ${expiresAt})
                        </p>
                    </div>

                    ${details ? `
                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px;">
                        <p style="color: #475569; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em;">Login Request Details</p>
                        <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px;">
                            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;"><strong>IP Address:</strong> ${details.ip}</p>
                            <p style="margin: 0; color: #64748b; font-size: 12px;"><strong>Device:</strong> ${details.device}</p>
                        </div>
                    </div>
                    ` : ''}

                    <div style="margin-top: 32px; text-align: center;">
                        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5;">
                            If you didn't request this, your account might be at risk. <br/>
                            Please <a href="#" style="color: #10b981; text-decoration: none; font-weight: 600;">secure your account</a> immediately.
                        </p>
                    </div>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification Code Email sent to ${email}`);
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error);
    }
};

export const sendSecureOtpEmail = async (email: string, otp: string, expiresAt: string) => {
    const mailOptions = {
        from: `"J.Express Secure Vault" <${process.env.SMTP_FROM_SECURE || process.env.SMTP_FROM || 'vault@jexpress.com'}>`,
        to: email,
        subject: '🚨 HIGH SECURITY: Elevated Access Verification',
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 2px solid #d32f2f; border-radius: 10px; max-width: 500px; margin: auto; background-color: #fffafb;">
                <h2 style="color: #d32f2f; text-align: center;">Elevated Access Requested</h2>
                <p style="text-align: center; font-weight: bold;">This code grants access to sensitive system controls.</p>
                <p>Enter this 8-digit code within the next <strong>3 minutes</strong>:</p>
                <div style="background: #1a1a1a; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; color: #ff5252; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                    ${otp}
                </div>
                <p style="color: #d32f2f; font-size: 13px; margin-top: 25px; text-align: center; font-weight: bold;">Critical Expiry: ${expiresAt}</p>
                <hr style="border: none; border-top: 1px solid #ffcdd2; margin: 20px 0;" />
                <p style="font-size: 12px; color: #b71c1c; background: #ffebee; padding: 10px; border-radius: 4px;">
                    <strong>SECURITY WARNING:</strong> This access mode allows changing passwords and managing financial records. Never share this code.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Secure OTP Email sent to ${email}`);
    } catch (error) {
        console.error('❌ Failed to send Secure OTP email:', error);
    }
};

export const sendPasswordChangeAlert = async (email: string, details: { ip: string; device: string; timestamp: string }) => {
    const mailOptions = {
        from: `"J.Express Security" <${process.env.SMTP_FROM || 'security@jexpress.com'}>`,
        to: email,
        subject: '🔐 Security Alert: Password Changed',
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #1976d2;">Password Changed Successfully</h2>
                <p>Your password for J.Express was recently changed.</p>
                <hr />
                <p><strong>Time:</strong> ${details.timestamp}</p>
                <p><strong>IP Address:</strong> ${details.ip}</p>
                <p><strong>Device:</strong> ${details.device}</p>
                <hr />
                <p style="color: #d32f2f; font-weight: bold;">If you did not perform this action, please contact support immediately as your account may be compromised.</p>
                <p>All other active sessions have been invalidated for your security.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password change alert sent to ${email}`);
    } catch (error) {
        console.error('❌ Failed to send password change alert email:', error);
    }
};

export const sendPasswordResetEmail = async (email: string, otp: string, expiresAt: string) => {
    const mailOptions = {
        from: `"J.Express Security" <${process.env.SMTP_FROM || 'security@jexpress.com'}>`,
        to: email,
        subject: '🔐 Password Reset Verification Code',
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 500px; margin: auto;">
                <h2 style="color: #1976d2; text-align: center;">Reset Your Password</h2>
                <p>We received a request to reset your J.Express account password. Use the following code to proceed:</p>
                <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; border-radius: 12px; border: 1px solid #e2e8f0; color: #1e293b;">
                    ${otp}
                </div>
                <p style="color: #64748b; font-size: 12px; margin-top: 25px; text-align: center;">Expires at: ${expiresAt}</p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center;">If you did not request this, please ignore this email or contact security if you are concerned.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset OTP sent to ${email}`);
    } catch (error) {
        console.error('❌ Failed to send password reset email:', error);
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    const welcomeImagePath = path.join(__dirname, '../../../frontend/public/images/Person Using Tablet Next to a Car in 3D Style.jpg');

    const mailOptions = {
        from: `"J.Express" <${process.env.SMTP_FROM || 'welcome@jexpress.com'}>`,
        to: email,
        subject: 'Welcome to J.Express! 🚀',
        html: `
            <div style="background-color: #f8fafc; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <div style="max-width: 400px; margin: 0 auto; background-color: #ffffff; border-radius: 32px; padding: 32px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; text-align: center;">

                    <!-- Compact Illustration -->
                    <div style="margin-bottom: 24px;">
                        <img src="cid:welcome_image" style="width: 160px; height: auto; border-radius: 20px; display: block; margin: 0 auto; filter: drop-shadow(0 15px 20px rgba(16, 185, 129, 0.12));" alt="Welcome" />
                    </div>

                    <!-- Responsive Heading -->
                    <h1 style="color: #10b981; font-size: 32px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.03em;">Welcome !</h1>

                    <!-- Logo Section -->
                    <div style="margin-bottom: 24px; text-align: center;">
                        <span style="font-size: 20px; font-weight: 800; color: #1e293b; letter-spacing: -0.04em; vertical-align: middle;">J.Express</span>
                        <div style="display: inline-block; width: 20px; height: 20px; background-color: #10b981; color: white; border-radius: 50%; text-align: center; line-height: 20px; font-size: 12px; vertical-align: middle; margin-left: 4px; font-weight: bold;">⌘</div>
                    </div>

                    <!-- Focused Content -->
                    <div style="text-align: left; color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                        <p style="margin: 0 0 12px 0;">Hi <strong>${name}</strong>,</p>
                        <p style="margin: 0 0 20px 0;">We're thrilled to have you at <strong>J.Express</strong>. Manage your logistics with our advanced secure dashboard.</p>

                        <div style="background-color: #f0fdf4; border-left: 3px solid #10b981; border-radius: 12px; padding: 14px 16px;">
                            <p style="margin: 0; color: #166534; font-size: 13px; line-height: 1.4;">
                                Toggle between <strong>Normal</strong> tracking and <strong>Secure Vault</strong> management effortlessly.
                            </p>
                        </div>
                    </div>

                    <!-- Modern Action Button -->
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 18px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);">
                        Launch Dashboard
                    </a>

                    <!-- Minimalist Footer -->
                    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                        <p style="font-size: 11px; color: #94a3b8; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
                            © ${new Date().getFullYear()} J.EXPRESS • SECURE LOGISTICS
                        </p>
                    </div>
                </div>
            </div>
        `,
        attachments: [
            {
                filename: 'welcome.jpg',
                path: welcomeImagePath,
                cid: 'welcome_image'
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
        console.error('❌ Failed to send welcome email:', error);
    }
};
