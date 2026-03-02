'use client';

import { DistrictImpact, UserImpactSummary } from '@/lib/types';
import { formatCompactNumber } from '@/lib/utils/helpers';
import Link from 'next/link';

interface ImpactBreakdownProps {
  impactData: UserImpactSummary | null;
  isLoading?: boolean;
}

export function ImpactBreakdown({ impactData, isLoading }: ImpactBreakdownProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!impactData || impactData.districtImpacts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Breakdown</h3>
        <p className="text-gray-500 text-sm">
          No verified contributions yet. Plant trees or donate to see your impact!
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/plant"
            className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Plant a Tree
          </Link>
          <Link
            href="/donate"
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Donate
          </Link>
        </div>
      </div>
    );
  }

  const { districtImpacts, mostImpactedDistrict, totalTrees, totalOxygenOffsetKg, totalDistricts } = impactData;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Breakdown</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-700">{formatCompactNumber(totalTrees)}</p>
          <p className="text-xs text-green-600">Trees Planted</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-700">{formatCompactNumber(Math.round(totalOxygenOffsetKg))}</p>
          <p className="text-xs text-blue-600">kg O₂ Offset</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-700">{totalDistricts}</p>
          <p className="text-xs text-purple-600">Districts</p>
        </div>
      </div>

      {/* Most Impacted District */}
      {mostImpactedDistrict && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
            🌳 Most Impacted District
          </p>
          <p className="text-lg font-bold text-gray-900">
            {mostImpactedDistrict.districtName}
            {mostImpactedDistrict.state && <span className="text-gray-500 font-normal">, {mostImpactedDistrict.state}</span>}
          </p>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              {formatCompactNumber(mostImpactedDistrict.treesContributed)} trees
            </span>
            <span className="text-gray-600">
              {mostImpactedDistrict.percentOfDeficitOffset.toFixed(2)}% of deficit
            </span>
          </div>
        </div>
      )}

      {/* District Breakdown Table */}
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                District
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trees
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                O₂ Offset
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                % of Deficit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {districtImpacts.map((impact: DistrictImpact) => (
              <tr key={impact.districtId} className="hover:bg-gray-50">
                <td className="px-3 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {impact.districtName}
                  </p>
                  {impact.state && (
                    <p className="text-xs text-gray-500">{impact.state}</p>
                  )}
                </td>
                <td className="px-3 py-3 text-right text-sm text-gray-600">
                  {formatCompactNumber(impact.treesContributed)}
                </td>
                <td className="px-3 py-3 text-right text-sm text-gray-600">
                  {formatCompactNumber(Math.round(impact.oxygenOffsetKg))} kg
                </td>
                <td className="px-3 py-3 text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    impact.percentOfDeficitOffset >= 10 
                      ? 'bg-green-100 text-green-800'
                      : impact.percentOfDeficitOffset >= 1
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {impact.percentOfDeficitOffset.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View More Link */}
      {districtImpacts.length > 5 && (
        <div className="mt-4 text-center">
          <Link
            href="/contribution"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View all {districtImpacts.length} districts →
          </Link>
        </div>
      )}
    </div>
  );
}

export function ImpactBreakdownSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
