/**
 * Client-side district page component with offline support
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DistrictDetail } from '@/lib/types';
import { formatCompactNumber, formatNumber, getAQICategory } from '@/lib/utils/helpers';
import { useDistrictData } from '@/lib/hooks/use-district-data';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { RefreshCw, Loader2 } from 'lucide-react';

interface DistrictClientPageProps {
  slug: string;
  initialData: DistrictDetail | null;
}

export function DistrictClientPage({ slug, initialData }: DistrictClientPageProps) {
  const { data, loading, error, metadata, refresh } = useDistrictData(slug);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use initial data if available, otherwise use fetched data
  const districtData = data || initialData;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading && !districtData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-nature-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-nature-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading district data...</p>
        </div>
      </div>
    );
  }

  if (error && !districtData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-nature-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="text-red-600 font-semibold">Error loading district</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!districtData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-nature-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">District not found</p>
        </div>
      </div>
    );
  }

  const aqiInfo = getAQICategory(districtData.environmentalData.aqi);
  const calc = districtData.oxygenCalculation;

  return (
    <main className="min-h-screen bg-linear-to-br from-nature-50 via-white to-sky-50 pb-20">
      <section className="max-w-6xl mx-auto px-6 pt-10">
        {/* Offline Indicator */}
        {(metadata.fromCache || !navigator.onLine) && (
          <OfflineIndicator
            fromCache={metadata.fromCache}
            cacheTimestamp={metadata.timestamp}
            isStale={metadata.isStale}
            className="mb-6"
          />
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              District Environmental Health Card
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {districtData.name}, <span className="text-gray-600">{districtData.state}</span>
            </h1>
            <p className="mt-2 text-gray-600">
              Estimated population {formatNumber(districtData.population)}. 
              {metadata.fromCache && metadata.timestamp
                ? ` Cached data from ${new Date(metadata.timestamp).toLocaleDateString()}.`
                : ' Data refreshed in the last 24 hours.'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || !navigator.onLine}
              className="px-5 py-3 rounded-full bg-white text-nature-700 font-semibold border border-nature-500 hover:bg-nature-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={!navigator.onLine ? 'Cannot refresh while offline' : 'Refresh data'}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <Link
              href="/plant"
              className="px-5 py-3 rounded-full bg-nature-600 text-white font-semibold hover:bg-nature-700 transition"
            >
              I planted a tree
            </Link>
            <Link
              href={`https://tree-nation.com/?utm_source=vayura&district=${encodeURIComponent(
                districtData.name
              )}`}
              target="_blank"
              className="px-5 py-3 rounded-full bg-white text-nature-700 font-semibold border border-nature-500 hover:bg-nature-50 transition"
            >
              Donate trees
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Population</h2>
            <p className="text-2xl font-bold text-gray-900">
              {formatCompactNumber(districtData.population)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">AQI</h2>
            <p className="text-2xl font-bold" style={{ color: aqiInfo.color }}>
              {Math.round(districtData.environmentalData.aqi)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{aqiInfo.label}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Soil quality</h2>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(districtData.environmentalData.soilQuality)} / 100
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Disaster frequency</h2>
            <p className="text-2xl font-bold text-gray-900">
              {districtData.environmentalData.disasterFrequency.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Oxygen model explanation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Oxygen demand vs tree supply
            </h2>
            <dl className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt>Base human O₂ demand</dt>
                <dd className="font-mono">
                  {formatNumber(
                    Math.round(calc.formula_breakdown.human_o2_demand_kg)
                  )}{' '}
                  kg/year
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Penalty multipliers (AQI × soil × disasters)</dt>
                <dd className="font-mono">
                  {calc.formula_breakdown.aqi_penalty_factor.toFixed(2)} ×{' '}
                  {calc.formula_breakdown.soil_degradation_factor.toFixed(2)} ×{' '}
                  {calc.formula_breakdown.disaster_loss_factor.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Adjusted O₂ demand</dt>
                <dd className="font-mono">
                  {formatNumber(
                    Math.round(
                      calc.formula_breakdown.adjusted_o2_demand_kg
                    )
                  )}{' '}
                  kg/year
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Per-tree O₂ supply (soil adjusted)</dt>
                <dd className="font-mono">
                  {Math.round(
                    calc.formula_breakdown.soil_adjusted_tree_supply_kg
                  )}{' '}
                  kg/year
                </dd>
              </div>
              <div className="flex justify-between border-t border-dashed pt-3 mt-3">
                <dt className="font-semibold">Trees required</dt>
                <dd className="font-mono text-lg font-semibold text-nature-700">
                  {formatNumber(Math.round(calc.trees_required))} trees
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Transparent model and assumptions
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-semibold mb-1">Formulas</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Human O₂ demand = population × 550 L/day × 365, converted
                    to kg/year
                  </li>
                  <li>
                    Adjusted demand = base demand × AQI factor × soil factor ×
                    disaster factor
                  </li>
                  <li>
                    Tree O₂ supply = 110 kg O₂/year per mature tree, adjusted by
                    soil quality
                  </li>
                  <li>
                    Trees required = oxygen deficit ÷ per-tree O₂ supply
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">Assumptions</p>
                <ul className="list-disc list-inside space-y-1">
                  {calc.assumptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Confidence level:{' '}
                <span className="font-semibold capitalize">
                  {calc.confidence_level}
                </span>
                . Estimates only, not medical or policy guidance.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-nature-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">
            Help restore oxygen balance in {districtData.name}
          </h2>
          <p className="text-nature-100 mb-6 max-w-2xl mx-auto">
            Every tree counts. Join the movement to create a healthier, more
            sustainable environment for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/plant"
              className="px-6 py-3 bg-white text-nature-700 rounded-full font-semibold hover:bg-nature-50 transition"
            >
              Report a tree you planted
            </Link>
            <Link
              href={`https://tree-nation.com/?utm_source=vayura&district=${encodeURIComponent(
                districtData.name
              )}`}
              target="_blank"
              className="px-6 py-3 bg-nature-700 text-white rounded-full font-semibold hover:bg-nature-800 transition border border-nature-500"
            >
              Donate to plant trees
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
