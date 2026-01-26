const { PrismaClient, UserRole, ProductType, WaterType } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Cleanup existing data
  await prisma.delivery.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.deliveryRider.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  // 2. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mariclaire.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      phone: '09123456789'
    }
  })
  console.log('Created Admin:', admin.email)

  // 3. Create Delivery Riders
  const riderPassword = await bcrypt.hash('rider123', 10)

  // Rider 1
  const rider1User = await prisma.user.create({
    data: {
      email: 'rider1@mariclaire.com',
      passwordHash: riderPassword,
      name: 'Juan Rider',
      role: UserRole.DELIVERY,
      phone: '09987654321'
    }
  })

  await prisma.deliveryRider.create({
    data: {
      userId: rider1User.id,
      vehicleType: 'Motorcycle',
      plateNumber: 'ABC-123'
    }
  })

  // Rider 2
  const rider2User = await prisma.user.create({
    data: {
      email: 'rider2@mariclaire.com',
      passwordHash: riderPassword,
      name: 'Pedro Trucker',
      role: UserRole.DELIVERY,
      phone: '09111111111'
    }
  })

  await prisma.deliveryRider.create({
    data: {
      userId: rider2User.id,
      vehicleType: 'Delivery Truck',
      plateNumber: 'TRK-987'
    }
  })

  console.log('Created Riders:', rider1User.email, rider2User.email)

  // 4. Create Products (MVP Scope)

  // Water Refill (Service)
  const refillProduct = await prisma.product.create({
    data: {
      name: 'Water Refill (5 Gallon)',
      description: 'Standard mineral water refill for 5-gallon container',
      type: ProductType.WATER,
      waterType: WaterType.MINERAL,
      price: 25.00,
      unit: '5-gallon',
      inventory: {
        create: {
          currentStock: 9999,
          minStock: 0
        }
      }
    }
  })

  // New Container (Product)
  const containerProduct = await prisma.product.create({
    data: {
      name: 'New 5-Gallon Container (with Water)',
      description: 'Brand new 5-gallon round container filled with mineral water',
      type: ProductType.CONTAINER,
      price: 250.00,
      unit: 'piece',
      inventory: {
        create: {
          currentStock: 50,
          minStock: 10
        }
      }
    }
  })

  // 1 Liter Mineral Water (Product)
  const bottleProduct = await prisma.product.create({
    data: {
      name: 'Mineral Water (1 Liter)',
      description: 'Bottled mineral water',
      type: ProductType.WATER,
      waterType: WaterType.MINERAL,
      price: 20.00,
      unit: 'bottle',
      inventory: {
        create: {
          currentStock: 100,
          minStock: 20
        }
      }
    }
  })
  console.log('Created Products:', refillProduct.name, containerProduct.name)

  // 5. Create Sample Customers
  const customerPassword = await bcrypt.hash('user123', 10)
  const areas = ['Zone 1', 'Lipata', 'Buray']

  for (let i = 0; i < 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: `customer${i + 1}@gmail.com`,
        passwordHash: customerPassword,
        name: `Customer ${i + 1}`,
        role: UserRole.CUSTOMER,
        phone: `0900000000${i}`
      }
    })

    await prisma.customer.create({
      data: {
        userId: user.id,
        barangay: areas[i],
        address: `Block ${i + 1} Lot ${i + 1}, Sample Street`
      }
    })
  }
  console.log('Created 3 Sample Customers')

  console.log('✅ Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
