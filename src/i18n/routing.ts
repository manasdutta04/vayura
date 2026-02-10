import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'hi', 'ta', 'bn', 'mr', 'gu', 'te'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  bn: 'বাংলা',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
  te: 'తెలుగు',
};

export const routing = defineRouting({
  // All supported locales
  locales,

  // Default locale when no locale is detected
  defaultLocale: 'en',

  // Prefix the default locale in the URL (e.g., /en/about instead of /about)
  localePrefix: 'as-needed',
});
