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
