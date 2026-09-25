import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { items, paymentMethod, cashTendered } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let totalAmount = 0;
    let totalCost = 0;

    // We can't do interactive transactions in standard prisma client easily without interactive transactions preview, 
    // but for sqlite/standard we do multiple awaits. Since it's a simple POS, we will loop and update.
    // In production, we'd use prisma.$transaction
    
    const soItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) continue;
      
      const qty = Number(item.qty);
      if (product.currentStock < qty) {
         return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 });
      }

      const itemTotal = qty * product.price;
      const itemCost = qty * product.cost;
      
      totalAmount += itemTotal;
      totalCost += itemCost;

      // Deduct stock
      await prisma.product.update({
        where: { id: product.id },
        data: { currentStock: product.currentStock - qty }
      });

      // Record transaction
      await prisma.inventoryTransaction.create({
        data: {
          type: 'OUT',
          quantity: qty,
          reference: 'POS Sale',
          productId: product.id
        }
      });

      soItems.push({
        productId: product.id,
        quantity: qty,
        unitPrice: product.price
      });
    }

    const change = (Number(cashTendered) || 0) - totalAmount;

    // Create Receipt / SalesOrder
    const order = await prisma.salesOrder.create({
      data: {
        soNumber: `POS-${Date.now()}`,
        status: 'COMPLETED',
        totalAmount,
        totalCost,
        paymentMethod: paymentMethod || 'CASH',
        cashTendered: Number(cashTendered) || totalAmount,
        change: change >= 0 ? change : 0,
        items: {
          create: soItems
        }
      }
    });

    return NextResponse.json({ message: 'Checkout successful', order });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to checkout' }, { status: 500 });
  }
}
