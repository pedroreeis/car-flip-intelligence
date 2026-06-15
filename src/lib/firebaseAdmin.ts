import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  try {
    const serviceAccountParams: any = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccountParams.clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      serviceAccountParams.privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    }

    if (Object.keys(serviceAccountParams).length > 1) {
      initializeApp({
        credential: cert(serviceAccountParams),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      // Just Project ID is enough for verifyIdToken
      initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminAuth = getAuth();
