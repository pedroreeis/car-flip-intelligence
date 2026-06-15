import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // O Cron (ex: Vercel Cron) fará um GET nesta rota periodicamente.
  
  try {
    // 1. Busca todos os casos encerrados
    const closedCases = await prisma.closedCase.findMany();
    const N = closedCases.length;

    if (N === 0) {
      return NextResponse.json({ message: 'Nenhum caso encerrado ainda. Nada a calcular.' });
    }

    // 2. Calcula médias móveis (avgRoi)
    const sumRoi = closedCases.reduce((acc, curr) => acc + curr.actualRoi, 0);
    const avgRoi = sumRoi / N;

    // 3. Calcula Desvio Padrão
    const variance = closedCases.reduce((acc, curr) => acc + Math.pow(curr.actualRoi - avgRoi, 2), 0) / N;
    const stdDevRoi = Math.sqrt(variance);

    // 4. Salva no Singleton Global
    const metrics = await prisma.statisticalMetrics.upsert({
      where: { id: 'GLOBAL' },
      update: {
        sampleSize: N,
        avgRoi,
        stdDevRoi,
        lastCalculatedAt: new Date(),
      },
      create: {
        id: 'GLOBAL',
        sampleSize: N,
        avgRoi,
        stdDevRoi,
      }
    });

    // 5. Se N > 100, ajusta (simula o ajuste da Prediction Confidence)
    let predictionConfidenceMsg = 'N < 100. Confiança basal.';
    if (N > 100) {
      predictionConfidenceMsg = `N = ${N}. Confiança aumentada baseada no desvio padrão de ${stdDevRoi.toFixed(2)}%.`;
    }

    return NextResponse.json({
      success: true,
      metrics,
      message: predictionConfidenceMsg
    });

  } catch (error) {
    console.error('CRON STATS ERROR:', error);
    return NextResponse.json({ error: 'Falha ao executar rotina estatística' }, { status: 500 });
  }
}
