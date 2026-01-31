"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes"; // Optional: if you use next-themes

export function ToastProvider() {
  // Optional: Get theme to sync toast appearance
  const { theme = "system" } = useTheme(); 

  return (
    <Toaster 
      position="bottom-right" 
      richColors 
      closeButton
      theme={theme as "light" | "dark" | "system"}
      toastOptions={{
        style: {
          // consistent styling with your app's theme
          fontFamily: 'var(--font-sans)', 
        },
      }}
    />
  );
}