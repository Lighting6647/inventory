import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Daily Sales
    const dailySalesAgg = await prisma.salesOrder.aggregate({
      where: {
        createdAt: { gte: today },
        status: 'COMPLETED'
      },
      _sum: { totalAmount: true }
    });
    const dailySales = dailySalesAgg._sum.totalAmount || 0;

    // Total Orders (All time)
    const totalOrders = await prisma.salesOrder.count({
      where: { status: 'COMPLETED' }
    });

    // Unique Customers (All time)
    const uniqueCustomers = await prisma.salesOrder.findMany({
      where: { customerName: { not: null } },
      select: { customerName: true },
      distinct: ['customerName']
    });
    const totalCustomers = uniqueCustomers.length;

    return NextResponse.json({
      dailySales,
      totalOrders,
      totalCustomers
    });
  } catch (error: any) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
