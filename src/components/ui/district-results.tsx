'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DistrictDetail } from '@/lib/types';
import { formatCompactNumber, formatNumber, getAQICategory } from '@/lib/utils/helpers';
import { validateDataSource, formatDataSource, getReliabilityColor } from '@/lib/data-sources/validation';
import { exportDistrictAsCSV, exportDistrictAsJSON } from '@/lib/utils/export';
import Skeleton from "@/components/ui/skeleton-card";

interface DistrictResultsProps {
  data: DistrictDetail;
}

export function DistrictResults({ data }: DistrictResultsProps) {
  const [exportLoading, setExportLoading] = useState<'csv' | 'json' | null>(null);

  const aqiInfo = getAQICategory(data.environmentalData.aqi);
  const calc = data.oxygenCalculation;

  const handleExportCSV = async () => {
    setExportLoading('csv');
    try {
      exportDistrictAsCSV(data, data.slug);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportJSON = async () => {
    setExportLoading('json');
    try {
      exportDistrictAsJSON(data, data.slug);
    } catch (error) {
      console.error('Failed to export JSON:', error);
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {data.name}, {data.state}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Population: {formatNumber(data.population)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/plant"
              className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Plant a Tree
            </Link>
            <a
              href="/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Donate
            </a>
            <button
              onClick={handleExportCSV}
              disabled={exportLoading !== null}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading === 'csv' ? '⏳ Exporting...' : '📥 CSV'}
            </button>
            <button
              onClick={handleExportJSON}
              disabled={exportLoading !== null}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading === 'json' ? '⏳ Exporting...' : '📥 JSON'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* Population Card */}
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200 overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-blue-900">Population</h3>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {formatCompactNumber(data.population)}
              </p>
            </div>
          </div>

          {/* Air Quality Card */}
          <div className="relative bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-200 overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-red-900">Air Quality</h3>
              </div>
              <p className="text-2xl font-bold" style={{ color: aqiInfo.color }}>
                {Math.round(data.environmentalData.aqi)}
              </p>
              <p className="text-xs font-medium text-red-700 mt-0.5">{aqiInfo.label}</p>
            </div>
          </div>

          {/* Soil Quality Card */}
          <div className="relative bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200 overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-amber-900">Soil Quality</h3>
              </div>
              <p className="text-2xl font-bold text-amber-900">
                {Math.round(data.environmentalData.soilQuality)}<span className="text-sm text-amber-600">/100</span>
              </p>
            </div>
          </div>

          {/* Disasters Card */}
          <div className="relative bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200 overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-purple-900">Disasters</h3>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {data.environmentalData.disasterFrequency.toFixed(1)}
              </p>
              <p className="text-xs font-medium text-purple-700 mt-0.5">per year</p>
            </div>
          </div>

          {/* Trees Planted Card */}
          <div className="relative bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200 overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-green-900">Trees Planted</h3>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatCompactNumber(data.stats?.totalTrees || 0)}
              </p>
              <p className="text-xs font-medium text-green-700 mt-0.5">
                {data.stats && data.stats.totalTrees > 0
                  ? `${formatCompactNumber(data.stats.totalTreesPlanted)} local + ${formatCompactNumber(data.stats.totalTreesDonated)} NGO`
                  : 'Start planting today'}
              </p>
            </div>
          </div>
        </div>

        {/* Oxygen Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Oxygen Analysis</h3>
              <p className="text-xs text-gray-500">Supply vs Demand Breakdown</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Demand Card */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex flex-col">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Demand</span>
              <div className="mt-auto">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCompactNumber(Math.round(calc.penalty_adjusted_demand_kg_per_year))}
                </span>
                <span className="text-xs text-gray-500 ml-1">kg/yr</span>
              </div>
            </div>

            {/* Deficit Card */}
            <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex flex-col">
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Deficit</span>
              <div className="mt-auto">
                <span className="text-2xl font-bold text-red-700">
                  {formatCompactNumber(Math.round(calc.oxygen_deficit_kg_per_year))}
                </span>
                <span className="text-xs text-red-600 ml-1">kg/yr</span>
              </div>
            </div>

            {/* Trees Needed Card */}
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Target</span>
              <div className="mt-auto">
                <span className="text-2xl font-bold text-emerald-700">
                  {formatCompactNumber(Math.round(calc.trees_required))}
                </span>
                <span className="text-xs text-emerald-600 ml-1">trees</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Formula Breakdown */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Calculation Breakdown
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <dt className="text-gray-600">Base human O₂ demand</dt>
                <dd className="font-mono font-semibold">
                  {formatNumber(Math.round(calc.formula_breakdown.human_o2_demand_kg))} kg/yr
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <dt className="text-gray-600">Penalty factors</dt>
                <dd className="font-mono text-xs">
                  AQI {calc.formula_breakdown.aqi_penalty_factor.toFixed(2)}× ·
                  Soil {calc.formula_breakdown.soil_degradation_factor.toFixed(2)}× ·
                  Disaster {calc.formula_breakdown.disaster_loss_factor.toFixed(2)}×
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <dt className="text-gray-600">Adjusted O₂ demand</dt>
                <dd className="font-mono font-semibold text-nature-700">
                  {formatNumber(Math.round(calc.formula_breakdown.adjusted_o2_demand_kg))} kg/yr
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <dt className="text-gray-600">Per-tree O₂ supply</dt>
                <dd className="font-mono">
                  {Math.round(calc.formula_breakdown.soil_adjusted_tree_supply_kg)} kg/yr
                </dd>
              </div>
              <div className="flex justify-between py-3 bg-nature-50 -mx-6 px-6 rounded-lg mt-2">
                <dt className="font-bold text-gray-900">Trees Required</dt>
                <dd className="font-mono text-2xl font-bold text-nature-700">
                  {formatNumber(Math.round(calc.trees_required))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Assumptions & Data Sources */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Methodology & Sources
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-2">Key Assumptions:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {calc.assumptions.slice(0, 4).map((item, idx) => (
                    <li key={idx} className="text-xs">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Data Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {calc.data_sources.map((source, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs border border-gray-300">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-300 space-y-2">
                <p className="text-xs text-gray-500">
                  <strong>Confidence:</strong>{' '}
                  <span className="capitalize font-semibold text-gray-700">{calc.confidence_level}</span>
                </p>
                <div className="space-y-1">
                  {/* Detailed sources removed as per user request to reduce clutter */}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  );
}

export function DistrictResultsSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header Skeleton */}
      <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-32 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>

        {/* Oxygen Analysis Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100 h-24 flex flex-col justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {[...Array(2)].map((_, i) => (
             <div key={i} className="bg-gray-50 rounded-lg p-5 border border-gray-200 h-64">
               <Skeleton className="h-5 w-48 mb-6" />
               <div className="space-y-4">
                 {[...Array(4)].map((_, j) => (
                   <div key={j} className="flex justify-between">
                     <Skeleton className="h-4 w-32" />
                     <Skeleton className="h-4 w-20" />
                   </div>
                 ))}
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}