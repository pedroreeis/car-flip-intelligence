import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(req);
    if (authResult.error) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { id } = await params;
    const data = await req.json();

    const task = await prisma.preparationTask.create({
      data: {
        evaluationId: id,
        title: data.title,
        costEstimate: parseFloat(data.costEstimate) || 0,
        isCompleted: false
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
