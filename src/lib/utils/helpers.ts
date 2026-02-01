import { AQICategoryInfo } from '@/lib/types';

/**
 * Get AQI category and styling information based on AQI value
 */
export function getAQICategory(aqi: number): AQICategoryInfo {
    if (aqi <= 50) {
        return {
            category: 'good',
            color: '#22c55e',
            label: 'Good',
            description: 'Air quality is satisfactory'
        };
    } else if (aqi <= 100) {
        return {
            category: 'moderate',
            color: '#eab308',
            label: 'Moderate',
            description: 'Air quality is acceptable'
        };
    } else if (aqi <= 150) {
        return {
            category: 'unhealthy',
            color: '#f97316',
            label: 'Unhealthy for Sensitive Groups',
            description: 'Members of sensitive groups may experience health effects'
        };
    } else if (aqi <= 200) {
        return {
            category: 'unhealthy',
            color: '#f97316',
            label: 'Unhealthy',
            description: 'Everyone may begin to experience health effects'
        };
    } else if (aqi <= 300) {
        return {
            category: 'veryUnhealthy',
            color: '#ef4444',
            label: 'Very Unhealthy',
            description: 'Health alert: everyone may experience more serious health effects'
        };
    } else {
        return {
            category: 'hazardous',
            color: '#991b1b',
            label: 'Hazardous',
            description: 'Health warning of emergency conditions'
        };
    }
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format number with abbreviations (K, M, B)
 */
export function formatCompactNumber(num: number): string {
    return new Intl.NumberFormat('en-IN', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(num);
}

/**
 * Convert district name to URL-safe slug
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File is too large. Maximum size is 10MB.'
        };
    }

    return { valid: true };
}

/**
 * Generic API client helper with error handling
 */
export async function apiClient<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: response.statusText,
            }));
            throw new Error(error.message || 'API request failed');
        }

        return response.json();
    } catch (error) {
        // Silently handle API errors
        throw error;
    }
}

/**
 * Class name utility (simple version)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
