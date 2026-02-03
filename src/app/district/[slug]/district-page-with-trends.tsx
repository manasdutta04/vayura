'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { TrendArrow, TrendBadge } from '@/components/ui/TrendIndicator';
import { formatCompactNumber, formatNumber, getAQICategory } from '@/lib/utils/helpers';
import { ExportButtons } from '@/components/ui/ExportButtons';
import { PlantationRecommendations } from '@/components/ui/PlantationRecommendations';
import { 
  MapPin, 
  Users, 
  Wind, 
  Mountain, 
  AlertTriangle,
  Leaf,
  TrendingUp,
  Database,
  Download,
  ArrowLeft
} from 'lucide-react';

interface DistrictData {
  id: string;
  name: string;
  state: string;
  slug: string;
  population: number;
  environmentalData: {
    aqi: number;
    soilQuality: number;
    disasterFrequency: number;
    dataSource?: string;
  };
  oxygenCalculation: {
    trees_required: number;
    formula_breakdown: {
      human_o2_demand_kg: number;
      adjusted_o2_demand_kg: number;
      soil_adjusted_tree_supply_kg: number;
      aqi_penalty_factor: number;
      soil_degradation_factor: number;
      disaster_loss_factor: number;
    };
    assumptions: string[];
    data_sources: string[];
    confidence_level: string;
  };
  treeRecommendations?: any[];
}

interface PreviousDistrictData {
  population?: number;
  aqi?: number;
  soilQuality?: number;
  disasterFrequency?: number;
  treesRequired?: number;
  oxygenDemand?: number;
  oxygenSupply?: number;
}

export default function DistrictPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [districtData, setDistrictData] = useState<DistrictData | null>(null);
  const [previousData, setPreviousData] = useState<PreviousDistrictData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDistrictData() {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch current district data
        const response = await fetch(`/api/districts/detail/${slug}`);
        if (!response.ok) {
          throw new Error('District not found');
        }
        const data = await response.json();
        setDistrictData(data);

        // Fetch previous week's data for trends
        if (data?.id) {
          const previousResponse = await fetch(`/api/districts/${data.id}/previous`);
          if (previousResponse.ok) {
            const prevData = await previousResponse.json();
            setPreviousData(prevData);
          }
        }
      } catch (err: any) {
        console.error('Error fetching district data:', err);
        setError(err.message || 'Failed to load district data');
      } finally {
        setLoading(false);
      }
    }

    fetchDistrictData();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-8">
              {/* Back button skeleton */}
              <div className="h-10 w-32 bg-gray-200 rounded-lg" />
              
              {/* Header skeleton */}
              <div className="space-y-4">
                <div className="h-12 w-3/4 bg-gray-200 rounded-lg" />
                <div className="h-6 w-1/2 bg-gray-100 rounded-lg" />
              </div>

              {/* Cards skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-40 bg-gray-200 rounded-xl" />
                ))}
              </div>

              {/* Content skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96 bg-gray-200 rounded-xl" />
                <div className="h-96 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !districtData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'District not found'}
            </h2>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const aqiInfo = getAQICategory(districtData.environmentalData.aqi);
  const calc = districtData.oxygenCalculation;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Search</span>
          </Link>

          {/* Page Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {districtData.name}
                  </h1>
                </div>
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  {districtData.state} • Population: {formatNumber(districtData.population)}
                  {previousData?.population && (
                    <TrendArrow
                      currentValue={districtData.population}
                      previousValue={previousData.population}
                      size="sm"
                    />
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/plant"
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  Plant a Tree
                </Link>
                <ExportButtons data={districtData} slug={slug} />
              </div>
            </div>
          </div>

          {/* Metric Cards with Trend Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Population Card */}
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200 overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-900">Population</h3>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-blue-900">
                    {formatCompactNumber(districtData.population)}
                  </p>
                  {previousData?.population && (
                    <TrendArrow
                      currentValue={districtData.population}
                      previousValue={previousData.population}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Air Quality Card */}
            <div className="relative bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-6 border border-orange-200 overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Wind className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-orange-900">Air Quality</h3>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold" style={{ color: aqiInfo.color }}>
                    {Math.round(districtData.environmentalData.aqi)}
                  </p>
                  {previousData?.aqi && (
                    <TrendArrow
                      currentValue={districtData.environmentalData.aqi}
                      previousValue={previousData.aqi}
                      isInverted={true}
                      size="sm"
                    />
                  )}
                </div>
                <p className="text-xs font-medium" style={{ color: aqiInfo.color }}>
                  {aqiInfo.label}
                </p>
              </div>
            </div>

            {/* Soil Quality Card */}
            <div className="relative bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-6 border border-amber-200 overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                    <Mountain className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-amber-900">Soil Quality</h3>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-amber-900">
                    {Math.round(districtData.environmentalData.soilQuality)}
                    <span className="text-lg text-amber-600">/100</span>
                  </p>
                  {previousData?.soilQuality && (
                    <TrendArrow
                      currentValue={districtData.environmentalData.soilQuality}
                      previousValue={previousData.soilQuality}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Disasters Card */}
            <div className="relative bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200 overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-purple-900">Disasters</h3>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-3xl font-bold text-purple-900">
                    {districtData.environmentalData.disasterFrequency}
                  </p>
                  {previousData?.disasterFrequency && (
                    <TrendArrow
                      currentValue={districtData.environmentalData.disasterFrequency}
                      previousValue={previousData.disasterFrequency}
                      isInverted={true}
                      size="sm"
                    />
                  )}
                </div>
                <p className="text-xs text-purple-600">per year</p>
              </div>
            </div>
          </div>

          {/* Oxygen Analysis Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Oxygen Analysis</h2>
                <p className="text-sm text-gray-600">District-level oxygen demand and supply metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Oxygen Demand */}
              <div className="p-6 rounded-xl bg-red-50 border border-red-100">
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 block">
                  Demand
                </span>
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-3xl font-bold text-red-700">
                      {formatCompactNumber(Math.round(calc.formula_breakdown.adjusted_o2_demand_kg))}
                    </span>
                    <span className="text-sm text-red-600 ml-1">kg/yr</span>
                  </div>
                  {previousData?.oxygenDemand && (
                    <TrendArrow
                      currentValue={calc.formula_breakdown.adjusted_o2_demand_kg}
                      previousValue={previousData.oxygenDemand}
                      isInverted={true}
                      size="sm"
                    />
                  )}
                </div>
              </div>

              {/* Oxygen Supply */}
              <div className="p-6 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 block">
                  Supply per Tree
                </span>
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-3xl font-bold text-blue-700">
                      {formatCompactNumber(Math.round(calc.formula_breakdown.soil_adjusted_tree_supply_kg))}
                    </span>
                    <span className="text-sm text-blue-600 ml-1">kg/yr</span>
                  </div>
                  {previousData?.oxygenSupply && (
                    <TrendArrow
                      currentValue={calc.formula_breakdown.soil_adjusted_tree_supply_kg}
                      previousValue={previousData.oxygenSupply}
                      size="sm"
                    />
                  )}
                </div>
              </div>

              {/* Trees Required */}
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 block">
                  Trees Required
                </span>
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-3xl font-bold text-emerald-700">
                      {formatCompactNumber(Math.round(calc.trees_required))}
                    </span>
                    <span className="text-sm text-emerald-600 ml-1">trees</span>
                  </div>
                  {previousData?.treesRequired && (
                    <TrendBadge
                      currentValue={calc.trees_required}
                      previousValue={previousData.treesRequired}
                      isInverted={true}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Formula Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Calculation Breakdown</h3>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <dt className="text-gray-600">Base human O₂ demand</dt>
                  <dd className="font-mono font-semibold text-gray-900">
                    {formatNumber(Math.round(calc.formula_breakdown.human_o2_demand_kg))} kg/yr
                  </dd>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <dt className="text-gray-600">Penalty factors</dt>
                  <dd className="font-mono text-xs text-gray-700">
                    AQI {calc.formula_breakdown.aqi_penalty_factor.toFixed(2)}× •
                    Soil {calc.formula_breakdown.soil_degradation_factor.toFixed(2)}× •
                    Disaster {calc.formula_breakdown.disaster_loss_factor.toFixed(2)}×
                  </dd>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <dt className="text-gray-600">Adjusted O₂ demand</dt>
                  <dd className="font-mono font-semibold text-green-700">
                    {formatNumber(Math.round(calc.formula_breakdown.adjusted_o2_demand_kg))} kg/yr
                  </dd>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <dt className="text-gray-600">Per-tree O₂ supply</dt>
                  <dd className="font-mono font-semibold text-gray-900">
                    {Math.round(calc.formula_breakdown.soil_adjusted_tree_supply_kg)} kg/yr
                  </dd>
                </div>
                <div className="flex justify-between py-4 bg-green-50 -mx-6 px-6 rounded-xl mt-2">
                  <dt className="font-bold text-gray-900 text-base">Trees Required</dt>
                  <dd className="font-mono text-2xl font-bold text-green-700">
                    {formatNumber(Math.round(calc.trees_required))}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Methodology & Sources */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Methodology & Sources</h3>
              <div className="space-y-6 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-3">Key Assumptions:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {calc.assumptions.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="text-xs leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-3">Data Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {calc.data_sources.map((source, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 border border-gray-200"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <strong className="text-gray-700">Confidence Level:</strong>{' '}
                    <span className="capitalize font-semibold text-gray-900">
                      {calc.confidence_level}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tree Recommendations */}
          {districtData.treeRecommendations && districtData.treeRecommendations.length > 0 && (
            <PlantationRecommendations recommendations={districtData.treeRecommendations} />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
