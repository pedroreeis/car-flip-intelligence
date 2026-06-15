import { NextResponse } from 'next/server';
import { adminAuth } from './firebaseAdmin';

export async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', status: 401 };
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { uid: decodedToken.uid };
  } catch (error) {
    console.error('Error verifying Firebase token', error);
    return { error: 'Unauthorized', status: 401 };
  }
}
