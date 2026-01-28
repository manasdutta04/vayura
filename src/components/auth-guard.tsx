'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const PUBLIC_PATHS = ['/', '/terms', '/privacy', '/data-policy'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            const isPublicPath = PUBLIC_PATHS.some(path =>
                pathname === path || pathname.startsWith(`${path}/`)
            );

            if (!user && !isPublicPath) {
                router.replace('/?action=login');
            }
        }
    }, [user, loading, pathname, router]);

    // Show loading state or nothing while checking checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Allow rendering if user is authenticated or path is public
    // We render children even during redirect to avoid hydration mismatch, 
    // but effectively the user will be moved away quickly.
    // However, for security, we should return null if protecting.
    const isPublicPath = PUBLIC_PATHS.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    if (!user && !isPublicPath) {
        return null;
    }

    return <>{children}</>;
}
