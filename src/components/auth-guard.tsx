'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';

// Only these paths require authentication
const PROTECTED_PATHS = ['/dashboard', '/plant', '/donate', '/contribution', '/analytics'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname(); // Returns path WITHOUT locale prefix
    const router = useRouter();

    const isProtectedPath = PROTECTED_PATHS.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    useEffect(() => {
        if (!loading && !user && isProtectedPath) {
            router.replace('/?action=login');
        }
    }, [user, loading, pathname, router, isProtectedPath]);

    // Show loading state while checking auth on protected pages
    if (loading && isProtectedPath) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Block protected pages for unauthenticated users
    if (!user && isProtectedPath) {
        return null;
    }

    return <>{children}</>;
}
