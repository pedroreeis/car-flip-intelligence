import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: { vehicle: true }
    });
    
    if (!evaluation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    return NextResponse.json(evaluation);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
