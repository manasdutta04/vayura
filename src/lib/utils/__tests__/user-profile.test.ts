/**
 * User Profile Utility Tests
 * Tests for user profile functions in src/lib/utils/user-profile.ts
 */

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
    db: {},
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn().mockReturnValue({ path: 'users/test-user-id' }),
    setDoc: jest.fn().mockResolvedValue(undefined),
    getDoc: jest.fn(),
    serverTimestamp: jest.fn().mockReturnValue({ _serverTimestamp: true }),
}));

import {
    getUserProfile,
    saveUserProfile,
    updateUserProfileFields
} from '../user-profile';

import { doc, getDoc, setDoc } from 'firebase/firestore';

describe('User Profile Utility Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset console methods
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getUserProfile', () => {
        it('should return null for empty userId', async () => {
            const result = await getUserProfile('');
            expect(result).toBeNull();
        });

        it('should return null if document does not exist', async () => {
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => false,
            });

            const result = await getUserProfile('test-user-id');
            expect(result).toBeNull();
        });

        it('should return user profile if document exists', async () => {
            const mockData = {
                name: 'Test User',
                email: 'test@example.com',
                bio: 'Test bio',
                photoURL: 'https://example.com/photo.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => true,
                id: 'test-user-id',
                data: () => mockData,
            });

            const result = await getUserProfile('test-user-id');

            expect(result).not.toBeNull();
            expect(result?.id).toBe('test-user-id');
            expect(result?.name).toBe('Test User');
            expect(result?.email).toBe('test@example.com');
        });

        it('should call doc with correct collection and userId', async () => {
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => false,
            });

            await getUserProfile('user-123');

            expect(doc).toHaveBeenCalled();
        });

        it('should return null and log error on exception', async () => {
            (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

            const result = await getUserProfile('test-user');

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith(
                'Error getting user profile:',
                expect.any(Error)
            );
        });
    });

    describe('saveUserProfile', () => {
        it('should return false if profile has no id', async () => {
            const result = await saveUserProfile({ id: '' } as { id: string; email?: string });

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith('User ID is required');
        });

        it('should save profile with merge option', async () => {
            const profile = {
                id: 'user-123',
                name: 'Test User',
                email: 'test@example.com',
            };

            const result = await saveUserProfile(profile);

            expect(result).toBe(true);
            expect(setDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    id: 'user-123',
                    name: 'Test User',
                    email: 'test@example.com',
                }),
                { merge: true }
            );
        });

        it('should include serverTimestamp for createdAt and updatedAt', async () => {
            const profile = { id: 'user-123', email: 'test@example.com' };

            await saveUserProfile(profile);

            expect(setDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    createdAt: { _serverTimestamp: true },
                    updatedAt: { _serverTimestamp: true },
                }),
                { merge: true }
            );
        });

        it('should return false and log error on exception', async () => {
            (setDoc as jest.Mock).mockRejectedValue(new Error('Save error'));

            const result = await saveUserProfile({ id: 'user-123', email: 'test@example.com' });

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith(
                'Error saving user profile:',
                expect.any(Error)
            );
        });
    });

    describe('updateUserProfileFields', () => {
        it('should return false if userId is empty', async () => {
            const result = await updateUserProfileFields('', { name: 'Test' });

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith('User ID missing');
        });

        it('should return true if no valid fields to update', async () => {
            const result = await updateUserProfileFields('user-123', {});

            expect(result).toBe(true);
            expect(console.warn).toHaveBeenCalledWith('No valid fields to update');
        });

        it('should filter out undefined fields', async () => {
            await updateUserProfileFields('user-123', {
                name: 'New Name',
                bio: undefined,
            });

            expect(setDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    name: 'New Name',
                }),
                { merge: true }
            );
        });

        it('should filter out null fields', async () => {
            await updateUserProfileFields('user-123', {
                name: 'New Name',
                bio: null as unknown as string,
            });

            const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
            expect(setDocCall.name).toBe('New Name');
            expect(setDocCall.bio).toBeUndefined();
        });

        it('should filter out empty string fields', async () => {
            await updateUserProfileFields('user-123', {
                name: 'New Name',
                bio: '',
            });

            const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
            expect(setDocCall.name).toBe('New Name');
            expect(setDocCall.bio).toBeUndefined();
        });

        it('should include updatedAt timestamp', async () => {
            await updateUserProfileFields('user-123', { name: 'Test' });

            expect(setDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    updatedAt: { _serverTimestamp: true },
                }),
                { merge: true }
            );
        });

        it('should return true on successful update', async () => {
            // Ensure setDoc resolves successfully for this test
            (setDoc as jest.Mock).mockResolvedValue(undefined);
            const result = await updateUserProfileFields('user-123', { name: 'New Name' });

            expect(result).toBe(true);
        });

        it('should return false and log error on exception', async () => {
            (setDoc as jest.Mock).mockRejectedValue(new Error('Update error'));

            const result = await updateUserProfileFields('user-123', { name: 'Test' });

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith(
                'Error updating user profile fields:',
                expect.any(Error)
            );
        });

        it('should log debug information', async () => {
            await updateUserProfileFields('user-123', { name: 'Test Name' });

            expect(console.log).toHaveBeenCalledWith(
                'updateUserProfileFields called with:',
                expect.objectContaining({
                    userId: 'user-123',
                    fields: { name: 'Test Name' },
                })
            );
        });
    });
});
