import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const parseDate = (dateStr: string | null) => {
    return dateStr ? new Date(dateStr) : null;
};

export const getAll = async (req: Request, res: Response) => {
    try {
        const { search, status, brand, fuelType, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { deletedAt: null };

        if (search) {
            where.OR = [
                { vehicleName: { contains: String(search), mode: 'insensitive' } },
                { plateNumber: { contains: String(search), mode: 'insensitive' } },
                { vinNumber: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        if (status) where.status = String(status);
        if (brand) where.brand = String(brand);
        if (fuelType) where.fuelType = String(fuelType);

        const [vehicles, total] = await Promise.all([
            prisma.vehicle.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    creator: {
                        select: { name: true }
                    }
                }
            }),
            prisma.vehicle.count({ where })
        ]);

        res.json({
            status: 'Success',
            data: vehicles,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get all vehicles error:', error);
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};

export const create = async (req: AuthRequest, res: Response) => {
    try {
        const data = req.body;
        const vehicle = await prisma.vehicle.create({
            data: {
                ...data,
                year: Number(data.year),
                mileage: Number(data.mileage || 0),
                insuranceExpiry: parseDate(data.insuranceExpiry),
                roadworthyExpiry: parseDate(data.roadworthyExpiry),
                purchaseDate: parseDate(data.purchaseDate),
                createdBy: req.user?.id,
            }
        });

        res.status(201).json({ status: 'Success', data: vehicle });
    } catch (error: any) {
        console.error('Create vehicle error:', error);
        res.status(400).json({ status: 'Error', message: error.message || 'Failed to create vehicle' });
    }
};

export const getOne = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: id as string },
            include: {
                creator: { select: { name: true } },
                maintenanceRecords: { orderBy: { date: 'desc' }, take: 5 },
                fuelPurchases: { orderBy: { date: 'desc' }, take: 5 },
                _count: {
                    select: {
                        maintenanceRecords: true,
                        fuelPurchases: true,
                        incomes: true,
                        expenses: true
                    }
                }
            }
        });

        if (!vehicle) {
            return res.status(404).json({ status: 'Error', message: 'Vehicle not found' });
        }

        res.json({ status: 'Success', data: vehicle });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updateData: any = { ...data };
        if (data.year) updateData.year = Number(data.year);
        if (data.mileage) updateData.mileage = Number(data.mileage);
        if (data.insuranceExpiry !== undefined) updateData.insuranceExpiry = parseDate(data.insuranceExpiry);
        if (data.roadworthyExpiry !== undefined) updateData.roadworthyExpiry = parseDate(data.roadworthyExpiry);
        if (data.purchaseDate !== undefined) updateData.purchaseDate = parseDate(data.purchaseDate);

        const vehicle = await prisma.vehicle.update({
            where: { id: id as string },
            data: updateData
        });

        res.json({ status: 'Success', data: vehicle });
    } catch (error: any) {
        console.error('Update vehicle error:', error);
        res.status(400).json({ status: 'Error', message: error.message || 'Failed to update vehicle' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.vehicle.update({
            where: { id: id as string },
            data: { deletedAt: new Date(), status: 'archived' }
        });
        res.json({ status: 'Success', message: 'Vehicle archived successfully' });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Internal server error' });
    }
};
