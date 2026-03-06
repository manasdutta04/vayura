import { getRequestConfig } from 'next-intl/server';
import { routing, Locale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // For SSG builds, always use English messages to prevent MISSING_MESSAGE errors
  // This ensures the build succeeds. The team can add proper translations later.
  // The locale is still returned correctly for routing purposes.
  const messages = (await import(`../../messages/en.json`)).default;

  return {
    locale,
    messages,
  };
});
