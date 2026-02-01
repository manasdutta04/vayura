import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we have a valid config
const isConfigured = !!firebaseConfig.apiKey;

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 
    ? (isConfigured ? initializeApp(firebaseConfig) : initializeApp({ apiKey: "fake-key", projectId: "fake-project" }))
    : getApp();

// Auth instance
let auth;
try {
    auth = getAuth(app);
} catch {
    console.warn('Firebase Auth: Configuration not found - auth features disabled');
    // Create a mock auth object to prevent crashes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    auth = null as any;
}

export { auth };

// Storage instance
export const storage = getStorage(app);

// Firestore database instance
export const db = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();

export default app;
