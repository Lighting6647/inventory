import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLineNotify } from '@/lib/lineNotify';

export async function POST(req: Request) {
  try {
    const { items, paymentMethod, cashTendered, customerId, promotionId, discountAmount, pointsUsed } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let subtotalAmount = 0;
    let totalCost = 0;
    const soItems = [];
    const lowStockAlerts = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) continue;
      
      const qty = Number(item.qty);
      if (product.currentStock < qty) {
         return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 });
      }

      subtotalAmount += (qty * product.price);
      totalCost += (qty * product.cost);

      const newStock = product.currentStock - qty;
      await prisma.product.update({
        where: { id: product.id },
        data: { currentStock: newStock }
      });

      if (newStock <= product.minStockLevel) {
        lowStockAlerts.push(`- ${product.name} (เหลือ ${newStock} ${product.unit})`);
      }

      await prisma.inventoryTransaction.create({
        data: { type: 'OUT', quantity: qty, reference: 'POS Sale', productId: product.id }
      });

      soItems.push({ productId: product.id, quantity: qty, unitPrice: product.price });
    }

    const finalDiscount = Number(discountAmount || 0) + Number(pointsUsed || 0);
    const totalAmount = Math.max(0, subtotalAmount - finalDiscount);
    const change = (Number(cashTendered) || 0) - totalAmount;

    let pointsEarned = 0;
    
    // Loyalty Point logic: e.g. every 100 Baht = 1 Point
    if (customerId) {
      pointsEarned = Math.floor(totalAmount / 100);
      
      const cust = await prisma.customer.findUnique({ where: { id: customerId }});
      if (cust) {
        const newPoints = Math.max(0, cust.points - Number(pointsUsed || 0) + pointsEarned);
        await prisma.customer.update({
          where: { id: customerId },
          data: { points: newPoints }
        });
      }
    }

    const soNumber = `POS-${Date.now()}`;

    const order = await prisma.salesOrder.create({
      data: {
        soNumber,
        customerId: customerId || null,
        promotionId: promotionId || null,
        discountAmount: finalDiscount,
        pointsUsed: Number(pointsUsed || 0),
        pointsEarned,
        status: 'COMPLETED',
        totalAmount,
        totalCost,
        paymentMethod: paymentMethod || 'CASH',
        cashTendered: Number(cashTendered) || totalAmount,
        change: change >= 0 ? change : 0,
        items: { create: soItems }
      }
    });

    // LINE Notify logic
    try {
      const lineSetting = await prisma.setting.findUnique({ where: { key: 'LINE_NOTIFY_TOKEN' } });
      if (lineSetting && lineSetting.value) {
        const token = lineSetting.value;
        let notifyMessage = `🔔 มียอดขายใหม่!\nเลขที่: ${soNumber}\nยอดรวม: ฿${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}\nวิธีชำระ: ${paymentMethod}`;
        
        if (totalAmount >= 5000) {
          notifyMessage = `🎉 ยอดขายทะลุเป้า (>=5,000)!\n` + notifyMessage;
        }

        if (lowStockAlerts.length > 0) {
          notifyMessage += `\n\n⚠️ สินค้าใกล้หมดสต๊อก:\n` + lowStockAlerts.join('\n');
        }

        await sendLineNotify(token, notifyMessage);
      }
    } catch(err) {
      console.error('Line Notify failed', err);
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to checkout' }, { status: 500 });
  }
}