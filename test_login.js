const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testLogin() {
    try {
        // Test admin account
        console.log('\n=== Testing Admin Login ===');
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@mariclaire.com' }
        });

        if (admin) {
            console.log(`Found admin: ${admin.name}`);
            console.log(`Status: ${admin.status}`);
            console.log(`Role: ${admin.role}`);

            // Test password (assuming default is 'admin123')
            const testPassword = 'admin123';
            const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
            console.log(`Password 'admin123' valid: ${isValid}`);
        } else {
            console.log('❌ Admin account not found!');
        }

        // Test a rider account
        console.log('\n=== Testing Rider Login ===');
        const rider = await prisma.user.findFirst({
            where: { role: 'DELIVERY' }
        });

        if (rider) {
            console.log(`Found rider: ${rider.name} (${rider.email})`);
            console.log(`Status: ${rider.status}`);
            console.log(`Role: ${rider.role}`);
        } else {
            console.log('❌ No rider accounts found!');
        }

        // List all users
        console.log('\n=== All Users ===');
        const allUsers = await prisma.user.findMany({
            select: {
                email: true,
                name: true,
                role: true,
                status: true
            }
        });

        allUsers.forEach(u => {
            console.log(`- ${u.name} (${u.email}) - ${u.role} - ${u.status}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
