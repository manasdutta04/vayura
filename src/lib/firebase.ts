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
const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

// Initialize Firebase only if properly configured
let app;
let auth;
let storage;
let db;

if (isConfigured && getApps().length === 0) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        storage = getStorage(app);
        db = getFirestore(app);
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.warn('Firebase initialization failed:', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        auth = null as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        storage = null as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db = null as any;
    }
} else if (isConfigured) {
    app = getApp();
    auth = getAuth(app);
    storage = getStorage(app);
    db = getFirestore(app);
} else {
    console.warn('Firebase configuration not found - Firebase features disabled');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    auth = null as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage = null as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db = null as any;
}

export { auth, isConfigured, storage, db };

// Auth providers (only create if Firebase is configured)
export const googleProvider = isConfigured ? new GoogleAuthProvider() : null;
export const emailProvider = isConfigured ? new EmailAuthProvider() : null;

export default app;
