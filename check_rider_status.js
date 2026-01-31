const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRiderStatus() {
    try {
        const riders = await prisma.deliveryRider.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        status: true,
                        role: true
                    }
                }
            }
        });

        console.log('\n=== RIDER STATUS REPORT ===\n');
        riders.forEach((rider, index) => {
            console.log(`${index + 1}. ${rider.user.name}`);
            console.log(`   Email: ${rider.user.email}`);
            console.log(`   Status: ${rider.user.status}`);
            console.log(`   Vehicle: ${rider.vehicleType || 'Not set'}`);
            console.log(`   Can Login: ${rider.user.status !== 'SUSPENDED' ? 'YES' : 'NO (SUSPENDED)'}`);
            console.log(`   Can See Tasks: ${rider.user.status === 'ACTIVE' ? 'YES' : 'NO'}`);
            console.log('');
        });

        console.log(`Total Riders: ${riders.length}`);
        console.log(`Active: ${riders.filter(r => r.user.status === 'ACTIVE').length}`);
        console.log(`Inactive: ${riders.filter(r => r.user.status === 'INACTIVE').length}`);
        console.log(`Suspended: ${riders.filter(r => r.user.status === 'SUSPENDED').length}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRiderStatus();
