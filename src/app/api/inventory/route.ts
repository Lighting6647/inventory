import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: {
        lots: {
          where: { currentQty: { gt: 0 } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (products.length === 0 && (await prisma.user.count()) === 0) {
      await prisma.user.create({ data: { username: 'admin', password: 'password123', role: 'ADMIN' } });
      const initialProducts = [
        { sku: 'RB6-SR24', name: 'เหล็กเส้นกลม RB6', grade: 'SR24', size: '6mm', length: 10, unit: 'เส้น', currentStock: 1500, minStockLevel: 500, cost: 40, price: 55 },
        { sku: 'RB9-SR24', name: 'เหล็กเส้นกลม RB9', grade: 'SR24', size: '9mm', length: 10, unit: 'เส้น', currentStock: 800, minStockLevel: 300, cost: 90, price: 120 },
        { sku: 'DB12-SD40', name: 'เหล็กข้ออ้อย DB12', grade: 'SD40', size: '12mm', length: 10, unit: 'เส้น', currentStock: 1200, minStockLevel: 400, cost: 160, price: 210 },
        { sku: 'DB16-SD40', name: 'เหล็กข้ออ้อย DB16', grade: 'SD40', size: '16mm', length: 10, unit: 'เส้น', currentStock: 600, minStockLevel: 200, cost: 300, price: 380 },
        { sku: 'HBEAM-100', name: 'เหล็กเอชบีม 100x100', grade: 'SS400', size: '100x100mm', length: 6, unit: 'ท่อน', currentStock: 45, minStockLevel: 20, cost: 2000, price: 2500 },
        { sku: 'PIPE-2', name: 'ท่อกลมดำ 2 นิ้ว', grade: 'SS400', size: '2"', length: 6, unit: 'เส้น', currentStock: 80, minStockLevel: 100, cost: 600, price: 750 },
      ];
      for (const p of initialProducts) {
        await prisma.product.create({ data: p });
      }
      const seeded = await prisma.product.findMany({ orderBy: { name: 'asc' }, include: { lots: { where: { currentQty: { gt: 0 } }, orderBy: { createdAt: 'asc' } } } });
      return NextResponse.json(seeded);
    }
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, newStock, reason } = body;

    if (!productId || newStock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');

      const difference = newStock - product.currentStock;
      
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      if (difference > 0) {
        // Stock increased -> Create an adjustment lot
        const adjustLot = await tx.lot.create({
          data: {
            batchNumber: `ADJ-${Date.now().toString().slice(-4)}`,
            initialQty: difference,
            currentQty: difference,
            productId: productId
          }
        });

        await tx.inventoryTransaction.create({
          data: {
            productId,
            type: 'ADJUST',
            quantity: difference,
            reference: reason || 'Physical Count (Gain)',
            lotId: adjustLot.id
          }
        });
      } else if (difference < 0) {
        // Stock decreased -> FIFO Lot Deduction
        let remainingQuantityToDeduct = Math.abs(difference);
        const lots = await tx.lot.findMany({
          where: { productId, currentQty: { gt: 0 } },
          orderBy: { createdAt: 'asc' }
        });

        for (const lot of lots) {
          if (remainingQuantityToDeduct <= 0) break;

          const deductFromLot = Math.min(lot.currentQty, remainingQuantityToDeduct);
          
          await tx.lot.update({
            where: { id: lot.id },
            data: { currentQty: lot.currentQty - deductFromLot }
          });

          await tx.inventoryTransaction.create({
            data: {
              productId,
              lotId: lot.id,
              type: 'ADJUST',
              quantity: -deductFromLot,
              reference: reason || 'Physical Count (Loss)'
            }
          });

          remainingQuantityToDeduct -= deductFromLot;
        }

        if (remainingQuantityToDeduct > 0) {
          // If no lots covered it all, just record the rest without a lot
          await tx.inventoryTransaction.create({
            data: {
              productId,
              type: 'ADJUST',
              quantity: -remainingQuantityToDeduct,
              reference: reason || 'Physical Count (Loss)'
            }
          });
        }
      } else {
        // No change, just log
        await tx.inventoryTransaction.create({
          data: {
            productId,
            type: 'ADJUST',
            quantity: 0,
            reference: reason || 'Physical Count (No Change)'
          }
        });
      }

      return { product: updatedProduct };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to update inventory:', error);
    return NextResponse.json({ error: error.message || 'Failed to update inventory' }, { status: 500 });
  }
}
