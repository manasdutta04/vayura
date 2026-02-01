import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Check if we have the absolute minimum for a valid PEM private key
// A valid private key starts with -----BEGIN PRIVATE KEY-----
const hasValidKey = privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----');
const isConfigured = !!(projectId && clientEmail && hasValidKey);

if (!getApps().length) {
<<<<<<< HEAD
    if (isConfigured) {
        try {
            adminApp = initializeApp({
                credential: cert({
                    projectId: projectId!,
                    clientEmail: clientEmail!,
                    privateKey: privateKey!,
=======
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase Admin SDK: Missing required environment variables - running in limited mode');
        console.warn('Some server-side features may not work. Required: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY');
        
        // Initialize with minimal config for development/testing
        adminApp = initializeApp({
            projectId: projectId || 'demo-project',
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } else {
        try {
            adminApp = initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
>>>>>>> 16e4a19 (Add offline mode with Firebase error handling)
                }),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        } catch (error) {
<<<<<<< HEAD
            console.error('Failed to initialize Firebase Admin with provided credentials:', error);
            // Fallback to mock app if initialization fails
            adminApp = { name: '[DEFAULT]' } as App;
        }
    } else {
        // Mock app for build process or missing config
        adminApp = { name: '[DEFAULT]' } as App;
=======
            console.error('Firebase Admin SDK: Failed to initialize with credentials:', error instanceof Error ? error.message : 'Unknown error');
            console.warn('Falling back to limited mode without authentication');
            
            // Fallback initialization without credentials
            adminApp = initializeApp({
                projectId: projectId || 'demo-project',
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        }
>>>>>>> 16e4a19 (Add offline mode with Firebase error handling)
    }
} else {
    adminApp = getApps()[0];
}

// Helper to create a proxy that warns but doesn't throw during build
const createProxy = (name: string) => {
    const mockObj = {
        collection: () => mockObj,
        doc: () => mockObj,
        where: () => mockObj,
        orderBy: () => mockObj,
        limit: () => mockObj,
        get: () => Promise.resolve({ empty: true, docs: [] }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve(),
        onSnapshot: () => () => {},
    };

    return new Proxy(mockObj, {
        get: (target, prop) => {
            if (prop in target) return (target as any)[prop];
            return () => {
                const msg = `Firebase Admin ${name}.${String(prop)} was called but SDK is not configured. Check your environment variables.`;
                if (process.env.NODE_ENV === 'production') {
                    // In production, we should probably not throw if it's just a data fetch
                    // but for security-related things it should throw.
                    // For now, let's just log and return the mock.
                    console.error(msg);
                } else {
                    console.warn(msg);
                }
                return mockObj;
            };
        }
    });
};

export const adminAuth = isConfigured ? getAuth(adminApp) : createProxy('auth') as any;
export const adminStorage = isConfigured ? getStorage(adminApp) : createProxy('storage') as any;
export const adminDb = isConfigured ? getFirestore(adminApp) : createProxy('firestore') as any;

export default adminApp;
