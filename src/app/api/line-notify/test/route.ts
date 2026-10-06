import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLineNotify } from '@/lib/lineNotify';

export async function POST() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'LINE_NOTIFY_TOKEN' } });
    if (!setting || !setting.value) throw new Error('No Token');
    
    await sendLineNotify(setting.value, '🧪 นี่คือข้อความทดสอบจากระบบ DPOS POS & Inventory!');
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}