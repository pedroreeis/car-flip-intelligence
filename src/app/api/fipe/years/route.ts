import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

const FIPE_BASE_URL = 'https://fipe.parallelum.com.br/api/v2/cars';

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const brandCode = searchParams.get('brandCode');
    const modelCode = searchParams.get('modelCode');

    if (!brandCode || !modelCode) {
      return NextResponse.json({ error: 'brandCode and modelCode are required' }, { status: 400 });
    }

    const token = process.env.NEXT_PUBLIC_FIPE_API_KEY;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${FIPE_BASE_URL}/brands/${brandCode}/models/${modelCode}/years`, { headers, cache: 'force-cache' });
    if (!res.ok) {
      throw new Error(`FIPE API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fipe Years Error:', error.message);
    return NextResponse.json({ error: 'Falha ao buscar anos da Fipe' }, { status: 500 });
  }
}
