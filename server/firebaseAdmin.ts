import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

try {
  if (getApps().length === 0) {
    initializeApp();
    console.log('✅ Firebase Admin SDK initialized successfully.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error);
}

export const db = getApps().length > 0 ? getFirestore() : null;
export const auth = getApps().length > 0 ? getAuth() : null;
