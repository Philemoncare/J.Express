import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import mainRoutes from './routes';
import prisma from './utils/prisma';

const app = express();
const PORT = process.env.PORT || 8080;

// 1. Request Logger - TOP OF STACK for diagnostics
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
    }
    next();
});

// 2. Security Middlewares - Permissive for Dev
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. CORS - Open for Dev
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// 4. Rate Limiting - Configuration is handled in specific routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Ensure uploads directory exists (Safe for Serverless)
const uploadsDir = path.join(__dirname, '../uploads');
try {
    if (!fs.existsSync(uploadsDir)) {
        // We only try to create it, but don't fail if we can't (Vercel is read-only)
        if (process.env.NODE_ENV !== 'production') {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    }
} catch (e) {
    console.warn('Uploads directory creation skipped or failed');
}

// ensure static files are reachable
app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1d',
    etag: true,
    index: false
}));

// Main Routes
app.use('/api', mainRoutes);

// Fallback for requests that might have missed the /api prefix from some clients
app.use('/', (req, res, next) => {
    // If it's the root path, don't pass to mainRoutes yet, let the next handlers check it
    if (req.path === '/') return next();
    // Otherwise, try to pass it to mainRoutes as a fallback
    mainRoutes(req, res, next);
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', message: 'Backend is running securely' });
});

// Root Route for Vercel
app.get('/', (req, res) => {
    res.json({ status: 'UP', message: 'J.Express API Core' });
});

// Fallback for 404
app.use((req, res) => {
    console.warn(`[404] ${req.method} ${req.originalUrl || req.url}`);
    res.status(404).json({
        status: 'Error',
        message: `Route ${req.method} ${req.originalUrl || req.url} not found on this server.`
    });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('SERVER ERROR:', err);
    res.status(err.status || 500).json({
        status: 'Error',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(Number(PORT), '0.0.0.0', async () => {
        console.log(`🚀 Secure Fleet API running on port ${PORT}`);
        try {
            await prisma.$connect();
            console.log('✅ Database connected');
        } catch (error: any) {
            console.error('❌ Database connection failed:', error.message);
        }
    });
}

export default app;
