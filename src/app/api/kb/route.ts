import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const context = searchParams.get('context');
    const q = searchParams.get('q') || '';

    if (!category) {
      // Se não passar categoria, retorna tudo (útil para a página de gerenciamento)
      const items = await prisma.knowledgeBaseItem.findMany({
        orderBy: [{ category: 'asc' }, { usageCount: 'desc' }]
      });
      return NextResponse.json(items);
    }

    const whereClause: any = {
      category,
      value: {
        contains: q,
        mode: 'insensitive'
      }
    };

    if (context) {
      whereClause.context = context;
    }

    // Busca itens da categoria, filtrando pelo termo (case-insensitive)
    const items = await prisma.knowledgeBaseItem.findMany({
      where: whereClause,
      orderBy: {
        usageCount: 'desc'
      },
      take: 10 // Limita a 10 sugestões para o autocomplete
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('KB GET error:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados da base de conhecimento' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const data = await request.json();
    const { category, value, context } = data;

    if (!category || !value) {
      return NextResponse.json({ error: 'Categoria e Valor são obrigatórios' }, { status: 400 });
    }

    const trimmedValue = value.trim();
    
    const whereClause: any = {
      category,
      value: {
        equals: trimmedValue,
        mode: 'insensitive'
      }
    };
    if (context) {
      whereClause.context = context;
    }

    // Busca se já existe
    let item = await prisma.knowledgeBaseItem.findFirst({
      where: whereClause
    });

    if (item) {
      // Se existe, incrementa o uso
      item = await prisma.knowledgeBaseItem.update({
        where: { id: item.id },
        data: { usageCount: item.usageCount + 1 }
      });
    } else {
      // Se não existe, cria um novo
      item = await prisma.knowledgeBaseItem.create({
        data: {
          category,
          value: trimmedValue,
          context: context || null,
          usageCount: 1
        }
      });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('KB POST error:', error);
    return NextResponse.json({ error: 'Erro ao salvar na base de conhecimento' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
       return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    await prisma.knowledgeBaseItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KB DELETE error:', error);
    return NextResponse.json({ error: 'Erro ao deletar item' }, { status: 500 });
  }
}
