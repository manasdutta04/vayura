'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const PUBLIC_PATHS = ['/', '/terms', '/privacy', '/data-policy', '/map', '/district', '/leaderboard', '/champions'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, authAvailable } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // If auth is not available, allow all routes
            if (!authAvailable) {
                return;
            }

            const isPublicPath = PUBLIC_PATHS.some(path =>
                pathname === path || pathname.startsWith(`${path}/`)
            );

            if (!user && !isPublicPath) {
                router.replace('/?action=login');
            }
        }
    }, [user, loading, authAvailable, pathname, router]);

    // Show loading state or nothing while checking checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Allow rendering if user is authenticated, path is public, or auth is not available
    const isPublicPath = PUBLIC_PATHS.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    if (!authAvailable || (!user && !isPublicPath)) {
        return null;
    }

    return <>{children}</>;
}
