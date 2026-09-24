import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.count({
      where: {
        currentStock: { lte: prisma.product.fields.minStockLevel }
      }
    });
    const pendingOrders = await prisma.purchaseOrder.count({
      where: { status: 'PENDING' }
    });
    const totalSuppliers = await prisma.supplier.count();

    // Recent activity (last 5 txs)
    const recentActivity = await prisma.inventoryTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { product: true }
    });

    return NextResponse.json({
      totalProducts,
      lowStockProducts,
      pendingOrders,
      totalSuppliers,
      recentActivity
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
