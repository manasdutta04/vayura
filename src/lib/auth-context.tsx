'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider, isConfigured } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    authAvailable: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(isConfigured && !!auth);
    const [authAvailable] = useState(isConfigured && !!auth && !!googleProvider);

    useEffect(() => {
        // Check if auth is available
        if (!auth || !isConfigured) {
            console.warn('Firebase Auth not configured - running in limited mode');
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        }, (error) => {
            // Error callback for onAuthStateChanged
            console.warn('Firebase Auth error - running in limited mode:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        // Prevent any Firebase calls if not properly configured
        if (!isConfigured || !authAvailable || !auth || !googleProvider) {
            console.warn('Sign-in blocked: Firebase not configured');
            throw new Error('Authentication is not available. Please configure Firebase credentials.');
        }
        
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            // Suppress and convert Firebase configuration errors to user-friendly messages
            const err = error as { code?: string; message?: string };
            
            if (err.code === 'auth/configuration-not-found') {
                console.warn('Firebase Auth configuration error caught and suppressed:', err);
                throw new Error('Authentication service is not properly configured. Please contact support.');
            }
            
            if (err.code === 'auth/invalid-api-key') {
                console.warn('Firebase Auth invalid API key caught and suppressed:', err);
                throw new Error('Authentication service is not properly configured. Please contact support.');
            }
            
            if (err.code === 'auth/network-request-failed') {
                throw new Error('Network error. Please check your internet connection and try again.');
            }
            
            console.error('Google sign-in error:', error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (!isConfigured || !authAvailable || !auth) {
            console.warn('Sign-in blocked: Firebase not configured');
            throw new Error('Authentication is not available. Please configure Firebase credentials.');
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            const err = error as { code?: string; message?: string };
            
            if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key') {
                console.warn('Firebase Auth configuration error caught and suppressed:', err);
                throw new Error('Authentication service is not properly configured. Please contact support.');
            }
            
            console.error('Email sign-in error:', error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        if (!isConfigured || !authAvailable || !auth) {
            console.warn('Sign-up blocked: Firebase not configured');
            throw new Error('Authentication is not available. Please configure Firebase credentials.');
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            const err = error as { code?: string; message?: string };
            
            if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key') {
                console.warn('Firebase Auth configuration error caught and suppressed:', err);
                throw new Error('Authentication service is not properly configured. Please contact support.');
            }
            
            console.error('Email sign-up error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        if (!isConfigured || !authAvailable || !auth) {
            console.warn('Sign-out blocked: Firebase not configured');
            throw new Error('Authentication is not available. Please configure Firebase credentials.');
        }
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Sign-out error:', error);
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        if (!isConfigured || !authAvailable || !auth) {
            console.warn('Password reset blocked: Firebase not configured');
            throw new Error('Authentication is not available. Please configure Firebase credentials.');
        }
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            const err = error as { code?: string; message?: string };
            
            if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key') {
                console.warn('Firebase Auth configuration error caught and suppressed:', err);
                throw new Error('Authentication service is not properly configured. Please contact support.');
            }
            
            console.error('Password reset error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                authAvailable,
                loading,
                signInWithGoogle,
                signInWithEmail,
                signUpWithEmail,
                signOut,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
