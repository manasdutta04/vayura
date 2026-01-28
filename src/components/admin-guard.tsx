'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function AdminGuard({ children }: { children: React.ReactNode }) {
    // TEMPORARY BYPASS: Allow access to analytics for development/preview
    // TODO: Remove this bypass before production
    return <>{children}</>;

    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/?action=login');
                return;
            }

            // Simple admin check: in a real app, this would check custom claims or a Firestore document
            // For now, we'll allow all logged-in users or check for a specific email if provided
            // Let's assume for now that we'll check for a custom claim or a flag
            const checkAdmin = async () => {
                try {
                    // Placeholder for actual admin check logic
                    // const idTokenResult = await user.getIdTokenResult();
                    // setIsAdmin(!!idTokenResult.claims.admin);
                    
                    // For demo/development purposes, let's allow all logged in users
                    setIsAdmin(true);
                } catch (error) {
                    console.error('Error checking admin status:', error);
                    setIsAdmin(false);
                }
            };

            checkAdmin();
        }
    }, [user, loading, router]);

    if (loading || isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-4">You do not have administrative privileges to view this page.</p>
                <button 
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
