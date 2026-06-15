import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: { vehicle: true, expenses: true }
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    const { vehicle, mechanics, structure, documentation, expenses } = evaluation;

    // Parse JSON data since it's stored as Json type
    const mecData = typeof mechanics === 'object' && mechanics ? mechanics as any : { ok: true };
    const strData = typeof structure === 'object' && structure ? structure as any : { ok: true };
    const docData = typeof documentation === 'object' && documentation ? documentation as any : { leilao: false, sinistro: false, restricao: false };

    // Building the Ad Copy
    let copy = `🚗 VENDO: ${vehicle.brand} ${vehicle.model} - Ano ${vehicle.year}\n\n`;
    
    copy += `✨ **DESTAQUES:**\n`;
    if (strData.ok) {
      copy += `✅ Estrutura 100% Íntegra (Laudo aprovado)\n`;
    }
    if (mecData.ok) {
      copy += `✅ Mecânica revisada e funcionando perfeitamente\n`;
    }
    if (!docData.leilao && !docData.sinistro) {
      copy += `✅ Sem passagem por leilão ou sinistro\n`;
    }

    if (expenses && expenses.length > 0) {
      copy += `\n🔧 **REVISÕES E MELHORIAS RECENTES:**\n`;
      expenses.forEach((exp: any) => {
        copy += `- ${exp.description}\n`;
      });
    }

    copy += `\n💰 **INVESTIMENTO:** R$ ${(evaluation.estimatedSalePrice || evaluation.askingPrice || 0).toLocaleString()}\n\n`;
    
    copy += `📍 **LOCALIZAÇÃO:** ${vehicle.city || 'A combinar'}\n`;
    if (vehicle.vin) {
      copy += `🔎 Chassi/VIN para consulta: ${vehicle.vin}\n`;
    }

    copy += `\n📲 **Contato:** (Inserir seu número aqui)\n`;
    copy += `\nCarro extremamente conservado, ideal para quem busca procedência e segurança. Tratar direto com o proprietário. Avalio trocas justas.\n`;
    copy += `\n#${vehicle.brand.replace(/\s/g,'')} #${vehicle.model.replace(/\s/g,'')} #CarrosUsados #Seminovos`;

    return NextResponse.json({ copy });

  } catch (error) {
    console.error('Error generating Ad Copy:', error);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
