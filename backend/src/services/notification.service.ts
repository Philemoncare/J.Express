import prisma from '../utils/prisma';

export const createNotification = async (userId: string, type: 'info' | 'warning' | 'error', title: string, message: string) => {
    try {
        await prisma.notification.create({
            data: {
                type,
                notifiableType: 'User',
                notifiableId: userId,
                data: JSON.stringify({ title, message }),
            }
        });
        console.log(`[NOTIFICATION] Created: ${title} for User: ${userId}`);
    } catch (error) {
        console.error('[NOTIFICATION ERROR] Failed to create notification:', error);
    }
};

/**
 * Audit system for potential notifications
 */
export const checkSystemHealth = async (userId: string) => {
    try {
        // 1. Check for recent failed login attempts
        const failedLogins = await prisma.loginAttempt.count({
            where: {
                userId,
                status: 'FAILED',
                createdAt: { gte: new Date(Date.now() - 3600000) } // Last hour
            }
        });

        if (failedLogins > 3) {
            await createNotification(
                userId,
                'warning',
                'Security Alert',
                `Detected ${failedLogins} failed login attempts on your account in the last hour.`
            );
        }

        // 2. Check for high fuel burn (example threshold)
        const highFuel = await prisma.fuelPurchase.findFirst({
            where: { driverId: userId, totalCost: { gt: 1000 } },
            orderBy: { createdAt: 'desc' }
        });

        if (highFuel && highFuel.createdAt > new Date(Date.now() - 86400000)) {
            await createNotification(
                userId,
                'info',
                'High Fuel Consumption',
                `A significant fuel purchase of GHS ${highFuel.totalCost} was recorded recently.`
            );
        }

    } catch (e) {
        console.error('[HEALTH CHECK ERROR]', e);
    }
};
