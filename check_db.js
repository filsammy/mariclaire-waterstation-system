
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const riderCount = await prisma.deliveryRider.count();
        const userCount = await prisma.user.count({ where: { role: 'DELIVERY' } });
        const allUsers = await prisma.user.count();

        console.log('--- DB STATUS ---');
        console.log(`Total Users: ${allUsers}`);
        console.log(`Delivery Riders in Profile Table: ${riderCount}`);
        console.log(`Users with role DELIVERY: ${userCount}`);
        console.log('-----------------');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
