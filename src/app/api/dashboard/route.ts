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

    const lowStockList = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: 10
        }
      },
      take: 6,
      orderBy: { currentStock: 'asc' },
      select: {
        id: true,
        name: true,
        sku: true,
        currentStock: true,
        minStockLevel: true,
        price: true,
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

    // Top selling products based on sales order items
    const topSalesItems = await prisma.salesOrderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5,
    });

    const topSellingProducts = await Promise.all(
      topSalesItems.map(async (item) => {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, sku: true, price: true }
        });
        const qty = item._sum?.quantity || 0;
        const price = prod?.price || 0;
        return {
          productId: item.productId,
          name: prod?.name || 'สินค้า',
          sku: prod?.sku || '-',
          soldQty: qty,
          totalRevenue: qty * price,
        };
      })
    );

    return NextResponse.json({
      totalProducts,
      lowStockItems: lowStockCount,
      lowStockList,
      topSellingProducts,
      recentTransactions,
      todaySales: salesTotal,
      todayProfit: profitTotal,
      ordersCount: todaySales.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
