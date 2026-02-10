/**
 * Storage Utility Tests
 * Tests for storage functions in src/lib/utils/storage.ts
 */

import {
    validateImageFile,
    createImagePreview,
    revokeImagePreview
} from '../storage';

// Mock Firebase Storage
jest.mock('@/lib/firebase', () => ({
    storage: {},
}));

jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
}));

describe('Storage Utility Functions', () => {
    describe('validateImageFile', () => {
        const createMockFile = (name: string, size: number, type: string): File => {
            const blob = new Blob([''], { type });
            const file = new File([blob], name, { type });
            Object.defineProperty(file, 'size', { value: size });
            return file;
        };

        describe('valid file types', () => {
            it('should accept JPEG files', () => {
                const file = createMockFile('test.jpg', 1024, 'image/jpeg');
                const result = validateImageFile(file);
                expect(result.valid).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it('should accept JPG files (image/jpg)', () => {
                const file = createMockFile('test.jpg', 1024, 'image/jpg');
                const result = validateImageFile(file);
                expect(result.valid).toBe(true);
            });

            it('should accept PNG files', () => {
                const file = createMockFile('test.png', 1024, 'image/png');
                const result = validateImageFile(file);
                expect(result.valid).toBe(true);
            });

            it('should accept WebP files', () => {
                const file = createMockFile('test.webp', 1024, 'image/webp');
                const result = validateImageFile(file);
                expect(result.valid).toBe(true);
            });
        });

        describe('invalid file types', () => {
            it('should reject GIF files', () => {
                const file = createMockFile('test.gif', 1024, 'image/gif');
                const result = validateImageFile(file);
                expect(result.valid).toBe(false);
                expect(result.error).toContain('Invalid file type');
            });

            it('should reject PDF files', () => {
                const file = createMockFile('document.pdf', 1024, 'application/pdf');
                const result = validateImageFile(file);
                expect(result.valid).toBe(false);
                expect(result.error).toContain('Invalid file type');
            });

            it('should reject SVG files', () => {
                const file = createMockFile('icon.svg', 1024, 'image/svg+xml');
                const result = validateImageFile(file);
                expect(result.valid).toBe(false);
            });

            it('should reject BMP files', () => {
                const file = createMockFile('image.bmp', 1024, 'image/bmp');
                const result = validateImageFile(file);
                expect(result.valid).toBe(false);
            });

            it('should reject TIFF files', () => {
                const file = createMockFile('image.tiff', 1024, 'image/tiff');
                const result = validateImageFile(file);
                expect(result.valid).toBe(false);
            });
        });

        describe('file size validation', () => {
            it('should accept files smaller than 10MB', () => {
                const file = createMockFile('small.jpg', 5 * 1024 * 1024, 'image/jpeg');
                const result = validateImageFile(file);
                expect(result.valid).toBe(true);
            });

            it('should accept files exactly 10MB', () => {
                const file = createMockFile('exact.jpg', 10 * 1024 * 1024, 'image/jpeg');
                const result = validateImageFile(file);
                expect(result.valid).toBe(true);
            });

            it('should reject files larger than 10MB', () => {
                const file = createMockFile('large.jpg', 11 * 1024 * 1024, 'image/jpeg');
                const result = validateImageFile(file);
                expect(result.valid).toBe(false);
                expect(result.error).toContain('too large');
                expect(result.error).toContain('10MB');
            });

            it('should reject very large files', () => {
                const file = createMockFile('huge.jpg', 100 * 1024 * 1024, 'image/jpeg');
                const result = validateImageFile(file);
                expect(result.valid).toBe(false);
            });

            it('should accept very small files', () => {
                const file = createMockFile('tiny.jpg', 100, 'image/jpeg');
                const result = validateImageFile(file);
                expect(result.valid).toBe(true);
            });

            it('should accept zero-byte files (edge case)', () => {
                const file = createMockFile('empty.jpg', 0, 'image/jpeg');
                const result = validateImageFile(file);
                expect(result.valid).toBe(true);
            });
        });

        describe('combined validation', () => {
            it('should check type before size', () => {
                // Large invalid type file
                const file = createMockFile('large.gif', 20 * 1024 * 1024, 'image/gif');
                const result = validateImageFile(file);
                expect(result.valid).toBe(false);
                expect(result.error).toContain('Invalid file type');
            });
        });
    });

    describe('createImagePreview', () => {
        beforeEach(() => {
            // Mock URL.createObjectURL
            global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/preview-123');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should create a preview URL for a file', () => {
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const previewUrl = createImagePreview(file);

            expect(previewUrl).toBe('blob:http://localhost/preview-123');
            expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
        });

        it('should call createObjectURL with the provided file', () => {
            const file = new File(['content'], 'image.png', { type: 'image/png' });
            createImagePreview(file);

            expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
        });
    });

    describe('revokeImagePreview', () => {
        beforeEach(() => {
            global.URL.revokeObjectURL = jest.fn();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should revoke a preview URL', () => {
            const url = 'blob:http://localhost/preview-123';
            revokeImagePreview(url);

            expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(url);
        });

        it('should call revokeObjectURL with the provided URL', () => {
            const url = 'blob:http://localhost/some-id';
            revokeImagePreview(url);

            expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
        });
    });
});
