const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recoverRiders() {
    try {
        console.log('Starting rider recovery...');

        // Find all users with DELIVERY role
        const deliveryUsers = await prisma.user.findMany({
            where: { role: 'DELIVERY' },
            include: {
                deliveryRider: true
            }
        });

        console.log(`Found ${deliveryUsers.length} delivery users`);

        let recovered = 0;
        let alreadyExists = 0;

        for (const user of deliveryUsers) {
            if (!user.deliveryRider) {
                // Create missing DeliveryRider profile
                await prisma.deliveryRider.create({
                    data: {
                        userId: user.id,
                        vehicleType: 'Tricycle', // Default value
                        plateNumber: null
                    }
                });
                console.log(`✓ Recovered rider profile for: ${user.name} (${user.email})`);
                recovered++;
            } else {
                console.log(`- Rider profile already exists for: ${user.name}`);
                alreadyExists++;
            }
        }

        console.log('\n=== Recovery Complete ===');
        console.log(`Recovered: ${recovered}`);
        console.log(`Already existed: ${alreadyExists}`);
        console.log(`Total delivery users: ${deliveryUsers.length}`);

    } catch (error) {
        console.error('Recovery failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

recoverRiders();
