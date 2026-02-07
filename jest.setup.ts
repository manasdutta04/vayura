/**
 * Jest Setup File
 * Global configurations and mocks for the test environment
 */

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin', () => ({
    adminDb: null,
}));

// Mock Firebase Client
jest.mock('@/lib/firebase', () => ({
    auth: null,
    db: null,
    storage: null,
}));

// Mock environment variables
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

// Suppress console logs during tests (optional, comment out for debugging)
// global.console = {
//     ...console,
//     log: jest.fn(),
//     debug: jest.fn(),
//     info: jest.fn(),
//     warn: jest.fn(),
//     error: jest.fn(),
// };
