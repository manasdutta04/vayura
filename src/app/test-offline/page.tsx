'use client';

import { useState } from 'react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useDistrictData } from '@/lib/hooks/use-district-data';
import { useOnlineStatus } from '@/lib/hooks/use-online-status';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

const TEST_DISTRICTS = ['mumbai', 'delhi', 'bangalore-urban', 'kolkata'];

export default function TestOfflinePage() {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('mumbai');
    const isOnline = useOnlineStatus();
    const { data, loading, error, metadata, refresh } = useDistrictData(selectedDistrict);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pb-20">
                <div className="max-w-6xl mx-auto px-6 pt-10">
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            🧪 Offline Mode Test Suite
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Test the offline caching feature with mock data
                        </p>

                        {/* Connection Status */}
                        <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                            {isOnline ? (
                                <>
                                    <Wifi className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold text-green-900">Online</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-5 w-5 text-amber-600" />
                                    <span className="font-semibold text-amber-900">Offline</span>
                                </>
                            )}
                        </div>

                        {/* District Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Test District:
                            </label>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {TEST_DISTRICTS.map((district) => (
                                    <option key={district} value={district}>
                                        {district.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cache Status */}
                        {metadata.fromCache && (
                            <OfflineIndicator
                                fromCache={metadata.fromCache}
                                cacheTimestamp={metadata.timestamp}
                                isStale={metadata.isStale}
                                className="mb-6"
                            />
                        )}

                        {/* District Data Display */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">District Data:</h3>
                            {loading && <p className="text-gray-600">Loading...</p>}
                            {error && <p className="text-red-600">Error: {error.message}</p>}
                            {data && (
                                <div className="space-y-2 text-sm">
                                    <p><strong>Name:</strong> {data.name}</p>
                                    <p><strong>State:</strong> {data.state}</p>
                                    <p><strong>Population:</strong> {data.population.toLocaleString()}</p>
                                    <p><strong>AQI:</strong> {data.environmentalData.aqi}</p>
                                    <p><strong>Soil Quality:</strong> {data.environmentalData.soilQuality}/100</p>
                                    <p><strong>Trees Required:</strong> {data.oxygenCalculation.trees_required.toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={refresh}
                            disabled={!isOnline || loading}
                            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
                        <h2 className="text-xl font-bold text-blue-900 mb-4">
                            📋 Testing Instructions
                        </h2>
                        <ol className="space-y-3 text-sm text-blue-800">
                            <li><strong>1. Online Test:</strong> Select a district and verify data loads</li>
                            <li><strong>2. Cache Test:</strong> Check DevTools → Application → IndexedDB → vayura-cache</li>
                            <li><strong>3. Go Offline:</strong> Open DevTools (F12) → Network tab → Set to &quot;Offline&quot;</li>
                            <li><strong>4. Reload Page:</strong> Press Ctrl+R to reload</li>
                            <li><strong>5. Verify:</strong> 
                                <ul className="ml-6 mt-2 space-y-1">
                                    <li>• Offline banner appears at top</li>
                                    <li>• Cache indicator shows &quot;Offline Mode&quot;</li>
                                    <li>• Data displays correctly</li>
                                    <li>• Refresh button is disabled</li>
                                </ul>
                            </li>
                            <li><strong>6. Go Online:</strong> Set throttling back to &quot;No throttling&quot;</li>
                            <li><strong>7. Refresh:</strong> Click &quot;Refresh Data&quot; button</li>
                            <li><strong>8. Verify:</strong> Offline banner disappears, data updates</li>
                        </ol>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
