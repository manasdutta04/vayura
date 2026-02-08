'use client';

import { WifiOff, Wifi, Database, RefreshCw, Clock } from 'lucide-react';
import { useOffline, type DataSource } from '@/lib/context/OfflineContext';
import { cn } from '@/lib/utils/helpers';

interface OfflineIndicatorProps {
    className?: string;
    showAlways?: boolean;
}

/**
 * Offline status indicator component
 * Shows connection status and data source information
 */
export function OfflineIndicator({ className, showAlways = false }: OfflineIndicatorProps) {
    const { isOnline, currentDataSource, stats } = useOffline();
    const isVisible = showAlways || !isOnline || currentDataSource === 'cache' || currentDataSource === 'stale-cache';

    // Don't render if online and not showing always
    if (!isVisible && isOnline) {
        return null;
    }

    const getStatusIcon = () => {
        if (!isOnline) {
            return <WifiOff className="w-4 h-4" />;
        }
        return <Wifi className="w-4 h-4" />;
    };

    const getStatusText = () => {
        if (!isOnline) {
            return 'You\'re offline';
        }
        if (currentDataSource === 'cache' || currentDataSource === 'stale-cache') {
            return 'Using cached data';
        }
        return 'Online';
    };

    const getStatusColor = () => {
        if (!isOnline) {
            return 'bg-amber-50 border-amber-200 text-amber-800';
        }
        if (currentDataSource === 'cache' || currentDataSource === 'stale-cache') {
            return 'bg-blue-50 border-blue-200 text-blue-800';
        }
        return 'bg-gray-50 border-gray-200 text-gray-700';
    };

    return (
        <div
            className={cn(
                'fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300',
                className
            )}
        >
            <div
                className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg backdrop-blur-sm transition-all duration-300',
                    getStatusColor()
                )}
            >
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>

                {!isOnline && stats.detailsCount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 border-l border-amber-200 pl-2 ml-1">
                        <Database className="w-3 h-3" />
                        {stats.detailsCount} cached
                    </span>
                )}
            </div>
        </div>
    );
}

interface DataSourceBadgeProps {
    source: DataSource;
    cachedAt?: number;
    className?: string;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

/**
 * Badge showing data source (network, cache, or stale-cache)
 */
export function DataSourceBadge({
    source,
    cachedAt,
    className,
    onRefresh,
    isRefreshing = false,
}: DataSourceBadgeProps) {
    const { isOnline } = useOffline();

    const getSourceConfig = () => {
        switch (source) {
            case 'network':
                return {
                    icon: <Wifi className="w-3.5 h-3.5" />,
                    label: 'Live data',
                    color: 'bg-green-50 text-green-700 border-green-200',
                };
            case 'cache':
                return {
                    icon: <Database className="w-3.5 h-3.5" />,
                    label: 'Cached data',
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                };
            case 'stale-cache':
                return {
                    icon: <Clock className="w-3.5 h-3.5" />,
                    label: 'Stale cache',
                    color: 'bg-amber-50 text-amber-700 border-amber-200',
                };
            default:
                return {
                    icon: null,
                    label: '',
                    color: '',
                };
        }
    };

    const config = getSourceConfig();

    if (!config.label) return null;

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div
                className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                    config.color
                )}
            >
                {config.icon}
                <span>{config.label}</span>
                {cachedAt && source !== 'network' && (
                    <span className="opacity-75">• {new Date(cachedAt).toLocaleTimeString()}</span>
                )}
            </div>

            {/* Refresh button - only show when online and data is from cache */}
            {isOnline && source !== 'network' && onRefresh && (
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        'bg-gray-100 text-gray-700 border border-gray-200',
                        'hover:bg-gray-200 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            )}
        </div>
    );
}

interface OfflineBannerProps {
    className?: string;
    districtName?: string;
}

/**
 * Full-width banner for offline mode
 */
export function OfflineBanner({ className, districtName }: OfflineBannerProps) {
    const { isOnline, stats } = useOffline();

    if (isOnline) return null;

    return (
        <div
            className={cn(
                'bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4',
                className
            )}
        >
            <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-sm">
                <WifiOff className="w-4 h-4" />
                <span>
                    You&apos;re viewing {districtName ? `${districtName}` : 'data'} in offline mode.
                    {stats.detailsCount > 0 && (
                        <span className="ml-1 opacity-90">
                            ({stats.detailsCount} district{stats.detailsCount !== 1 ? 's' : ''} cached)
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
