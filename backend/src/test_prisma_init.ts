import prisma from './utils/prisma';

async function test() {
    try {
        console.log('Testing Prisma connection...');
        await prisma.$connect();
        console.log('✅ Success!');
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);
    } catch (err) {
        console.error('❌ Failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
