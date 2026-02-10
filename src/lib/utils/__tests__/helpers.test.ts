/**
 * Helpers Utility Tests
 * Tests for helper functions in src/lib/utils/helpers.ts
 */

import {
    getAQICategory,
    formatNumber,
    formatCompactNumber,
    slugify,
    validateImageFile,
    cn,
    apiClient,
} from '../helpers';

describe('Helpers Utility Functions', () => {
    describe('getAQICategory', () => {
        it('should return "good" category for AQI <= 50', () => {
            const result = getAQICategory(50);
            expect(result.category).toBe('good');
            expect(result.label).toBe('Good');
            expect(result.color).toBe('#22c55e');
        });

        it('should return "good" category for AQI = 0', () => {
            const result = getAQICategory(0);
            expect(result.category).toBe('good');
        });

        it('should return "moderate" category for AQI 51-100', () => {
            const result51 = getAQICategory(51);
            const result100 = getAQICategory(100);
            expect(result51.category).toBe('moderate');
            expect(result100.category).toBe('moderate');
            expect(result51.label).toBe('Moderate');
        });

        it('should return "unhealthy" category for AQI 101-150', () => {
            const result = getAQICategory(150);
            expect(result.category).toBe('unhealthy');
            expect(result.label).toBe('Unhealthy for Sensitive Groups');
        });

        it('should return "unhealthy" category for AQI 151-200', () => {
            const result = getAQICategory(200);
            expect(result.category).toBe('unhealthy');
            expect(result.label).toBe('Unhealthy');
        });

        it('should return "veryUnhealthy" category for AQI 201-300', () => {
            const result = getAQICategory(250);
            expect(result.category).toBe('veryUnhealthy');
            expect(result.label).toBe('Very Unhealthy');
            expect(result.color).toBe('#ef4444');
        });

        it('should return "hazardous" category for AQI > 300', () => {
            const result = getAQICategory(500);
            expect(result.category).toBe('hazardous');
            expect(result.label).toBe('Hazardous');
            expect(result.color).toBe('#991b1b');
        });

        it('should include description for all categories', () => {
            const categories = [25, 75, 125, 175, 250, 400];
            categories.forEach(aqi => {
                const result = getAQICategory(aqi);
                expect(result.description).toBeDefined();
                expect(typeof result.description).toBe('string');
                expect(result.description.length).toBeGreaterThan(0);
            });
        });
    });

    describe('formatNumber', () => {
        it('should format small numbers correctly', () => {
            const result = formatNumber(1000);
            expect(result).toBe('1,000');
        });

        it('should format large numbers with Indian locale', () => {
            const result = formatNumber(1234567);
            // Indian numbering: 12,34,567
            expect(result).toBe('12,34,567');
        });

        it('should handle zero', () => {
            const result = formatNumber(0);
            expect(result).toBe('0');
        });

        it('should handle negative numbers', () => {
            const result = formatNumber(-1000);
            expect(result).toBe('-1,000');
        });

        it('should handle decimal numbers', () => {
            const result = formatNumber(1234.56);
            expect(result).toBe('1,234.56');
        });
    });

    describe('formatCompactNumber', () => {
        it('should format thousands as K', () => {
            const result = formatCompactNumber(1000);
            expect(result).toMatch(/1\s*K|1000/);
        });

        it('should format millions as M', () => {
            const result = formatCompactNumber(1000000);
            expect(result).toMatch(/1\s*M|10\s*L/i);
        });

        it('should handle small numbers', () => {
            const result = formatCompactNumber(100);
            expect(result).toBe('100');
        });

        it('should handle zero', () => {
            const result = formatCompactNumber(0);
            expect(result).toBe('0');
        });
    });

    describe('slugify', () => {
        it('should convert to lowercase', () => {
            const result = slugify('Hello World');
            expect(result).toBe('hello-world');
        });

        it('should replace spaces with hyphens', () => {
            const result = slugify('new york city');
            expect(result).toBe('new-york-city');
        });

        it('should remove special characters', () => {
            const result = slugify('Hello! World? Test#123');
            expect(result).toBe('hello-world-test123');
        });

        it('should handle multiple spaces', () => {
            const result = slugify('too   many    spaces');
            expect(result).toBe('too-many-spaces');
        });

        it('should handle double hyphens', () => {
            const result = slugify('test--double--hyphen');
            expect(result).toBe('test-double-hyphen');
        });

        it('should handle empty string', () => {
            const result = slugify('');
            expect(result).toBe('');
        });

        it('should handle string with only special characters', () => {
            const result = slugify('!!!@@@###');
            expect(result).toBe('');
        });
    });

    describe('validateImageFile', () => {
        const createMockFile = (name: string, size: number, type: string): File => {
            const blob = new Blob([''], { type });
            return new File([blob], name, { type });
        };

        it('should accept valid JPEG file', () => {
            const file = createMockFile('test.jpg', 1024, 'image/jpeg');
            const result = validateImageFile(file);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should accept valid PNG file', () => {
            const file = createMockFile('test.png', 1024, 'image/png');
            const result = validateImageFile(file);
            expect(result.valid).toBe(true);
        });

        it('should accept valid WebP file', () => {
            const file = createMockFile('test.webp', 1024, 'image/webp');
            const result = validateImageFile(file);
            expect(result.valid).toBe(true);
        });

        it('should reject invalid file type', () => {
            const file = createMockFile('test.gif', 1024, 'image/gif');
            const result = validateImageFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid file type');
        });

        it('should reject PDF files', () => {
            const file = createMockFile('test.pdf', 1024, 'application/pdf');
            const result = validateImageFile(file);
            expect(result.valid).toBe(false);
        });

        it('should reject file larger than 10MB', () => {
            // Create a file larger than 10MB using Object.defineProperty
            const file = createMockFile('large.jpg', 11 * 1024 * 1024, 'image/jpeg');
            Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
            const result = validateImageFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('too large');
        });

        it('should accept file exactly 10MB', () => {
            const file = createMockFile('exact.jpg', 10 * 1024 * 1024, 'image/jpeg');
            Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 });
            const result = validateImageFile(file);
            expect(result.valid).toBe(true);
        });
    });

    describe('cn (className utility)', () => {
        it('should join class names with space', () => {
            const result = cn('class1', 'class2', 'class3');
            expect(result).toBe('class1 class2 class3');
        });

        it('should filter out undefined values', () => {
            const result = cn('class1', undefined, 'class2');
            expect(result).toBe('class1 class2');
        });

        it('should filter out null values', () => {
            const result = cn('class1', null, 'class2');
            expect(result).toBe('class1 class2');
        });

        it('should filter out false values', () => {
            const result = cn('class1', false, 'class2');
            expect(result).toBe('class1 class2');
        });

        it('should handle conditional classes', () => {
            const isActive = true;
            const isDisabled = false;
            const result = cn(
                'base-class',
                isActive && 'active',
                isDisabled && 'disabled'
            );
            expect(result).toBe('base-class active');
        });

        it('should return empty string for no classes', () => {
            const result = cn();
            expect(result).toBe('');
        });

        it('should return empty string when all values are falsy', () => {
            const result = cn(undefined, null, false);
            expect(result).toBe('');
        });
    });

    describe('apiClient', () => {

        beforeEach(() => {
            global.fetch = jest.fn();
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('should make a successful GET request', async () => {
            const mockResponse = { data: 'test' };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await apiClient('https://api.example.com/data');

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        });

        it('should merge custom headers', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            });

            await apiClient('https://api.example.com/data', {
                headers: { 'Authorization': 'Bearer token' },
            });

            expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer token',
                },
            });
        });

        it('should handle POST requests', async () => {
            const mockResponse = { success: true };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await apiClient('https://api.example.com/data', {
                method: 'POST',
                body: JSON.stringify({ name: 'test' }),
            });

            expect(result).toEqual(mockResponse);
        });

        it('should throw error on failed response', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found',
                json: async () => ({ message: 'Resource not found' }),
            });

            await expect(apiClient('https://api.example.com/data'))
                .rejects.toThrow('Resource not found');
        });

        it('should throw generic error when response has no message', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                statusText: 'Internal Server Error',
                json: async () => { throw new Error('Invalid JSON'); },
            });

            await expect(apiClient('https://api.example.com/data'))
                .rejects.toThrow('Internal Server Error');
        });

        it('should throw error on network failure', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(apiClient('https://api.example.com/data'))
                .rejects.toThrow('Network error');
        });
    });
});
