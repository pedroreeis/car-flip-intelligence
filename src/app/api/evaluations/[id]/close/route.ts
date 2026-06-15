import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const actualSalePrice = parseFloat(data.actualSalePrice) || 0;
    
    const evaluation = await prisma.evaluation.findUnique({ where: { id } });
    if (!evaluation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const expenses = await prisma.expense.findMany({ where: { evaluationId: id } });
    const actualCosts = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const preparationNotes = expenses.map(e => `${e.description} (R$ ${e.amount})`).join(', ');
    
    const totalInvestment = (evaluation.askingPrice || 0) + actualCosts;
    const actualProfit = actualSalePrice - totalInvestment;
    const actualRoi = totalInvestment > 0 ? (actualProfit / totalInvestment) * 100 : 0;
    
    // Create ClosedCase
    await prisma.closedCase.create({
      data: {
        evaluationId: id,
        actualSalePrice,
        actualCosts,
        actualProfit,
        actualRoi,
        preparationNotes
      }
    });

    // Update Status to SOLD
    await prisma.evaluation.update({
      where: { id },
      data: { status: 'SOLD' }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
