import { initializeApp, getApps, getApp, setLogLevel } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// Parse or load config safely
const firebaseConfig = {
  apiKey: "AIzaSyAnAZ6rZjcI8eHzawmgf11mUcV8FoQA97Q",
  authDomain: "hybrid-shore-q7c1c.firebaseapp.com",
  projectId: "hybrid-shore-q7c1c",
  storageBucket: "hybrid-shore-q7c1c.firebasestorage.app",
  messagingSenderId: "207536779687",
  appId: "1:207536779687:web:df481c5c67df5a6281c682"
};

// Set silent log level to suppress harmless offline/reconnect connection warnings
try {
  setLogLevel('silent');
} catch (e) {
  // ignore
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

import { enableIndexedDbPersistence } from 'firebase/firestore';

// Initialize Firestore with offline caching
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  });
  enableIndexedDbPersistence(firestoreDb).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open, offline persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable offline persistence.');
    }
  });
} catch (e) {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;

export default app;

