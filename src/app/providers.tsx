'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthGuard } from '@/components/auth-guard';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
                  <ThemeProvider>
            <AuthGuard>{children}</AuthGuard>
                            </ThemeProvider>
        </AuthProvider>
    );
}
