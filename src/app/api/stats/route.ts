import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activeOps = await prisma.evaluation.count({
      where: {
        status: {
          notIn: ['SOLD', 'IN_STOCK', 'REJECTED']
        }
      }
    });

    const closedCases = await prisma.closedCase.findMany({
      select: { actualRoi: true }
    });

    const avgRoi = closedCases.length > 0 
      ? closedCases.reduce((acc, curr) => acc + curr.actualRoi, 0) / closedCases.length 
      : 0;

    return NextResponse.json({ activeOps, avgRoi });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
