'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
    isOnline: boolean;
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
}

interface NetworkInformationLike extends EventTarget {
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    addEventListener(type: 'change', listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: 'change', listener: EventListenerOrEventListenerObject): void;
}

interface NavigatorWithConnection extends Navigator {
    connection?: NetworkInformationLike;
    mozConnection?: NetworkInformationLike;
    webkitConnection?: NetworkInformationLike;
}

const getConnection = () => {
    if (typeof navigator === 'undefined') {
        return undefined;
    }
    const nav = navigator as NavigatorWithConnection;
    return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
};

const getCurrentStatus = (): NetworkStatus => {
    if (typeof window === 'undefined') {
        return { isOnline: true };
    }
    const connection = getConnection();
    return {
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
    };
};

/**
 * Hook to monitor network connectivity status
 */
export function useNetworkStatus(): NetworkStatus {
    const [status, setStatus] = useState<NetworkStatus>(() => {
        return getCurrentStatus();
    });

    const updateNetworkInfo = useCallback(() => {
        if (typeof window === 'undefined') return;
        setStatus(getCurrentStatus());
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Event listeners
        const handleOnline = () => {
            updateNetworkInfo();
        };

        const handleOffline = () => {
            setStatus(prev => ({ ...prev, isOnline: false }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Listen to connection changes if available
        const connection = getConnection();
        if (connection) {
            connection.addEventListener('change', updateNetworkInfo);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (connection) {
                connection.removeEventListener('change', updateNetworkInfo);
            }
        };
    }, [updateNetworkInfo]);

    return status;
}

/**
 * Simple hook to check if online
 */
export function useIsOnline(): boolean {
    const { isOnline } = useNetworkStatus();
    return isOnline;
}
