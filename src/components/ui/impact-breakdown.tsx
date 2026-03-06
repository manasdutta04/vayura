'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';
import { UserImpact } from '@/lib/types';
import { formatCompactNumber } from '@/lib/utils/helpers';
import { Wind, TreeDeciduous, TrendingUp, Info } from 'lucide-react';

interface ImpactBreakdownProps {
    impact: UserImpact;
    loading?: boolean;
}

export function ImpactBreakdown({ impact, loading }: ImpactBreakdownProps) {
    const t = useTranslations('dashboard');

    const chartData = useMemo(() => {
        return impact.districts.map((district) => ({
            name: district.districtName.length > 15 
                ? district.districtName.substring(0, 15) + '...' 
                : district.districtName,
            fullName: district.districtName,
            trees: district.treeCount,
            oxygenOffset: Math.round(district.oxygenOffset),
            percentageOffset: district.percentageOffset,
            state: district.state,
        }));
    }, [impact.districts]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 w-48 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-100 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (!impact.hasContributions) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TreeDeciduous className="w-5 h-5 text-green-600" />
                    {t('impactBreakdown') || 'District Impact Breakdown'}
                </h3>
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TreeDeciduous className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">
                        {t('noContributionsImpact') || 'Start planting to see your district-level impact.'}
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                        {t('contributeToSeeImpact') || 'Track how your trees reduce oxygen deficit across Indian districts.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/plant"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            🌱 {t('plantTreeCTA') || 'Plant a Tree'}
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            🔍 {t('exploreDistrictsCTA') || 'Explore Districts'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TreeDeciduous className="w-5 h-5 text-green-600" />
                {t('impactBreakdown') || 'District Impact Breakdown'}
            </h3>

            {/* Most Impacted District Highlight */}
            {impact.mostImpactedDistrict && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
                    <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-green-700 font-medium mb-1">
                                {t('yourHighestImpact') || 'Your Highest Impact District'}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-xl font-bold text-gray-900">
                                    {impact.mostImpactedDistrict.districtName}
                                </h4>
                                {impact.mostImpactedDistrict.state && (
                                    <span className="text-sm text-gray-500">
                                        {impact.mostImpactedDistrict.state}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="text-gray-600">
                                    <span className="font-medium text-green-600">
                                        {impact.mostImpactedDistrict.percentageOffset.toFixed(2)}%
                                    </span>
                                    {' '}{t('ofDeficit') || 'of deficit'}
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-600">
                                    <TreeDeciduous className="w-4 h-4 inline mr-1" />
                                    {impact.mostImpactedDistrict.treeCount} {t('trees') || 'trees'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">{t('totalTrees') || 'Total Trees'}</p>
                    <p className="text-2xl font-bold text-gray-900">{impact.totalTrees}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">{t('oxygenOffset') || 'O₂ Offset'}</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {formatCompactNumber(impact.totalOxygenOffset)} <span className="text-sm font-normal">kg/yr</span>
                    </p>
                </div>
            </div>

            {/* Bar Chart */}
            {chartData.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <BarChart className="w-4 h-4" />
                        {t('districtContribution') || 'District Contribution'}
                    </h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={chartData} 
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    type="number" 
                                    tickFormatter={(value) => `${value}%`}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <YAxis 
                                    type="category" 
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#374151', fontSize: 12 }}
                                    width={75}
                                />
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                                                    <p className="font-semibold text-gray-900">{data.fullName}</p>
                                                    {data.state && <p className="text-sm text-gray-500">{data.state}</p>}
                                                    <div className="mt-2 space-y-1 text-sm">
                                                        <p className="text-gray-600">
                                                            <span className="font-medium text-green-600">{data.percentageOffset.toFixed(2)}%</span> of deficit
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <TreeDeciduous className="w-3 h-3 inline mr-1" />
                                                            {data.trees} trees
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <Wind className="w-3 h-3 inline mr-1" />
                                                            {formatCompactNumber(data.oxygenOffset)} kg O₂/yr
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="percentageOffset" radius={[0, 4, 4, 0]} maxBarSize={30}>
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index === 0 ? '#10b981' : COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Table View */}
            <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">
                                {t('district') || 'District'}
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">
                                {t('trees') || 'Trees'}
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">
                                {t('o2Offset') || 'O₂ Offset'}
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">
                                {t('ofDeficit') || '% of Deficit'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {impact.districts.map((district, index) => (
                            <tr key={district.districtId} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        <div>
                                            <p className="font-medium text-gray-900">{district.districtName}</p>
                                            {district.state && (
                                                <p className="text-xs text-gray-500">{district.state}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600">
                                    {district.treeCount}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600">
                                    {formatCompactNumber(district.oxygenOffset)} kg
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        district.percentageOffset >= 1 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {district.percentageOffset.toFixed(2)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Info Note */}
            <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                    {t('impactNote') || 'Oxygen offset is calculated based on 110 kg O₂/year per mature tree (USDA Forest Service). Percentage shows your contribution toward each district\'s oxygen deficit.'}
                </p>
            </div>
        </div>
    );
}

