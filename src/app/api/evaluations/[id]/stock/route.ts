import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const evaluation = await prisma.evaluation.findUnique({ where: { id } });
    if (!evaluation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.evaluation.update({
      where: { id },
      data: { status: 'IN_STOCK' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
