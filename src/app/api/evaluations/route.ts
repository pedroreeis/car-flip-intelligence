import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

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
    const userId = authResult.uid as string;

    let dbUser = await prisma.user.findUnique({ where: { firebaseUid: userId } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          firebaseUid: userId,
          email: `${userId}@cfi.com`,
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

    // Auto-adicionar à Base de Conhecimento
    const updateKb = async (category: string, val: string, ctx?: string) => {
      const trimmed = val?.trim();
      if (!trimmed) return;

      const whereClause: any = { category, value: { equals: trimmed, mode: 'insensitive' } };
      if (ctx) whereClause.context = ctx;

      const existing = await prisma.knowledgeBaseItem.findFirst({
        where: whereClause
      });
      if (existing) {
        await prisma.knowledgeBaseItem.update({ where: { id: existing.id }, data: { usageCount: existing.usageCount + 1 } });
      } else {
        await prisma.knowledgeBaseItem.create({ data: { category, value: trimmed, context: ctx || null, usageCount: 1 } });
      }
    };

    if (data.brand && data.brand !== 'Desconhecida') await updateKb('BRAND', data.brand);
    if (data.model && data.model !== 'Desconhecido') await updateKb('MODEL', data.model, data.brand);

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
        images: data.images || [],
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

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const evaluations = await prisma.evaluation.findMany({
      include: { vehicle: true, closedCase: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(evaluations);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 });
  }
}
