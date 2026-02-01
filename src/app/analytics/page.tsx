'use client';

import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/admin-guard';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar,
    AreaChart, Area, Treemap
} from 'recharts';
import { 
    TrendingUp, TreeDeciduous, Wind, Map, 
    Download, RefreshCw,
    ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react';
import { AnalyticsData } from '@/lib/types/analytics';

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterRange, setFilterRange] = useState('6m');
    const [selectedRegion, setSelectedRegion] = useState('all');

    const filteredRegionalData = data?.regionalData.filter(r => 
        selectedRegion === 'all' || r.regionName === selectedRegion
    ) || [];

    const filteredTimeSeries = data?.timeSeries.filter(s => {
        const date = new Date(s.timestamp);
        const now = new Date();
        if (filterRange === '1m') return date >= new Date(now.setMonth(now.getMonth() - 1));
        if (filterRange === '6m') return date >= new Date(now.setMonth(now.getMonth() - 6));
        if (filterRange === '1y') return date >= new Date(now.setFullYear(now.getFullYear() - 1));
        return true;
    }) || [];

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/analytics');
            if (!response.ok) throw new Error('Failed to fetch analytics');
            const result = await response.json();
            setData(result);
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        window.print();
    };

    const exportToCSV = () => {
        if (!data) return;
        const headers = ['Date', 'Total Trees', 'Total Oxygen (kg)', 'Contribution Count'];
        const rows = data.timeSeries.map(s => [
            new Date(s.timestamp).toLocaleDateString(),
            s.totalTrees,
            s.totalOxygen,
            s.contributionCount
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `vayura-analytics-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <AdminGuard>
            <Header />
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8 print:bg-white print:p-0">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-600">Comprehensive insights into oxygen intelligence and reforestation</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={fetchAnalytics}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>CSV</span>
                        </button>
                        <button 
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>PDF</span>
                        </button>
                    </div>
                </header>

                <div className="hidden print:block mb-8">
                    <h1 className="text-2xl font-bold">Vayura Analytics Report</h1>
                    <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse"></div>
                        ))}
                    </div>
                ) : data && (
                    <>
                        {/* Metric Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <MetricCard 
                                title="Total Trees" 
                                value={data.globalMetrics.totalTrees.toLocaleString()} 
                                icon={<TreeDeciduous className="w-6 h-6 text-green-600" />}
                                trend="+12.5%"
                                trendUp={true}
                            />
                            <MetricCard 
                                title="O2 Production" 
                                value={`${(data.globalMetrics.totalOxygen / 1000).toFixed(1)}t`} 
                                icon={<Wind className="w-6 h-6 text-blue-600" />}
                                trend="+8.2%"
                                trendUp={true}
                            />
                            <MetricCard 
                                title="Avg AQI" 
                                value={data.globalMetrics.avgAQI.toFixed(0)} 
                                icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
                                trend="-2.4%"
                                trendUp={false}
                            />
                            <MetricCard 
                                title="Active Regions" 
                                value={data.globalMetrics.totalDistricts.toString()} 
                                icon={<Map className="w-6 h-6 text-purple-600" />}
                            />
                        </div>

                        {/* Main Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Time Series Chart */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900">Oxygen Demand Trends</h3>
                                    <select 
                                        className="text-sm border-none bg-gray-100 rounded-md px-2 py-1"
                                        value={filterRange}
                                        onChange={(e) => setFilterRange(e.target.value)}
                                    >
                                        <option value="1m">Last Month</option>
                                        <option value="6m">Last 6 Months</option>
                                        <option value="1y">Last Year</option>
                                    </select>
                                </div>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={filteredTimeSeries}>
                                            <defs>
                                                <linearGradient id="colorO2" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis 
                                                dataKey="timestamp" 
                                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short' })}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                            />
                                            <YAxis 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                            />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="totalOxygen" 
                                                stroke="#10b981" 
                                                strokeWidth={2}
                                                fillOpacity={1} 
                                                fill="url(#colorO2)" 
                                                name="Oxygen Production (kg)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Comparative Analytics */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900">Top States Comparison</h3>
                                    <select 
                                        className="text-sm border-none bg-gray-100 rounded-md px-2 py-1"
                                        value={selectedRegion}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                    >
                                        <option value="all">All States</option>
                                        {data.regionalData.map(r => (
                                            <option key={r.regionName} value={r.regionName}>{r.regionName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={filteredRegionalData.slice(0, 5)}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis 
                                                dataKey="regionName" 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                            />
                                            <YAxis 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                            />
                                            <Tooltip 
                                                cursor={{ fill: '#f9fafb' }}
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                            />
                                            <Legend verticalAlign="top" align="right" iconType="circle" />
                                            <Bar dataKey="metrics.totalTrees" name="Trees" fill="#059669" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="metrics.oxygenDemand" name="Demand (Scaled)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Distribution Chart */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                                <h3 className="font-bold text-gray-900 mb-6">Regional Distribution (Treemap)</h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <Treemap
                                            data={filteredRegionalData.map(r => ({ name: r.regionName, size: r.metrics.totalTrees }))}
                                            dataKey="size"
                                            aspectRatio={4 / 3}
                                            stroke="#fff"
                                            fill="#059669"
                                        >
                                            <Tooltip />
                                        </Treemap>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Predictive Insights */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    Predictive Insights
                                    <Info className="w-4 h-4 text-gray-400" />
                                </h3>
                                <div className="space-y-6">
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                        <p className="text-sm text-green-700 font-medium mb-1">Projected O2 (2030)</p>
                                        <p className="text-2xl font-bold text-green-900">{(data.predictive.projectedOxygen2030 / 1000).toFixed(1)}t</p>
                                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                            <ArrowUpRight className="w-3 h-3" />
                                            +50% from current levels
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-sm text-blue-700 font-medium mb-1">Trees to Self-Sufficiency</p>
                                        <p className="text-2xl font-bold text-blue-900">{data.predictive.treesNeededForSelfSufficiency.toLocaleString()}</p>
                                        <p className="text-xs text-blue-600 mt-1">Target for 100% O2 coverage</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                        <p className="text-sm text-purple-700 font-medium mb-1">Current Monthly Rate</p>
                                        <p className="text-2xl font-bold text-purple-900">{data.predictive.currentGrowthRate.toFixed(0)} trees/mo</p>
                                        <p className="text-xs text-purple-600 mt-1">Based on last 6 months activity</p>
                                    </div>
                                </div>

                                {data.predictive.aiSummary && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                AI Strategic Analysis
                                            </h4>
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                                Gemini Powered
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">
                                            &ldquo;{data.predictive.aiSummary}&rdquo;
                                        </p>
                                        {data.predictive.recommendations && (
                                            <div className="space-y-2">
                                                {data.predictive.recommendations.map((rec, i) => (
                                                    <div key={i} className="flex gap-2 items-start">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                        <p className="text-xs text-gray-700">{rec}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comparative Data Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900">Comparative Regional Statistics</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Region</th>
                                            <th className="px-6 py-4">Trees</th>
                                            <th className="px-6 py-4">O2 Prod (kg)</th>
                                            <th className="px-6 py-4">Avg AQI</th>
                                            <th className="px-6 py-4">O2 Gap</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.regionalData.slice(0, 10).map((region, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{region.regionName}</td>
                                                <td className="px-6 py-4 text-gray-600">{region.metrics.totalTrees.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-gray-600">{region.metrics.oxygenProduction.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-gray-600">{region.metrics.avgAQI.toFixed(1)}</td>
                                                <td className="px-6 py-4 text-gray-600">{region.metrics.oxygenGap.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        region.metrics.oxygenGap <= 0 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {region.metrics.oxygenGap <= 0 ? 'Surplus' : 'Deficit'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
                </div>
            </div>
            <Footer />
        </AdminGuard>
    );
}

function MetricCard({ title, value, icon, trend, trendUp }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trendUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
}
