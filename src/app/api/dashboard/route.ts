import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalProducts = await prisma.product.count();
    const lowStockCount = await prisma.product.count({
      where: {
        currentStock: {
          lte: 10
        }
      }
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySales = await prisma.salesOrder.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: 'COMPLETED'
      }
    });

    const salesTotal = todaySales.reduce((sum, order) => sum + order.totalAmount, 0);
    const costTotal = todaySales.reduce((sum, order) => sum + order.totalCost, 0);
    const profitTotal = salesTotal - costTotal;

    const recentTransactions = await prisma.inventoryTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { product: true }
    });

    return NextResponse.json({
      totalProducts,
      lowStockItems: lowStockCount,
      recentTransactions,
      todaySales: salesTotal,
      todayProfit: profitTotal,
      ordersCount: todaySales.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
