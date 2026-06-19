import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAll = async (req: Request, res: Response) => {
    try {
        const { vehicleId, category, startDate, endDate } = req.query;
        const where: any = {};

        if (vehicleId) where.vehicleId = String(vehicleId);
        if (category) where.category = String(category);
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(String(startDate));
            if (endDate) where.date.lte = new Date(String(endDate));
        }

        const expenses = await prisma.expense.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                vehicle: { select: { vehicleName: true, plateNumber: true } },
                user: { select: { name: true } }
            }
        });

        res.json({ status: 'Success', data: expenses });
    } catch (error) {
        console.error('Get all expenses error:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};

export const create = async (req: AuthRequest, res: Response) => {
    try {
        const { vehicleId, category, amount, date, description } = req.body;

        const expense = await prisma.expense.create({
            data: {
                vehicleId,
                userId: req.user?.id,
                category,
                amount: Number(amount),
                date: new Date(date),
                description
            }
        });

        res.status(201).json({ status: 'Success', data: expense });
    } catch (error: any) {
        console.error('Create expense error:', error);
        res.status(400).json({ status: 'Error', message: error.message || 'Failed to create expense' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.expense.delete({ where: { id } });
        res.json({ status: 'Success', message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};
