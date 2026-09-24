import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

async function main() {
  const p1 = await prisma.product.upsert({
    where: { sku: 'ST-001' },
    update: {},
    create: {
      sku: 'ST-001',
      name: 'เหล็กเส้นกลม',
      grade: 'SR24',
      size: 'RB6',
      unit: 'เส้น',
      currentStock: 150,
      minStockLevel: 50,
      price: 120
    },
  });

  const p2 = await prisma.product.upsert({
    where: { sku: 'ST-002' },
    update: {},
    create: {
      sku: 'ST-002',
      name: 'เหล็กข้ออ้อย',
      grade: 'SD40',
      size: 'DB12',
      unit: 'เส้น',
      currentStock: 40,
      minStockLevel: 100,
      price: 250
    },
  });

  console.log('Seed created successfully:', { p1, p2 });
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
