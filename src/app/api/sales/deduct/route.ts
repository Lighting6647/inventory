import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sku, quantity, saleReference } = body;

    if (!sku || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findUnique({
        where: { sku }
      });

      if (!product) {
        throw new Error(`Product with SKU ${sku} not found`);
      }

      if (product.currentStock < quantity) {
        throw new Error(`Insufficient stock for ${sku}`);
      }

      // Fetch lots ordered by createdAt ASC for FIFO
      const lots = await tx.lot.findMany({
        where: {
          productId: product.id,
          currentQty: { gt: 0 }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      let remainingQuantityToDeduct = quantity;
      const transactions = [];

      for (const lot of lots) {
        if (remainingQuantityToDeduct <= 0) break;

        const deductFromLot = Math.min(lot.currentQty, remainingQuantityToDeduct);
        
        await tx.lot.update({
          where: { id: lot.id },
          data: { currentQty: lot.currentQty - deductFromLot }
        });

        const transaction = await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            lotId: lot.id,
            type: 'OUT',
            quantity: deductFromLot,
            reference: saleReference || 'External Sale'
          }
        });

        transactions.push(transaction);
        remainingQuantityToDeduct -= deductFromLot;
      }

      // If we still have remaining quantity (meaning lots were less than currentStock),
      // we just deduct normally without a lot (fallback for old stock)
      if (remainingQuantityToDeduct > 0) {
        const transaction = await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: 'OUT',
            quantity: remainingQuantityToDeduct,
            reference: saleReference || 'External Sale'
          }
        });
        transactions.push(transaction);
      }

      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          currentStock: product.currentStock - quantity
        }
      });

      return { product: updatedProduct, transactions };
    });

    return NextResponse.json({
      message: 'Stock deducted successfully (FIFO applied)',
      result
    });
  } catch (error: any) {
    console.error('Failed to deduct stock via Sales API:', error);
    return NextResponse.json({ error: error.message || 'Failed to deduct stock' }, { status: 500 });
  }
}
