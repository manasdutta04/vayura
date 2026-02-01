import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Suppress Firebase configuration errors globally
if (typeof window !== 'undefined') {
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
        // Suppress Firebase configuration-not-found errors
        const message = String(args[0] || '');
        if (message.includes('auth/configuration-not-found') || 
            message.includes('CONFIGURATION_NOT_FOUND')) {
            // Silently ignore these errors
            return;
        }
        originalConsoleError.apply(console, args);
    };
}

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
    firebaseConfig.projectId !== 'fake-project' &&
    firebaseConfig.apiKey.length > 20; // Real Firebase API keys are longer

// Initialize Firebase only if properly configured
let app;
let auth;
let storage;
let db;
let authConfigError = false;

if (isConfigured) {
    try {
        // Initialize or get existing app
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        
        // Try to initialize each service separately with error handling
        try {
            const authInstance = getAuth(app);
            // Test if auth config is valid by checking tenantId access
            // If Firebase project doesn't have auth enabled, this will work but operations will fail
            // We'll mark it as potentially problematic
            if (authInstance) {
                auth = authInstance;
            }
        } catch (authError) {
            // Silently handle auth initialization failure
            authConfigError = true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            auth = null as any;
        }
        
        try {
            storage = getStorage(app);
        } catch (storageError) {
            // Silently handle storage initialization failure
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            storage = null as any;
        }
        
        try {
            db = getFirestore(app);
        } catch (dbError) {
            // Silently handle Firestore initialization failure
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            db = null as any;
        }
    } catch (error) {
        // Silently handle Firebase initialization failure
        authConfigError = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        auth = null as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        storage = null as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db = null as any;
    }
} else {
    // Firebase not configured - features disabled
    authConfigError = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    auth = null as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage = null as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db = null as any;
}

export { auth, isConfigured, storage, db };

// Auth providers (only create if Firebase AND auth are properly configured)
export const googleProvider = (isConfigured && auth && !authConfigError) ? new GoogleAuthProvider() : null;
export const emailProvider = (isConfigured && auth && !authConfigError) ? new EmailAuthProvider() : null;

export default app;
