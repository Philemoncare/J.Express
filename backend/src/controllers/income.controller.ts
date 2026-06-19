import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAll = async (req: Request, res: Response) => {
    try {
        const { vehicleId, driverId, startDate, endDate } = req.query;
        const where: any = {};

        if (vehicleId) where.vehicleId = String(vehicleId);
        if (driverId) where.driverId = String(driverId);
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(String(startDate));
            if (endDate) where.date.lte = new Date(String(endDate));
        }

        const incomes = await prisma.income.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                vehicle: { select: { vehicleName: true, plateNumber: true } },
                driver: { select: { name: true } }
            }
        });

        res.json({ status: 'Success', data: incomes });
    } catch (error) {
        console.error('Get all incomes error:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};

export const create = async (req: AuthRequest, res: Response) => {
    try {
        const { vehicleId, amount, date, source, description, driverId } = req.body;

        // Validation
        if (!vehicleId || !amount || !date || !source) {
            return res.status(400).json({
                status: 'Error',
                message: 'Incomplete data. Please fill in all required fields.'
            });
        }

        const finalDriverId = driverId || req.user?.id;
        if (!finalDriverId) {
            return res.status(401).json({ status: 'Error', message: 'User session invalid. Please log in again.' });
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(vehicleId)) {
            return res.status(400).json({ status: 'Error', message: 'Invalid vehicle ID format.' });
        }
        if (!uuidRegex.test(finalDriverId)) {
            return res.status(400).json({ status: 'Error', message: 'Invalid user ID format.' });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Income record
            const income = await tx.income.create({
                data: {
                    vehicleId,
                    driverId: finalDriverId,
                    amount: Number(amount),
                    date: new Date(date),
                    source,
                    description: description || null
                },
                include: {
                    vehicle: true,
                    driver: true
                }
            });

            // 2. Also record in Expenses as requested
            await tx.expense.create({
                data: {
                    vehicleId,
                    userId: req.user?.id,
                    category: 'Revenue Transfer',
                    amount: Number(amount),
                    date: new Date(date),
                    description: `Automated: Income from ${source}`
                }
            });

            return income;
        });

        res.status(201).json({ status: 'Success', data: result });
    } catch (error: any) {
        console.error('CRITICAL INCOME RECORD ERROR:', error);

        // Handle common Prisma errors
        if (error.code === 'P2003') {
            return res.status(400).json({
                status: 'Error',
                message: 'Database relationship error. The vehicle or driver might not exist.'
            });
        }

        res.status(400).json({
            status: 'Error',
            message: error.message || 'An unexpected error occurred while saving the record.'
        });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.income.delete({ where: { id } });
        res.json({ status: 'Success', message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Delete income error:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};
