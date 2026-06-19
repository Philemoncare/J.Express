import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAll = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.query;
        const where: any = {};

        if (vehicleId) where.vehicleId = String(vehicleId);

        const records = await prisma.maintenanceRecord.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                vehicle: { select: { vehicleName: true, plateNumber: true } }
            }
        });

        res.json({ status: 'Success', data: records });
    } catch (error) {
        console.error('Get all maintenance records error:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};

export const create = async (req: AuthRequest, res: Response) => {
    try {
        const { vehicleId, serviceType, cost, date, odometerReading, notes, serviceCenter } = req.body;

        const record = await prisma.maintenanceRecord.create({
            data: {
                vehicleId,
                serviceType,
                cost: Number(cost),
                date: new Date(date),
                odometerReading: Number(odometerReading),
                notes,
                serviceCenter
            }
        });

        res.status(201).json({ status: 'Success', data: record });
    } catch (error: any) {
        console.error('Create maintenance record error:', error);
        res.status(400).json({ status: 'Error', message: error.message || 'Failed to create maintenance record' });
    }
};
