import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Motor Financeiro v1
    const askingPrice = parseFloat(data.askingPrice) || 0;
    const fipePrice = parseFloat(data.fipePrice) || 0;
    const estimatedSalePrice = parseFloat(data.estimatedSalePrice) || 0;
    
    let costs = 1000; // Custo base (docs/transporte no MVP)
    if (!data.estruturaOk) costs += 5000;
    if (!data.mecanicaOk) costs += 3000;
    
    const totalInvestment = askingPrice + costs;
    const estimatedProfit = estimatedSalePrice - totalInvestment;
    const estimatedRoi = totalInvestment > 0 ? (estimatedProfit / totalInvestment) * 100 : 0;
    
    // Motor de Risco & Atratividade
    let riskScore = 10;
    if (data.docLeilao) riskScore += 50;
    if (data.docSinistro) riskScore += 30;
    if (!data.estruturaOk) riskScore += 20;
    
    let attractivenessScore = Math.min(100, Math.max(0, (estimatedRoi * 2) - (riskScore / 2)));
    
    let recommendation = 'NEGOCIAR';
    if (attractivenessScore > 60 && riskScore < 40) recommendation = 'COMPRAR';
    if (riskScore >= 50) recommendation = 'ALTO RISCO - NÃO COMPRAR';
    if (estimatedRoi < 10) recommendation = 'NÃO COMPRAR (BAIXA MARGEM)';
    
    // Get or create user
    let dbUser = await prisma.user.findUnique({ where: { firebaseUid: data.userId } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          firebaseUid: data.userId,
          email: `${data.userId}@cfi.com`,
          name: 'Operador',
        }
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        brand: data.brand || 'Desconhecida',
        model: data.model || 'Desconhecido',
        year: parseInt(data.year) || 2000,
        vin: data.vin || null,
      }
    });

    const evalRecord = await prisma.evaluation.create({
      data: {
        userId: dbUser.id,
        vehicleId: vehicle.id,
        origin: data.origin,
        adLink: data.adLink,
        askingPrice,
        fipePrice,
        estimatedSalePrice,
        totalInvestment,
        estimatedProfit,
        estimatedRoi,
        riskScore,
        attractivenessScore,
        predictionConfidence: 65, // Fixo para o MVP
        recommendation,
        documentation: { leilao: data.docLeilao, sinistro: data.docSinistro, restricao: data.docRestricao },
        structure: { ok: data.estruturaOk },
        mechanics: { ok: data.mecanicaOk },
      }
    });

    return NextResponse.json({ id: evalRecord.id });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar avaliação' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const evaluations = await prisma.evaluation.findMany({
      include: { vehicle: true, closedCase: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(evaluations);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}
