import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAll = async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                notifiableId: req.user.id,
                notifiableType: 'User'
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.json({ status: 'Success', data: notifications });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.notification.update({
            where: { id },
            data: { readAt: new Date() }
        });
        res.json({ status: 'Success', message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Failed to update notification' });
    }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: {
                notifiableId: req.user.id,
                readAt: null
            },
            data: { readAt: new Date() }
        });
        res.json({ status: 'Success', message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Failed to update notifications' });
    }
};
