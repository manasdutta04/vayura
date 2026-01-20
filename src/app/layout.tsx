import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vayura - District Oxygen Intelligence for India",
  description: "Discover your district's oxygen demand, environmental health, and the trees needed to restore balance. Track and contribute to India's green movement.",
  keywords: ["oxygen", "trees", "environment", "India", "districts", "plantation", "climate"],
  authors: [{ name: "Vayura Team" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Vayura - District Oxygen Intelligence",
    description: "Calculate oxygen demand and tree requirements for Indian districts",
    type: "website",
    siteName: "Vayura",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.png", // Add a default OG image at public/og-image.png
        width: 1200,
        height: 630,
        alt: "Vayura - District Oxygen Intelligence for India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vayura - District Oxygen Intelligence",
    description: "Calculate oxygen demand and tree requirements for Indian districts",
    images: ["/og-image.png"],
    creator: "@vayura",
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'android-chrome-512x512', url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}