"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { DistrictSearchResult } from "@/lib/types";
import { apiClient, cn } from "@/lib/utils/helpers";
import { useIsOnline } from "@/lib/hooks/useNetworkStatus";
import {
  getCachedSearchResults,
  cacheSearchResults,
  getRecentDistricts,
  getAllCachedDistricts,
} from "@/lib/cache";
import SkeletonCard from "./skeleton-card";
import { Search, Loader2, MapPin, WifiOff, Database, Clock } from "lucide-react";

interface DistrictSearchProps {
  onDistrictSelect?: (district: DistrictSearchResult) => void;
  districtNotFound?: boolean;
  notFoundDistrictName?: string;
  loadingDistrict?: boolean;
}

// Helper to highlight matching text
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="text-blue-600 font-bold">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

export function DistrictSearch({
  onDistrictSelect,
  districtNotFound,
  notFoundDistrictName,
  loadingDistrict,
}: DistrictSearchProps) {
  const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DistrictSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // For keyboard nav
  const [dataSource, setDataSource] = useState<'network' | 'cache' | null>(null);
  const [recentDistricts, setRecentDistricts] = useState<DistrictSearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isOnline = useIsOnline();

  // Load recently viewed districts on mount
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

  // Debounce query
  const debouncedQuery = useMemo(() => query.trim(), [query]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setDataSource(null);
      return;
    }

    let isCancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try cache first for instant results
        const cached = await getCachedSearchResults(debouncedQuery);

        if (cached && !isCancelled) {
          setResults(cached.data);
          setDataSource('cache');
          setShowDropdown(true);
        }

        // If online, fetch fresh data
        if (isOnline) {
          try {
            const data = await apiClient<DistrictSearchResult[]>(
              `/api/districts?q=${encodeURIComponent(debouncedQuery)}`,
            );
            if (!isCancelled) {
              setResults(data);
              setDataSource('network');
              setShowDropdown(true);
              // Cache the results
              await cacheSearchResults(debouncedQuery, data);
            }
          } catch (err: unknown) {
            // If network fails but we have cache, keep using it
            if (!cached && !isCancelled) {
              setError(getErrorMessage(err, "Failed to search districts"));
            }
          }
        } else if (!cached) {
          // Offline with no cache - try to search local cached districts
          const allCached = await getAllCachedDistricts();
          const filtered = allCached.filter(d =>
            d.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            d.state.toLowerCase().includes(debouncedQuery.toLowerCase())
          );
          if (!isCancelled) {
            setResults(filtered);
            setDataSource('cache');
            setShowDropdown(true);
            if (filtered.length === 0) {
              setError("Offline - showing cached results only");
            }
          }
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(getErrorMessage(err, "Failed to search districts"));
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    const timeout = setTimeout(fetchResults, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [debouncedQuery, isOnline]);

  const handleSelect = (district: DistrictSearchResult) => {
    setQuery(district.name);
    setShowDropdown(false);
    if (onDistrictSelect) {
      onDistrictSelect(district);
    }
  };

  // Keyboard Navigation Handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative max-w-2xl mx-auto w-full z-30">
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
          <Search className="w-5 h-5" />
        </div>

        {/* Loading Spinner */}
        {(loading || loadingDistrict) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
        )}

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (results.length > 0 || debouncedQuery) setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search your district... (e.g. Indore, Pune)"
          className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-100 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-base text-gray-900 bg-white placeholder:text-gray-400 transition-all"
        />

        {/* Dropdown Results */}
        {showDropdown && (debouncedQuery || loading || (!debouncedQuery && recentDistricts.length > 0)) && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-gray-100 bg-white shadow-xl max-h-[400px] overflow-y-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {loading ? (
              // Loading Skeletons
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : results.length > 0 ? (
              // Results List
              <div className="py-2">
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Districts Found
                  </span>
                  {/* Data source indicator */}
                  {dataSource && (
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                      dataSource === 'network'
                        ? "bg-green-50 text-green-600"
                        : "bg-blue-50 text-blue-600"
                    )}>
                      {dataSource === 'cache' ? (
                        <>
                          <Database className="w-3 h-3" />
                          Cached
                        </>
                      ) : (
                        <>
                          <Search className="w-3 h-3" />
                          Live
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Offline indicator */}
                {!isOnline && (
                  <div className="mx-4 mb-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2 text-xs text-amber-700">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>You&apos;re offline. Showing cached results.</span>
                  </div>
                )}

                {results.map((district, index) => (
                  <button
                    key={district.id || index}
                    onClick={() => handleSelect(district)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors",
                      index === activeIndex
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50 text-gray-700",
                    )}
                  >
                    <MapPin
                      className={cn(
                        "w-5 h-5 shrink-0",
                        index === activeIndex
                          ? "text-blue-600"
                          : "text-gray-400",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        <HighlightMatch
                          text={district.name}
                          query={debouncedQuery}
                        />
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {district.state} •{" "}
                        {district.population?.toLocaleString()} people
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : !debouncedQuery && recentDistricts.length > 0 ? (
              // Recently Viewed Districts (when no query)
              <div className="py-2">
                <div className="px-4 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Recently Viewed
                  </span>
                </div>
                {recentDistricts.map((district, index) => (
                  <button
                    key={district.id || index}
                    onClick={() => handleSelect(district)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <Database className="w-5 h-5 shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{district.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {district.state} • Cached locally
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // No Results State
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  {!isOnline ? (
                    <WifiOff className="w-6 h-6 text-amber-500" />
                  ) : (
                    <Search className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <h3 className="text-gray-900 font-medium mb-1">
                  {!isOnline ? "You're offline" : "No districts found"}
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  {error ||
                    (districtNotFound && notFoundDistrictName
                      ? `We couldn't find "${notFoundDistrictName}".`
                      : !isOnline
                        ? `No cached data for "${debouncedQuery}".`
                        : `We couldn't find "${debouncedQuery}".`)}
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  {!isOnline
                    ? "Connect to the internet to search all districts."
                    : "Try adjusting your search or filters."
                  }
                </p>
                {isOnline && (
                  <a
                    href="https://github.com/manasdutta04/vayura"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Contribute data on GitHub &rarr;
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
