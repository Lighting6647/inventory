import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const transactions = await prisma.inventoryTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 most recent for performance
      include: {
        product: true,
        lot: true,
        user: true
      }
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
