import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await prisma.promotion.create({
      data: {
        code: body.code,
        name: body.name,
        discountType: body.discountType,
        discountValue: body.discountValue,
        isActive: body.isActive
      }
    });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
