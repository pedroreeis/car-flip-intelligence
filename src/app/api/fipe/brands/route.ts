import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

const FIPE_BASE_URL = 'https://fipe.parallelum.com.br/api/v2/cars';

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const token = process.env.NEXT_PUBLIC_FIPE_API_KEY;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${FIPE_BASE_URL}/brands`, { headers, cache: 'force-cache' });
    if (!res.ok) {
      throw new Error(`FIPE API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fipe Brands Error:', error.message);
    return NextResponse.json({ error: 'Falha ao buscar marcas da Fipe' }, { status: 500 });
  }
}
