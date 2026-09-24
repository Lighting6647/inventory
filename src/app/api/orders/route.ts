import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        items: {
          include: { product: true }
        }
      }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, supplierId } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const newPo = await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-${Date.now()}`,
        supplierId: supplierId || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(newPo);
  } catch (error: any) {
    console.error('Failed to create PO:', error);
    return NextResponse.json({ error: error.message || 'Failed to create PO' }, { status: 500 });
  }
}
