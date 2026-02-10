'use client'

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthGuard } from '@/components/auth-guard';
import { Toaster } from 'sonner'
import { AuthProvider } from "@/lib/auth-context"
import { OfflineProvider } from "@/lib/context/OfflineContext"
import { OfflineIndicator } from "@/components/ui/OfflineIndicator"
import { Toaster } from "sonner"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthGuard>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </AuthGuard>
      </ThemeProvider>
      <OfflineProvider>
        {children}
        <OfflineIndicator />
        <Toaster position="bottom-right" richColors closeButton />
      </OfflineProvider>
    </AuthProvider>
  )
}