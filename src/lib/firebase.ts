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

// Check if we have a valid config (not just placeholder values)
const isConfigured = 
    !!firebaseConfig.apiKey && 
    !!firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your-api-key-here' &&
    firebaseConfig.apiKey !== 'fake-key' &&
    !firebaseConfig.apiKey.startsWith('NEXT_PUBLIC_') &&
    firebaseConfig.projectId !== 'your-project-id' &&
    firebaseConfig.projectId !== 'fake-project';

// Initialize Firebase only if properly configured
let app;
let auth;
let storage;
let db;

if (isConfigured) {
    try {
        // Initialize or get existing app
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        
        // Try to initialize each service separately with error handling
        try {
            auth = getAuth(app);
        } catch (authError) {
            console.warn('Firebase Auth initialization failed:', authError);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            auth = null as any;
        }
        
        try {
            storage = getStorage(app);
        } catch (storageError) {
            console.warn('Firebase Storage initialization failed:', storageError);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            storage = null as any;
        }
        
        try {
            db = getFirestore(app);
        } catch (dbError) {
            console.warn('Firebase Firestore initialization failed:', dbError);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            db = null as any;
        }
        
        if (auth) {
            console.log('Firebase initialized successfully');
        }
    } catch (error) {
        console.warn('Firebase initialization failed:', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        auth = null as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        storage = null as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db = null as any;
    }
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
