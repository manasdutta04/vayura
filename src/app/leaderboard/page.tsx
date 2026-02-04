'use client';

import Link from 'next/link';

import { useEffect, useState } from 'react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { LeaderboardEntry } from '@/lib/types';
import { formatCompactNumber } from '@/lib/utils/helpers';
import { VALIDATED_DATA_SOURCES } from '@/lib/data-sources/validation';
import { ENVIRONMENTAL_CONSTANTS } from '@/lib/constants/environmental';

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const res = await fetch('/api/leaderboard', {
        cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDataSources, setShowDataSources] = useState(false);

    useEffect(() => {
        getLeaderboard().then(data => {
            setEntries(data);
            setLoading(false);
        });
    }, []);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-white pb-20">
                <section className="max-w-6xl mx-auto px-6 pt-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
                            State Leaderboard
                        </h1>
                        <p className="text-sm text-gray-500">
                            States ranked by oxygen self-sufficiency
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 whitespace-nowrap">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            State
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            Trees
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            O₂ Supply
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            O₂ Needed
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            2050 Target + Resilience
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {loading && (
                                        <>
                                            {[...Array(10)].map((_, idx) => (
                                                <tr key={idx} className="animate-pulse">
                                                    <td className="px-4 py-3">
                                                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-2">
                                                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                            <div className="h-3 w-20 bg-gray-100 rounded"></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="h-4 w-20 bg-gray-200 rounded ml-auto"></div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="h-4 w-20 bg-gray-200 rounded ml-auto"></div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="space-y-2">
                                                            <div className="h-5 w-16 bg-gray-200 rounded ml-auto"></div>
                                                            <div className="h-3 w-24 bg-gray-100 rounded ml-auto"></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    {!loading && entries.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-6 text-center text-sm text-gray-500"
                                            >
                                                No leaderboard data yet. Start by planting or donating trees.
                                            </td>
                                        </tr>
                                    )}
                                    {!loading && entries.map((entry, idx) => {
                                        const percentMet = entry.percentageMet || 0;
                                        const isTop3 = idx < 3;
                                        const badgeColor = idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-300' : idx === 2 ? 'bg-orange-300' : '';

                                        // Calculate tree needs for 2050 + RESILIENCE BUFFER
                                        const cappedPercentMet = Math.min(Math.max(percentMet, 0), 100);

                                        // India's population growth rate: ~1.1% per year (2024-2050 projection)
                                        const currentYear = 2026;
                                        const targetYear = 2050;
                                        const yearsToProject = targetYear - currentYear;
                                        const annualGrowthRate = 0.011; // 1.1% per year

                                        // Project population to 2050: P_future = P_current * (1 + r)^t
                                        const currentPopulation = entry.population || 0;
                                        const projectedPopulation2050 = currentPopulation * Math.pow(1 + annualGrowthRate, yearsToProject);

                                        // Calculate O2 needed for 2050 population (proportional to population)
                                        const o2Needed2050 = currentPopulation > 0 ? (entry.o2Needed || 0) * (projectedPopulation2050 / currentPopulation) : (entry.o2Needed || 0);

                                        // Calculate O2 DEFICIT: what we'll need minus what we currently have
                                        const currentO2Supply = entry.o2Supply || 0;
                                        const o2Deficit2050 = o2Needed2050 - currentO2Supply;

                                        // Calculate base trees needed (deficit only)
                                        const baseTreesNeeded = o2Deficit2050 > 0 ? Math.ceil(o2Deficit2050 / ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR) : 0;

                                        // Add RESILIENCE BUFFER: 25% extra for climate change, disasters, mortality
                                        // Even self-sufficient states need this for forest health and adaptation
                                        const resilienceMultiplier = 1.25; // 25% buffer

                                        // For deficit states: add 25% to deficit
                                        // For self-sufficient states: calculate 10% of total 2050 need as maintenance target
                                        const treesWithResilience = baseTreesNeeded > 0
                                            ? Math.ceil(baseTreesNeeded * resilienceMultiplier)
                                            : Math.ceil(o2Needed2050 / ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR * 0.10); // 10% as climate resilience buffer for self-sufficient states

                                        // Color code based on magnitude
                                        const percentageColor = treesWithResilience <= 1000000 ? 'text-green-600' :
                                            treesWithResilience <= 10000000 ? 'text-green-500' :
                                                treesWithResilience <= 50000000 ? 'text-yellow-600' :
                                                    treesWithResilience <= 100000000 ? 'text-orange-600' :
                                                        'text-red-600';

                                        return (
                                            <tr
                                                key={entry.id}
                                                className={`hover:bg-nature-50/60 ${isTop3 ? 'bg-yellow-50/30' : ''}`}
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        {isTop3 && (
                                                            <span className={`inline-block w-2 h-2 rounded-full ${badgeColor}`}></span>
                                                        )}
                                                        <span>{entry.rank ?? '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div className="font-semibold text-base">{entry.state}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Pop: {formatCompactNumber(entry.population || 0)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                    <span className={entry.totalTrees > 0 ? 'text-nature-600 font-semibold' : 'text-gray-400'}>
                                                        {formatCompactNumber(entry.totalTrees || 0)}
                                                    </span>
                                                    {entry.totalTrees > 0 && (
                                                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                                            {entry.existingForestTrees && entry.existingForestTrees > 0 && (
                                                                <div>Forest: {formatCompactNumber(entry.existingForestTrees)}</div>
                                                            )}
                                                            {(entry.totalTreesPlanted > 0 || entry.totalTreesDonated > 0) && (
                                                                <div>
                                                                    User: {formatCompactNumber(entry.totalTreesPlanted)} planted + {formatCompactNumber(entry.totalTreesDonated)} donated
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                    <span className={entry.o2Supply && entry.o2Supply > 0 ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                                                        {formatCompactNumber(entry.o2Supply || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                    <span className="text-red-600 font-semibold">
                                                        {formatCompactNumber(entry.o2Needed || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right">
                                                    <div className={`text-lg font-bold ${percentageColor}`}>
                                                        {formatCompactNumber(treesWithResilience)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        By 2050 (pop: {formatCompactNumber(Math.round(projectedPopulation2050))})
                                                    </div>
                                                    {baseTreesNeeded === 0 ? (
                                                        <div className="text-xs text-green-600 font-medium mt-1">
                                                            For climate resilience
                                                        </div>
                                                    ) : cappedPercentMet >= 100 ? (
                                                        <div className="text-xs text-yellow-600 font-medium mt-1">
                                                            Future need + resilience
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-orange-600 font-medium mt-1">
                                                            Critical need + buffer
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-8 space-y-3 bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                                How Rankings Work
                            </p>
                            <Link
                                href="/data-policy"
                                className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-medium transition-colors"
                                title="View Data Sources"
                            >
                                i
                            </Link>
                        </div>
                        <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                            <li><span className="text-red-600 font-semibold">O₂ Needed</span> = State's total oxygen demand based on population, AQI, soil quality, and disasters</li>
                            <li><span className="text-green-600 font-semibold">O₂ Supply</span> = Oxygen produced by trees planted and donated ({ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR} kg/year per tree)</li>
                            <li><span className="font-semibold">2050 Target + Resilience</span> = Trees needed for 2050 + climate resilience buffer (25% extra for disasters, mortality, climate change)</li>
                            <li><strong>For Deficit States:</strong> Base deficit + 25% resilience buffer</li>
                            <li><strong>For Self-Sufficient States:</strong> 10% of 2050 need as climate adaptation/forest health buffer</li>
                            <li><strong>Ranking:</strong> States are ranked by current oxygen self-sufficiency (O₂ Supply ÷ O₂ Needed)</li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-3">
                            <strong>Color Guide (Planting Targets):</strong>
                            <span className="text-green-600 ml-2">≤1M trees = Low target</span>
                            <span className="text-yellow-600 ml-2">1-50M trees = Medium target</span>
                            <span className="text-orange-600 ml-2">50-100M trees = High target</span>
                            <span className="text-red-600 ml-2">&gt;100M trees = Critical target</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Calculations are based on scientific research (WHO, USDA Forest Service). Data is for educational purposes only.
                        </p>
                    </div>

                    {/* Data Sources Modal */}
                    {showDataSources && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDataSources(false)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="sticky top-0 bg-gradient-to-r from-nature-500 to-sky-500 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">Data Sources</h2>
                                    <button
                                        onClick={() => setShowDataSources(false)}
                                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Validated Data Sources</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            All data used in Vayura comes from verified sources. Click on any source to visit the official website.
                                        </p>
                                    </div>

                                    {/* High Reliability Sources */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-green-600"></span>
                                            High Reliability (Government Data)
                                        </h4>
                                        <div className="space-y-3">
                                            {Object.values(VALIDATED_DATA_SOURCES)
                                                .filter(s => s.reliability === 'high')
                                                .map((source, idx) => (
                                                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h5 className="font-semibold text-gray-900">{source.name}</h5>
                                                                <p className="text-xs text-gray-600 mt-1">{source.description}</p>
                                                                {source.lastUpdated && (
                                                                    <p className="text-xs text-gray-500 mt-1">Last Updated: {source.lastUpdated}</p>
                                                                )}
                                                            </div>
                                                            {source.url && (
                                                                <a
                                                                    href={source.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
                                                                >
                                                                    Visit ↗
                                                                </a>
                                                            )}
                                                        </div>
                                                        {source.license && (
                                                            <p className="text-xs text-gray-500 mt-2">License: {source.license}</p>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Medium Reliability Sources */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-yellow-600"></span>
                                            Medium Reliability (AI/API)
                                        </h4>
                                        <div className="space-y-3">
                                            {Object.values(VALIDATED_DATA_SOURCES)
                                                .filter(s => s.reliability === 'medium')
                                                .map((source, idx) => (
                                                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h5 className="font-semibold text-gray-900">{source.name}</h5>
                                                                <p className="text-xs text-gray-600 mt-1">{source.description}</p>
                                                            </div>
                                                            {source.url && (
                                                                <a
                                                                    href={source.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
                                                                >
                                                                    Visit ↗
                                                                </a>
                                                            )}
                                                        </div>
                                                        {source.license && (
                                                            <p className="text-xs text-gray-500 mt-2">License: {source.license}</p>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Scientific References */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Scientific References</h4>
                                        <ul className="text-xs text-gray-600 space-y-2 ml-4 list-disc">
                                            <li><strong>Human O₂ Consumption:</strong> WHO Respiratory Health Standards (550 L/day)</li>
                                            <li><strong>Tree O₂ Production:</strong> USDA Forest Service Research (110 kg/year per mature tree)</li>
                                            <li><strong>AQI Categories:</strong> EPA Air Quality Index standards</li>
                                        </ul>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            <strong>Note:</strong> Data sources are validated and attributed. For more details, see{' '}
                                            <a href="/DATA_SOURCES.md" target="_blank" className="text-nature-600 hover:underline">
                                                DATA_SOURCES.md
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </>
    );
}
