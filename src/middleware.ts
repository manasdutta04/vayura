import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Middleware to handle internationalization (i18n) routing
 * - Detects user's preferred locale from browser settings
 * - Redirects to appropriate locale-prefixed URLs
 * - Handles locale switching
 */
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  // - API routes (/api/...)
  // - Static files (_next/static, _next/image, favicon.ico)
  // - Public assets (images, etc.)
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
