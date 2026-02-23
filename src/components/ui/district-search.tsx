'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, Database, Wifi, WifiOff, X, Loader2, ArrowRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIsOnline } from '@/lib/hooks/useNetworkStatus';
import { getCachedSearchResults, cacheSearchResults, getRecentDistricts } from '@/lib/cache';
import { DistrictSearchResult } from '@/lib/types';
import { apiClient, cn } from '@/lib/utils/helpers';
import { useTranslations } from 'next-intl';

interface DistrictSearchProps {
  onDistrictSelect?: (district: DistrictSearchResult) => void;
  className?: string;
  autoFocus?: boolean;
}

export const DistrictSearch = ({ onDistrictSelect, className = '', autoFocus = false }: DistrictSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DistrictSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentDistricts, setRecentDistricts] = useState<DistrictSearchResult[]>([]);
  const [dataSource, setDataSource] = useState<'network' | 'cache' | null>(null);
  
  const isOnline = useIsOnline();
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations('search');

  // Load recently viewed on mount
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const recent = await getRecentDistricts(5);
        setRecentDistricts(recent);
      } catch (err) {
        console.warn('Failed to load recent districts:', err);
      }
    };
    loadRecent();
  }, []);

  // Debounced search query
  const debouncedQuery = useMemo(() => query.trim(), [query]);

  // Perform search
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setDataSource(null);
      return;
    }

    let isCancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Try local cache first
        const cached = await getCachedSearchResults(debouncedQuery);
        if (cached && !isCancelled) {
          setResults(cached.data);
          setDataSource('cache');
        }
        
        // 2. If online, fetch from API
        if (isOnline) {
          try {
            const data = await apiClient<DistrictSearchResult[]>(
              `/api/districts?q=${encodeURIComponent(debouncedQuery)}`
            );
            if (!isCancelled) {
              setResults(data);
              setDataSource('network');
              // Cache the results
              await cacheSearchResults(debouncedQuery, data);
            }
          } catch (apiErr) {
            console.error('API Search error:', apiErr);
            if (!cached) setError('Search failed');
          }
        } else if (!cached && !isCancelled) {
          setError(t('offlineTitle'));
        }
      } catch (err) {
        console.error('Search error:', err);
        if (!isCancelled) setError('Search failed');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchResults();
    return () => { isCancelled = true; };
  }, [debouncedQuery, isOnline, t]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (district: DistrictSearchResult) => {
    setQuery('');
    setIsOpen(false);
    
    if (onDistrictSelect) {
      onDistrictSelect(district);
    } else {
      router.push(`/district/${district.slug}`);
    }
  };

  return (
    <div ref={searchRef} className={cn("relative max-w-2xl mx-auto w-full group", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          autoFocus={autoFocus}
          placeholder={t('placeholder')}
          className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-100 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-base text-gray-900 bg-white placeholder:text-gray-400 transition-all"
        />
        {loading && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        )}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1100] animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header/Status */}
          {(results.length > 0 || (debouncedQuery.length >= 2 && loading)) && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t('districtsFound')}
              </span>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight",
                  isOnline ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                )}>
                  {dataSource === 'network' || isOnline ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      {t('live')}
                    </>
                  ) : (
                    <>
                      <Database className="w-3 h-3" />
                      {t('cached')}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Offline Notice */}
          {!isOnline && (
            <div className="px-4 py-2 bg-amber-50 text-amber-700 text-xs flex items-center gap-2 border-b border-amber-100/50">
              <WifiOff className="w-3.5 h-3.5" />
              <span>{t('offlineNotice')}</span>
            </div>
          )}

          <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {/* Results List */}
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((district) => (
                  <button
                    key={district.id}
                    onClick={() => handleSelect(district)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-all group/item text-left border border-transparent hover:border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                        {district.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          {district.name}
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 -translate-x-1 group-hover/item:translate-x-0 transition-all text-blue-500" />
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={12} />
                          {district.state}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : debouncedQuery.length >= 2 && !loading ? (
              /* No Results State */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">
                  {!isOnline ? t('offlineTitle') : t('noDistricts')}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {!isOnline ? t('offlineDesc', { query: debouncedQuery }) : t('noResultsDesc', { query: debouncedQuery })}
                </p>
                <a 
                  href="https://github.com/saburi004/vayura" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t('contributeData')}
                </a>
              </div>
            ) : query.length < 2 && recentDistricts.length > 0 ? (
              /* Recently Viewed Section */
              <div className="p-2">
                <div className="px-3 py-2 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  {t('recentlyViewed')}
                </div>
                {recentDistricts.map((district) => (
                  <button
                    key={district.id}
                    onClick={() => handleSelect(district)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{district.name}</div>
                      <div className="text-xs text-gray-500">{t('cachedLocally')}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
