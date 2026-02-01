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
<<<<<<< HEAD
// In build time or if config is missing, we use a dummy app or handle it gracefully
const app = getApps().length === 0 
    ? (isConfigured ? initializeApp(firebaseConfig) : initializeApp({ apiKey: "fake-key", projectId: "fake-project" }))
    : getApp();
=======
let app;
try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
    console.warn('Firebase Client SDK: Failed to initialize with provided config - running in limited mode');
    console.warn('Authentication features may not work. Error:', error);

    // Initialize with minimal config for development/testing
    const fallbackConfig = {
        apiKey: "demo-api-key",
        authDomain: "demo-project.firebaseapp.com",
        projectId: "demo-project",
        storageBucket: "demo-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef",
    };

    app = getApps().length === 0 ? initializeApp(fallbackConfig) : getApp();
}
>>>>>>> 16e4a19 (Add offline mode with Firebase error handling)

// Auth instance
let auth;
try {
    auth = getAuth(app);
} catch (error) {
    console.warn('Firebase Auth: Configuration not found - auth features disabled');
    // Create a mock auth object to prevent crashes
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
