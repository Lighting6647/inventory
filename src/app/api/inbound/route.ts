import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { barcode, categoryName, quantity, cost, price } = await req.json();

    if (!barcode || !quantity) {
      return NextResponse.json({ error: 'Missing barcode or quantity' }, { status: 400 });
    }

    const qty = Number(quantity);
    if (qty <= 0) return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 });

    const c = Number(cost) || 0;
    const p = Number(price) || 0;

    let categoryId = null;
    if (categoryName && categoryName.trim() !== '') {
      const cat = await prisma.category.upsert({
        where: { name: categoryName.trim() },
        update: {},
        create: { name: categoryName.trim() }
      });
      categoryId = cat.id;
    }

    let product = await prisma.product.findUnique({
      where: { sku: barcode } // Assume barcode = sku for simplicity in this system
    });

    if (!product) {
      // Create new product
      product = await prisma.product.create({
        data: {
          sku: barcode,
          barcode: barcode,
          name: `Product ${barcode}`, // Placeholder name
          categoryId: categoryId,
          currentStock: qty,
          cost: c,
          price: p
        }
      });
    } else {
      // Update existing product
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          currentStock: product.currentStock + qty,
          categoryId: categoryId || product.categoryId,
          cost: c > 0 ? c : product.cost,
          price: p > 0 ? p : product.price
        }
      });
    }

    // Create a Lot for FIFO
    const lot = await prisma.lot.create({
      data: {
        batchNumber: `INB-${Date.now()}`,
        productId: product.id,
        initialQty: qty,
        currentQty: qty
      }
    });

    // Record Transaction
    await prisma.inventoryTransaction.create({
      data: {
        type: 'IN',
        quantity: qty,
        reference: 'Inbound Scan',
        productId: product.id,
        lotId: lot.id
      }
    });

    return NextResponse.json({ message: 'Success', product });
  } catch (error: any) {
    console.error('Inbound error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process inbound' }, { status: 500 });
  }
}
