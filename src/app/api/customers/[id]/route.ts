import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = await prisma.customer.update({
      where: { id: params.id },
      data: { name: body.name, phone: body.phone, email: body.email, points: body.points }
    });
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.customer.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}