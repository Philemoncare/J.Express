const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    const client = await pool.connect();
    try {
        console.log('Connected to Neon database. Seeding admin user...');

        // 1. Ensure Role exists
        const adminRoleSlug = 'admin';
        const roleRes = await client.query('SELECT id FROM "Role" WHERE slug = $1', [adminRoleSlug]);
        let roleId;

        if (roleRes.rows.length === 0) {
            console.log('Creating Admin role...');
            roleId = crypto.randomUUID();
            await client.query(
                'INSERT INTO "Role" (id, name, slug, "updatedAt") VALUES ($1, $2, $3, NOW())',
                [roleId, 'Admin', adminRoleSlug]
            );
        } else {
            roleId = roleRes.rows[0].id;
            console.log('Admin role already exists.');
        }

        // 2. Ensure User exists
        const adminEmail = process.env.ADMIN_EMAIL || 'favmoms440@gmail.com';
        const userRes = await client.query('SELECT id FROM "User" WHERE email = $1', [adminEmail]);

        if (userRes.rows.length === 0) {
            console.log(`Creating Admin user (${adminEmail})...`);
            const userId = crypto.randomUUID();
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || 'Password123!', 10);

            await client.query(
                'INSERT INTO "User" (id, name, email, password, "updatedAt") VALUES ($1, $2, $3, $4, NOW())',
                [userId, 'System Administrator', adminEmail, hashedPassword]
            );

            // 3. Link User to Role
            // Note: Check relation table name, usually it is _UserRoles in Prisma for M-N
            // If it's a join table from schema.prisma: model User { roles Role[] @relation("UserRoles") }
            // Prisma usually creates a table like _UserRoles with "A" (User) and "B" (Role) or vice versa.
            // Looking at the error from my previous thought, let's try to find the relation table.

            try {
                await client.query(
                    'INSERT INTO "_UserRoles" ("A", "B") VALUES ($1, $2)',
                    [userId, roleId]
                );
                console.log('Admin user assigned to Admin role in _UserRoles (A=User, B=Role).');
            } catch (e) {
                try {
                    await client.query(
                        'INSERT INTO "_UserRoles" ("A", "B") VALUES ($1, $2)',
                        [roleId, userId]
                    );
                    console.log('Admin user assigned to Admin role in _UserRoles (A=Role, B=User).');
                } catch (e2) {
                    console.error('Could not link role. You might need to check the join table name.', e2.message);
                }
            }
        } else {
            console.log('Admin user already exists.');
            const hashedPassword = await bcrypt.hash('Password123!', 10);
            await client.query('UPDATE "User" SET password = $1 WHERE email = $2', [hashedPassword, adminEmail]);
            console.log('Admin user password updated.');
        }

        console.log('Seeding completed successfully!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
