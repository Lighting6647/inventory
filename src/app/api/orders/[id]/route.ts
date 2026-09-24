import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { status } = body; // 'APPROVED' or 'REJECTED'

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { id: orderId } = await context.params;

    // Use transaction if APPROVED to update stock accordingly
    const result = await prisma.$transaction(async (tx: any) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!order) throw new Error('Order not found');
      if (order.status !== 'PENDING') throw new Error('Order is already processed');

      const updatedOrder = await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status }
      });

      if (status === 'APPROVED') {
        for (const item of order.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: { currentStock: product.currentStock + item.quantity }
            });
            const newLot = await tx.lot.create({
              data: {
                batchNumber: `LOT-${updatedOrder.poNumber}-${Date.now().toString().slice(-4)}`,
                initialQty: item.quantity,
                currentQty: item.quantity,
                productId: item.productId,
                poId: updatedOrder.id
              }
            });
            
            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                type: 'IN',
                quantity: item.quantity,
                reference: updatedOrder.poNumber,
                lotId: newLot.id
              }
            });
          }
        }
      }

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to update PO:', error);
    return NextResponse.json({ error: error.message || 'Failed to update PO' }, { status: 500 });
  }
}
