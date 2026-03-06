'use client'

import { AuthProvider } from "@/lib/auth-context"
import { OfflineProvider } from "@/lib/context/OfflineContext"
import { OfflineIndicator } from "@/components/ui/OfflineIndicator"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/lib/theme-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OfflineProvider>
          {children}
          <OfflineIndicator />
          <Toaster position="bottom-right" richColors closeButton />
        </OfflineProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}