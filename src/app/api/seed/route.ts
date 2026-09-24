import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Clear existing data
    await prisma.purchaseOrderItem.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.inventoryTransaction.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: 'password123',
        role: 'ADMIN',
      }
    });

    const staff = await prisma.user.create({
      data: {
        username: 'staff_somchai',
        password: 'password123',
        role: 'STAFF',
      }
    });

    // Create Products (Thai Steel)
    const productsData = [
      { sku: 'RB6-SR24', name: 'เหล็กเส้นกลม RB6', grade: 'SR24', size: '6mm', length: 10, unit: 'เส้น', currentStock: 1500, minStockLevel: 500, price: 55 },
      { sku: 'RB9-SR24', name: 'เหล็กเส้นกลม RB9', grade: 'SR24', size: '9mm', length: 10, unit: 'เส้น', currentStock: 800, minStockLevel: 300, price: 120 },
      { sku: 'DB12-SD40', name: 'เหล็กข้ออ้อย DB12', grade: 'SD40', size: '12mm', length: 10, unit: 'เส้น', currentStock: 1200, minStockLevel: 400, price: 210 },
      { sku: 'DB16-SD40', name: 'เหล็กข้ออ้อย DB16', grade: 'SD40', size: '16mm', length: 10, unit: 'เส้น', currentStock: 600, minStockLevel: 200, price: 380 },
      { sku: 'DB20-SD50', name: 'เหล็กข้ออ้อย DB20', grade: 'SD50', size: '20mm', length: 12, unit: 'เส้น', currentStock: 150, minStockLevel: 100, price: 650 },
      { sku: 'HBEAM-100', name: 'เหล็กเอชบีม 100x100', grade: 'SS400', size: '100x100mm', length: 6, unit: 'ท่อน', currentStock: 45, minStockLevel: 20, price: 2500 },
      { sku: 'IBEAM-150', name: 'เหล็กไอบีม 150x75', grade: 'SS400', size: '150x75mm', length: 6, unit: 'ท่อน', currentStock: 30, minStockLevel: 15, price: 3200 },
      { sku: 'PLATE-4.5', name: 'เหล็กแผ่นดำ 4.5มม', grade: 'SS400', size: '4x8ft', length: 0, unit: 'แผ่น', currentStock: 120, minStockLevel: 50, price: 1850 },
      { sku: 'C-75', name: 'เหล็กตัวซี 75x45x15', grade: 'SSC400', size: '75x45mm', length: 6, unit: 'เส้น', currentStock: 340, minStockLevel: 150, price: 310 },
      { sku: 'PIPE-2', name: 'ท่อกลมดำ 2 นิ้ว', grade: 'SS400', size: '2"', length: 6, unit: 'เส้น', currentStock: 80, minStockLevel: 100, price: 750 }, // Low stock intentionally
    ];

    const createdProducts = [];
    for (const p of productsData) {
      const prod = await prisma.product.create({ data: p });
      createdProducts.push(prod);
      
      // Initial stock transaction
      await prisma.inventoryTransaction.create({
        data: {
          productId: prod.id,
          type: 'IN',
          quantity: p.currentStock,
          reference: 'ยอดยกมา (Initial Seed)',
          userId: admin.id
        }
      });
    }

    // Create Purchase Orders
    const pipe2 = createdProducts.find(p => p.sku === 'PIPE-2');
    const hbeam = createdProducts.find(p => p.sku === 'HBEAM-100');
    
    if (pipe2 && hbeam) {
      await prisma.purchaseOrder.create({
        data: {
          poNumber: 'PO-202607-001',
          status: 'PENDING',
          createdById: staff.id,
          items: {
            create: [
              { productId: pipe2.id, quantity: 200, unitPrice: 700 },
              { productId: hbeam.id, quantity: 50, unitPrice: 2400 }
            ]
          }
        }
      });

      await prisma.purchaseOrder.create({
        data: {
          poNumber: 'PO-202607-002',
          status: 'APPROVED',
          createdById: staff.id,
          approvedById: admin.id,
          items: {
            create: [
              { productId: createdProducts[0].id, quantity: 1000, unitPrice: 50 }
            ]
          }
        }
      });
    }

    return NextResponse.json({ message: 'Database seeded successfully with Thai steel trading data.' });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message || 'Failed to seed DB' }, { status: 500 });
  }
}
