const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
] as const;

let hasValidated = false;

export function validateRequiredEnvVars() {
  if (hasValidated) return;
  hasValidated = true;

  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const missingVars = REQUIRED_ENV_VARS.filter((name) => {
    const value = process.env[name];
    return !value || value.trim().length === 0;
  });

  if (missingVars.length === 0) {
    return;
  }

  const message = [
    'Missing required environment variables.',
    '',
    'Add the following variables to .env.local (local dev) or .env (Docker):',
    ...missingVars.map((name) => `- ${name}`),
    '',
    'Then restart the development server.',
    'See README.md and SETUP.md for the full environment setup.',
  ].join('\n');

  throw new Error(message);
}
