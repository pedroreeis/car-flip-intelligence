import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(req);
    if (authResult.error) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { id } = await params;
    const data = await req.json();

    const actualSalePrice = parseFloat(data.actualSalePrice) || 0;
    const actualCosts = parseFloat(data.actualCosts) || 0;

    const evaluation = await prisma.evaluation.findUnique({
      where: { id }
    });

    if (!evaluation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const totalInvestment = (evaluation.askingPrice || 0) + actualCosts;
    const actualProfit = actualSalePrice - totalInvestment;
    const actualRoi = totalInvestment > 0 ? (actualProfit / totalInvestment) * 100 : 0;

    // Use a transaction to ensure both records are created/updated consistently
    const result = await prisma.$transaction([
      prisma.closedCase.create({
        data: {
          evaluationId: id,
          actualSalePrice,
          actualCosts,
          actualProfit,
          actualRoi,
          preparationNotes: data.notes || ''
        }
      }),
      prisma.evaluation.update({
        where: { id },
        data: {
          status: 'SOLD'
        }
      })
    ]);

    return NextResponse.json({ success: true, closedCase: result[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
