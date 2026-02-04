'use client'

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthGuard } from '@/components/auth-guard';
import { Toaster } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthGuard>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </AuthGuard>
      </ThemeProvider>
    </AuthProvider>
  )
}