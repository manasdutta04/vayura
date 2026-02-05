import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Upload an image to Firebase Storage
 */
export async function uploadImage(
    file: File,
    districtId: string,
    userId?: string
): Promise<{ url: string; path: string }> {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `tree-${districtId}-${timestamp}.${extension}`;
    const path = `tree-contributions/${userId || 'anonymous'}/${filename}`;

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
            districtId,
            uploadedAt: new Date().toISOString(),
            userId: userId || 'anonymous',
        },
    });

    // Get download URL
    const url = await getDownloadURL(snapshot.ref);

    return { url, path };
}

/**
 * Upload a profile image to Firebase Storage
 */
export async function uploadProfileImage(
    file: File,
    userId: string
): Promise<{ url: string; path: string }> {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `profile-${userId}-${timestamp}.${extension}`;
    const path = `profile-images/${userId}/${filename}`;

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
            uploadedAt: new Date().toISOString(),
            userId,
        },
    });

    // Get download URL
    const url = await getDownloadURL(snapshot.ref);

    return { url, path };
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File is too large. Maximum size is 10MB.',
        };
    }

    return { valid: true };
}

/**
 * Generate a preview URL for an image file
 */
export function createImagePreview(file: File): string {
    return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL when no longer needed
 */
export function revokeImagePreview(url: string): void {
    URL.revokeObjectURL(url);
}
