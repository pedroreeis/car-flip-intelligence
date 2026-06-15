import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

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

