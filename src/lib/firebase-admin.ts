import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

const isConfigured = !!(projectId && clientEmail && privateKey);

if (!getApps().length) {
    if (isConfigured) {
        adminApp = initializeApp({
            credential: cert({
                projectId: projectId!,
                clientEmail: clientEmail!,
                privateKey: privateKey!,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } else {
        // Mock app for build process
        adminApp = { name: '[DEFAULT]' } as App;
    }
} else {
    adminApp = getApps()[0];
}

// Helper to create a proxy that warns but doesn't throw during build
const createProxy = (name: string) => {
    return new Proxy({}, {
        get: (_, prop) => {
            if (isConfigured) return undefined; // Should not happen if configured
            return () => {
                const msg = `Firebase Admin ${name}.${String(prop)} was called but SDK is not configured. Check your environment variables.`;
                if (process.env.NODE_ENV === 'production') {
                    throw new Error(msg);
                }
                console.warn(msg);
                return {
                    collection: () => createProxy('collection'),
                    doc: () => createProxy('doc'),
                    where: () => createProxy('where'),
                    orderBy: () => createProxy('orderBy'),
                    limit: () => createProxy('limit'),
                    get: () => Promise.resolve({ empty: true, docs: [] }),
                    set: () => Promise.resolve(),
                    update: () => Promise.resolve(),
                    delete: () => Promise.resolve(),
                };
            };
        }
    });
};

export const adminAuth = isConfigured ? getAuth(adminApp) : createProxy('auth') as any;
export const adminStorage = isConfigured ? getStorage(adminApp) : createProxy('storage') as any;
export const adminDb = isConfigured ? getFirestore(adminApp) : createProxy('firestore') as any;

export default adminApp;
