"use client";

import { useEffect, useMemo, useState } from "react";
import { DistrictSearchResult } from "@/lib/types";
import { apiClient, cn } from "@/lib/utils/helpers";
import SkeletonCard from "./skeleton-card";

interface DistrictSearchProps {
  onDistrictSelect?: (district: DistrictSearchResult) => void;
  districtNotFound?: boolean;
  notFoundDistrictName?: string;
  loadingDistrict?: boolean;
}

export function DistrictSearch({
  onDistrictSelect,
  districtNotFound,
  notFoundDistrictName,
  loadingDistrict,
}: DistrictSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DistrictSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce query
  const debouncedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    let isCancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient<DistrictSearchResult[]>(
          `/api/districts?q=${encodeURIComponent(debouncedQuery)}`,
        );
        if (!isCancelled) {
          setResults(data);
          setShowDropdown(true);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || "Failed to search districts");
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
  }, [debouncedQuery]);

  const handleSelect = (district: DistrictSearchResult) => {
    // Keep dropdown open - parent will handle closing if district is found
    setQuery(district.name);
    // Don't close dropdown here - let it stay open to show not found message if needed
    if (onDistrictSelect) {
      onDistrictSelect(district);
    }
  };

  // Keep dropdown open if district not found or loading
  useEffect(() => {
    if (districtNotFound || loadingDistrict) {
      setShowDropdown(true);
    } else if (
      !districtNotFound &&
      !loadingDistrict &&
      !loading &&
      results.length === 0
    ) {
      // Only close if not loading and no results
      setShowDropdown(false);
    }
  }, [districtNotFound, loadingDistrict, loading, results.length]);

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-left text-sm font-semibold text-gray-900">
          District Location
        </label>
        {results.length > 0 && !loading && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {results.length} found
          </span>
        )}
      </div>
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Loading Spinner */}
        {(loading || loadingDistrict) && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-900"></div>
          </div>
        )}

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (districtNotFound) {
              setShowDropdown(false);
            }
          }}
          onFocus={() => {
            if (
              results.length > 0 ||
              districtNotFound ||
              debouncedQuery.length > 0
            ) {
              setShowDropdown(true);
            }
          }}
          onBlur={(e) => {
            if (
              !e.currentTarget.parentElement
                ?.querySelector(".dropdown-content")
                ?.contains(e.relatedTarget as Node)
            ) {
              setTimeout(() => {
                if (!districtNotFound) {
                  setShowDropdown(false);
                }
              }, 200);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) {
              handleSelect(results[0]);
            }
          }}
          placeholder="Search districts... (e.g., Dehradun, Mumbai)"
          className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none text-sm text-gray-900 bg-white placeholder:text-gray-400 transition-all shadow-sm hover:border-gray-300"
        />

        {((showDropdown &&
          (results.length > 0 ||
            loading ||
            (debouncedQuery.length > 0 && !loading))) ||
          districtNotFound ||
          loadingDistrict) && (
          <div
            className="dropdown-content absolute z-20 top-full left-0 right-0 mt-2 rounded-lg border border-gray-200 bg-white shadow-xl max-h-72 overflow-y-auto"
            onMouseDown={(e) => e.preventDefault()}
          >
            {(loading || loadingDistrict) && !districtNotFound && (
              // Replace with skeletons
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </>
            )}
            {!loading &&
              results.length === 0 &&
              !districtNotFound &&
              debouncedQuery.length > 0 && (
                <div className="px-4 py-3 text-sm border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600 mb-2">
                    {debouncedQuery} not found, contribute on GitHub
                  </p>
                  <a
                    href="https://github.com/manasdutta04/vayura"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23 1.957-.544 4.06-.544 6.017 0 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Contribute on GitHub
                  </a>
                </div>
              )}
            {!loading &&
              !districtNotFound &&
              results.map((district) => (
                <button
                  key={district.id}
                  type="button"
                  onClick={() => handleSelect(district)}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm hover:bg-nature-50 flex flex-col",
                  )}
                >
                  <span className="font-medium text-gray-900">
                    {district.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {district.state} • Population{" "}
                    {district.population.toLocaleString("en-IN")}
                  </span>
                </button>
              ))}
            {districtNotFound && (
              <div className="px-4 py-3 text-sm bg-gray-50">
                <p className="text-gray-600 mb-2">
                  {notFoundDistrictName || "District"} not found, contribute on
                  GitHub
                </p>
                <a
                  href="https://github.com/manasdutta04/vayura" // Fix incomplete URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23 1.957-.544 4.06-.544 6.017 0 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Contribute on GitHub
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
