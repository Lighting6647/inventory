import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { products } = await req.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid data format. Expected array of products.' }, { status: 400 });
    }

    let successCount = 0;
    let skipCount = 0;

    // Use transaction if we want all-or-nothing, but for imports it's usually better to insert what we can
    // or upsert. Let's use individual upserts to avoid entirely failing the batch if 1 sku exists.
    for (const p of products) {
      if (!p.sku || !p.name) {
        skipCount++;
        continue;
      }

      await prisma.product.upsert({
        where: { sku: String(p.sku) },
        update: {
          name: p.name,
          category: p.category || null,
          brand: p.brand || null,
          unit: p.unit || 'pcs',
          currentStock: Number(p.currentStock) || 0,
          minStockLevel: Number(p.minStockLevel) || 10
        },
        create: {
          sku: String(p.sku),
          name: p.name,
          category: p.category || null,
          brand: p.brand || null,
          unit: p.unit || 'pcs',
          currentStock: Number(p.currentStock) || 0,
          minStockLevel: Number(p.minStockLevel) || 10
        }
      });
      successCount++;
    }

    return NextResponse.json({ 
      message: 'Import completed', 
      successCount, 
      skipCount 
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import products' }, { status: 500 });
  }
}
