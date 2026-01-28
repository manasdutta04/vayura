/**
 * Offline Indicator Component
 * Displays connection status and cache information
 */

'use client';

import { useOnlineStatus } from '@/lib/hooks/use-online-status';
import { WifiOff, Database } from 'lucide-react';

interface OfflineIndicatorProps {
  fromCache?: boolean;
  cacheTimestamp?: number;
  isStale?: boolean;
  className?: string;
}

export function OfflineIndicator({
  fromCache = false,
  cacheTimestamp,
  isStale = false,
  className = '',
}: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();

  // Don't show if online and not from cache
  if (isOnline && !fromCache) {
    return null;
  }

  const formatCacheAge = (timestamp: number) => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const ageMs = now - timestamp;
    const ageMinutes = Math.floor(ageMs / (1000 * 60));
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

    if (ageDays > 0) return `${ageDays} day${ageDays > 1 ? 's' : ''} ago`;
    if (ageHours > 0) return `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`;
    if (ageMinutes > 0) return `${ageMinutes} minute${ageMinutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  return (
    <div className={`rounded-lg border p-3 ${className}`}>
      {/* Offline mode */}
      {!isOnline && (
        <div className="flex items-start gap-3 bg-amber-50 border-amber-200 border rounded-lg p-3">
          <WifiOff className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-sm">Offline Mode</p>
            <p className="text-xs text-amber-700 mt-1">
              You&apos;re viewing cached data. Connect to the internet to see the latest updates.
            </p>
            {cacheTimestamp && (
              <p className="text-xs text-amber-600 mt-1">
                Last updated: {formatCacheAge(cacheTimestamp)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Online but from cache */}
      {isOnline && fromCache && (
        <div className={`flex items-start gap-3 rounded-lg p-3 ${
          isStale 
            ? 'bg-blue-50 border-blue-200 border' 
            : 'bg-green-50 border-green-200 border'
        }`}>
          <Database className={`h-5 w-5 shrink-0 mt-0.5 ${
            isStale ? 'text-blue-600' : 'text-green-600'
          }`} />
          <div className="flex-1">
            <p className={`font-semibold text-sm ${
              isStale ? 'text-blue-900' : 'text-green-900'
            }`}>
              {isStale ? 'Cached Data (Stale)' : 'Cached Data'}
            </p>
            <p className={`text-xs mt-1 ${
              isStale ? 'text-blue-700' : 'text-green-700'
            }`}>
              {isStale 
                ? 'This data may be outdated. Click "Refresh Data" to update.'
                : 'Loaded from cache for faster performance.'
              }
            </p>
            {cacheTimestamp && (
              <p className={`text-xs mt-1 ${
                isStale ? 'text-blue-600' : 'text-green-600'
              }`}>
                Cached: {formatCacheAge(cacheTimestamp)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Global offline banner for app header
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        <span className="font-medium">You&apos;re offline</span>
        <span className="hidden sm:inline">— Viewing cached data only</span>
      </div>
    </div>
  );
}
