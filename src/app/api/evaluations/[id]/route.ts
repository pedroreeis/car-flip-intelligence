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
      include: { vehicle: true, tasks: { orderBy: { createdAt: 'asc' } } }
    });
    
    if (!evaluation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    return NextResponse.json(evaluation);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(req);
    if (authResult.error) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { id } = await params;
    
    // Deletar as tarefas aninhadas primeiro se houver
    await prisma.preparationTask.deleteMany({
      where: { evaluationId: id }
    });

    await prisma.evaluation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(req);
    if (authResult.error) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { id } = await params;
    const data = await req.json();

    const updateData: any = {};
    if (data.inventoryStage) updateData.inventoryStage = data.inventoryStage;

    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
