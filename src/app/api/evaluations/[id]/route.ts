import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

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
