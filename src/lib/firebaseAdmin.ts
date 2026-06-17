import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('Firebase Admin initialization failed: NEXT_PUBLIC_FIREBASE_PROJECT_ID is undefined.');
  }

  const serviceAccountParams: any = { projectId };
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccountParams.clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    serviceAccountParams.privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  try {
    if (Object.keys(serviceAccountParams).length > 1 && serviceAccountParams.clientEmail) {
      return initializeApp({
        credential: cert(serviceAccountParams),
        projectId,
      });
    } else {
      return initializeApp({ projectId });
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    throw error;
  }
}

export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const app = getFirebaseAdminApp();
    return getAuth(app).verifyIdToken(token);
  }
};
