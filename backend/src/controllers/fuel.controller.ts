import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAll = async (req: Request, res: Response) => {
    try {
        const { vehicleId, startDate, endDate } = req.query;
        const where: any = {};

        if (vehicleId) where.vehicleId = String(vehicleId);
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(String(startDate));
            if (endDate) where.date.lte = new Date(String(endDate));
        }

        const fuelPurchases = await prisma.fuelPurchase.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                vehicle: { select: { vehicleName: true, plateNumber: true } },
                driver: { select: { name: true } }
            }
        });

        res.json({ status: 'Success', data: fuelPurchases });
    } catch (error) {
        console.error('Get all fuel purchases error:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};

export const create = async (req: AuthRequest, res: Response) => {
    try {
        const { vehicleId, liters, costPerLiter, totalCost, odometerReading, date, stationName } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            const fuelPurchase = await tx.fuelPurchase.create({
                data: {
                    vehicleId,
                    driverId: req.user?.id as string,
                    liters: Number(liters),
                    costPerLiter: Number(costPerLiter),
                    totalCost: Number(totalCost),
                    odometerReading: Number(odometerReading),
                    date: new Date(date),
                    stationName
                }
            });

            // Create a corresponding expense entry
            await tx.expense.create({
                data: {
                    vehicleId,
                    userId: req.user?.id as string,
                    category: 'Fuel',
                    amount: Number(totalCost),
                    date: new Date(date),
                    description: `Fuel purchase at ${stationName || 'unknown station'}: ${liters}L`
                }
            });

            // Update vehicle mileage
            await tx.vehicle.update({
                where: { id: vehicleId },
                data: { mileage: Number(odometerReading) }
            });

            return fuelPurchase;
        });

        res.status(201).json({ status: 'Success', data: result });
    } catch (error: any) {
        console.error('Create fuel purchase error:', error);
        res.status(400).json({ status: 'Error', message: error.message || 'Failed to create fuel purchase' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.fuelPurchase.delete({ where: { id } });
        res.json({ status: 'Success', message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Delete fuel purchase error:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};
