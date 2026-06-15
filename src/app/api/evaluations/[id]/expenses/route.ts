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
    const expenses = await prisma.expense.findMany({
      where: { evaluationId: id },
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const data = await req.json();
    
    if (!data.description || !data.amount) {
       return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        evaluationId: id,
        description: data.description,
        amount: parseFloat(data.amount)
      }
    });

    // Adiciona/Atualiza na Base de Conhecimento
    const trimmedDesc = data.description.trim();
    if (trimmedDesc) {
      const existingKb = await prisma.knowledgeBaseItem.findFirst({
        where: { category: 'EXPENSE_TYPE', value: { equals: trimmedDesc, mode: 'insensitive' } }
      });
      if (existingKb) {
        await prisma.knowledgeBaseItem.update({
          where: { id: existingKb.id },
          data: { usageCount: existingKb.usageCount + 1 }
        });
      } else {
        await prisma.knowledgeBaseItem.create({
          data: { category: 'EXPENSE_TYPE', value: trimmedDesc, usageCount: 1 }
        });
      }
    }

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
