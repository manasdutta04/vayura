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
import { auth, googleProvider } from '@/lib/firebase';

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
    const [loading, setLoading] = useState(!!auth); // Start as loading only if auth is available
    const [authAvailable] = useState(!!auth);

    useEffect(() => {
        // Check if auth is available
        if (!auth) {
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
        if (!authAvailable || !auth) {
            throw new Error('Authentication is not available. Please configure Firebase credentials in your environment variables.');
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (!authAvailable || !auth) {
            throw new Error('Authentication is not available. Please configure Firebase credentials in your environment variables.');
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Email sign-in error:', error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        if (!authAvailable || !auth) {
            throw new Error('Authentication is not available. Please configure Firebase credentials in your environment variables.');
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Email sign-up error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        if (!authAvailable || !auth) {
            throw new Error('Authentication is not available. Please configure Firebase credentials in your environment variables.');
        }
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Sign-out error:', error);
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        if (!authAvailable || !auth) {
            throw new Error('Authentication is not available. Please configure Firebase credentials in your environment variables.');
        }
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
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
