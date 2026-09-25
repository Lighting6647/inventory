import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, sku, barcode, categoryId, cost, price, unit, currentStock, minStockLevel } = await req.json();

    if (!name || !sku) {
      return NextResponse.json({ error: 'Name and SKU are required' }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode: barcode || null,
        categoryId: categoryId || null,
        cost: Number(cost) || 0,
        price: Number(price) || 0,
        unit: unit || 'pcs',
        currentStock: Number(currentStock) || 0,
        minStockLevel: Number(minStockLevel) || 10
      }
    });

    if (product.currentStock > 0) {
      const lot = await prisma.lot.create({
        data: {
          batchNumber: `MANUAL-${Date.now()}`,
          productId: product.id,
          initialQty: product.currentStock,
          currentQty: product.currentStock
        }
      });
      await prisma.inventoryTransaction.create({
        data: {
          type: 'IN',
          quantity: product.currentStock,
          reference: 'Manual Initial Stock',
          productId: product.id,
          lotId: lot.id
        }
      });
    }

    return NextResponse.json({ message: 'Product created', product });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
