import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import "dotenv/config";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Start seeding secure admin user...');

    const adminEmail = (process.env.ADMIN_EMAIL || 'favmoms440@gmail.com').toLowerCase();
    const adminPassword = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || 'Password123!', 10);

    // Ensure only ONE admin exists
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: 'ADMIN', // Ensure role is always ADMIN
        },
        create: {
            name: 'System Administrator',
            email: adminEmail,
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    console.log(`Seeding finished. Secure Admin created: ${admin.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
