import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  try {
    const authModule = require('firebase/auth') as {
      getReactNativePersistence: (
        storage: typeof AsyncStorage,
      ) => unknown;
    };
    await setPersistence(
      auth,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authModule.getReactNativePersistence(AsyncStorage) as any,
    );
  } catch {
    // Persistence setup failed; auth state will be in-memory only
  }
})();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');
