"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import ToastProvider from "@/components/ui/toast-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider />
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
