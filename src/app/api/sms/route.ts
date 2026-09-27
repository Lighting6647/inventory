import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.smsLog.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Simulate sending SMS
    const data = await prisma.smsLog.create({
      data: { phoneNumber: body.phoneNumber, message: body.message, status: 'SENT' }
    });
    return NextResponse.json({ message: 'SMS Sent', log: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
