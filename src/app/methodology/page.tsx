'use client';

import { BookOpen, Calculator, Database, AlertTriangle, GitBranch, Calendar } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { ENVIRONMENTAL_CONSTANTS } from '@/lib/constants/environmental';

export default function MethodologyPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50">
                {/* Content */}
                <div className="max-w-4xl mx-auto px-6 py-12">
                    {/* Page Title */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Methodology</h1>
                        <p className="text-lg text-gray-600">
                            Transparent oxygen calculation methodology for expert review and community trust
                        </p>
                    </div>
                    {/* Model Version Badge */}
                    <div className="flex items-center gap-6 mb-12 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <GitBranch className="w-5 h-5 text-green-700" />
                            <div>
                                <div className="text-sm font-medium text-gray-600">Calculation Model Version</div>
                                <div className="text-2xl font-bold text-green-700">v1.0</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 border-l border-gray-300 pl-6">
                            <Calendar className="w-5 h-5 text-green-700" />
                            <div>
                                <div className="text-sm font-medium text-gray-600">Last Updated</div>
                                <div className="text-lg font-semibold text-green-700">January 2026</div>
                            </div>
                        </div>
                    </div>

                    {/* Overview */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="w-6 h-6 text-gray-700" />
                            <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Vayura uses a science-based methodology to calculate oxygen demand and supply at the state and district level.
                                Our approach combines population data, environmental factors, and tree oxygen production to provide actionable insights.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                This page documents our calculation methodology to enable expert review, ensure transparency, and build trust
                                in our open-source platform.
                            </p>
                        </div>
                    </section>

                    {/* Oxygen Demand Calculation */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Calculator className="w-6 h-6 text-gray-700" />
                            <h2 className="text-2xl font-bold text-gray-900">Oxygen Demand Calculation</h2>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Base Formula</h3>
                            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-6 overflow-x-auto">
                                <div className="mb-2">O₂ Demand = Population × Daily O₂ × 365 × Conversion × Penalty</div>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-3">Constants</h3>
                            <ul className="space-y-2 mb-6">
                                <li className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-700">Human O₂ consumption</span>
                                    <span className="font-mono font-semibold text-gray-900">{ENVIRONMENTAL_CONSTANTS.OXYGEN.HUMAN_CONSUMPTION_LITERS_DAY} L/day/person</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-700">Liters to kg conversion</span>
                                    <span className="font-mono font-semibold text-gray-900">{(ENVIRONMENTAL_CONSTANTS.OXYGEN.LITERS_TO_KG_CONVERSION * 1000).toFixed(3)} kg / 1000 L</span>
                                </li>
                                <li className="flex justify-between items-center py-2">
                                    <span className="text-gray-700">Days per year</span>
                                    <span className="font-mono font-semibold text-gray-900">{ENVIRONMENTAL_CONSTANTS.OXYGEN.DAYS_PER_YEAR}</span>
                                </li>
                            </ul>

                            <h3 className="font-semibold text-gray-900 mb-3">Environmental Penalty Factors</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                These multipliers account for increased oxygen needs due to pollution, soil degradation, and natural disasters.
                            </p>

                            <div className="space-y-4">
                                {/* AQI Factor */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">AQI Penalty Factor</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">AQI 0-50 (Good)</span>
                                            <span className="font-mono font-semibold text-blue-900">1.0×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">AQI 51-100 (Moderate)</span>
                                            <span className="font-mono font-semibold text-blue-900">1.05×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">AQI 101-150 (Unhealthy for Sensitive)</span>
                                            <span className="font-mono font-semibold text-blue-900">1.15×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">AQI 151-200 (Unhealthy)</span>
                                            <span className="font-mono font-semibold text-blue-900">1.30×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">AQI 201-300 (Very Unhealthy)</span>
                                            <span className="font-mono font-semibold text-blue-900">1.50×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">AQI 300+ (Hazardous)</span>
                                            <span className="font-mono font-semibold text-blue-900">1.75×</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Soil Factor */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-amber-900 mb-2">Soil Degradation Factor</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">Soil Quality ≥ 80%</span>
                                            <span className="font-mono font-semibold text-amber-900">1.0×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">Soil Quality 60-79%</span>
                                            <span className="font-mono font-semibold text-amber-900">1.1×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">Soil Quality 40-59%</span>
                                            <span className="font-mono font-semibold text-amber-900">1.3×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">Soil Quality &lt; 40%</span>
                                            <span className="font-mono font-semibold text-amber-900">1.6×</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Disaster Factor */}
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-red-900 mb-2">Disaster Loss Factor</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-red-700">0 disasters/year</span>
                                            <span className="font-mono font-semibold text-red-900">1.0×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-red-700">1-2 disasters/year</span>
                                            <span className="font-mono font-semibold text-red-900">1.05×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-red-700">3-5 disasters/year</span>
                                            <span className="font-mono font-semibold text-red-900">1.15×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-red-700">6-10 disasters/year</span>
                                            <span className="font-mono font-semibold text-red-900">1.30×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-red-700">10+ disasters/year</span>
                                            <span className="font-mono font-semibold text-red-900">1.50×</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Total Penalty Multiplier:</strong> AQI Factor × Soil Factor × Disaster Factor
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Oxygen Supply Calculation */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Calculator className="w-6 h-6 text-gray-700" />
                            <h2 className="text-2xl font-bold text-gray-900">Oxygen Supply Calculation</h2>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Base Formula</h3>
                            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-6 overflow-x-auto">
                                <div className="mb-2">O₂ Supply = Total Trees × Base Production × Soil Adjustment</div>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-3">Constants & Assumptions</h3>
                            <ul className="space-y-2 mb-6">
                                <li className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-700">Base tree O₂ production</span>
                                    <span className="font-mono font-semibold text-gray-900">{ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR} kg/year</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-700">Average tree lifespan (estimated)</span>
                                    <span className="font-mono font-semibold text-gray-900">{ENVIRONMENTAL_CONSTANTS.TREES.DEFAULT_LIFESPAN_YEARS} years</span>
                                </li>
                                <li className="flex justify-between items-center py-2">
                                    <span className="text-gray-700">Soil quality adjustment range</span>
                                    <span className="font-mono font-semibold text-gray-900">70% - 100%</span>
                                </li>
                            </ul>

                            <h3 className="font-semibold text-gray-900 mb-3">Soil Quality Adjustment</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Tree oxygen production is adjusted based on soil quality:
                            </p>
                            <div className="bg-green-50 p-4 rounded-lg mb-4">
                                <div className="font-mono text-sm text-green-900">
                                    Adjustment = max(0.7, Soil Quality / 100)
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                This ensures that even poor soil (below 70% quality) allows trees to produce at least 70% of their base oxygen output.
                            </p>
                        </div>
                    </section>

                    {/* Data Sources */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-gray-700" />
                            <h2 className="text-2xl font-bold text-gray-900">Data Sources</h2>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <div className="space-y-4">
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-1">Population Data</h4>
                                    <p className="text-sm text-gray-600">Census of India (latest available district-level data)</p>
                                </div>
                                <div className="border-l-4 border-green-500 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-1">Forest Cover Data</h4>
                                    <p className="text-sm text-gray-600">Forest Survey of India (FSI) - State of Forest Report</p>
                                </div>
                                <div className="border-l-4 border-amber-500 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-1">Air Quality Index (AQI)</h4>
                                    <p className="text-sm text-gray-600">Default assumption: 100 (Moderate) - Real-time integration pending</p>
                                </div>
                                <div className="border-l-4 border-purple-500 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-1">Tree Species Identification</h4>
                                    <p className="text-sm text-gray-600">AI-powered image analysis using Google Gemini Vision</p>
                                </div>
                                <div className="border-l-4 border-red-500 pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-1">Soil Quality & Disaster Data</h4>
                                    <p className="text-sm text-gray-600">Default regional estimates - Pending integration with government databases</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Known Limitations */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-gray-700" />
                            <h2 className="text-2xl font-bold text-gray-900">Known Limitations</h2>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 shadow-sm">
                            <p className="text-sm text-amber-900 mb-4 font-medium">
                                We acknowledge the following limitations in our current methodology:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <span className="text-amber-600 mt-1">•</span>
                                    <div>
                                        <strong className="text-amber-900">Simplified Environmental Factors:</strong>
                                        <span className="text-amber-800"> Current penalty factors are broad estimates and don't capture hyperlocal variations.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-amber-600 mt-1">•</span>
                                    <div>
                                        <strong className="text-amber-900">Default AQI Values:</strong>
                                        <span className="text-amber-800"> We currently use a default AQI of 100 (Moderate). Real-time AQI integration is planned.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-amber-600 mt-1">•</span>
                                    <div>
                                        <strong className="text-amber-900">AI-Based Tree Age Estimation:</strong>
                                        <span className="text-amber-800"> Tree age and health assessments use AI inference, which may have accuracy limitations.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-amber-600 mt-1">•</span>
                                    <div>
                                        <strong className="text-amber-900">Species-Specific Variations:</strong>
                                        <span className="text-amber-800"> The base 110 kg/year is an average. Actual O₂ production varies by species, age, and health.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-amber-600 mt-1">•</span>
                                    <div>
                                        <strong className="text-amber-900">Seasonal Variations:</strong>
                                        <span className="text-amber-800"> Our annual calculations don't account for seasonal changes in photosynthesis rates.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* References */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Scientific References</h2>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-2">
                                    <span className="text-gray-400">1.</span>
                                    <div>
                                        <span className="text-gray-700">Nowak, D. J., et al. (2007). "Oxygen production by urban trees in the United States." Arboriculture & Urban Forestry.</span>
                                    </div>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-gray-400">2.</span>
                                    <div>
                                        <span className="text-gray-700">Forest Survey of India. (Latest). "State of Forest Report." Ministry of Environment & Forests, Government of India.</span>
                                    </div>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-gray-400">3.</span>
                                    <div>
                                        <span className="text-gray-700">Census of India. District-level population statistics. Office of the Registrar General & Census Commissioner, India.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Footer Note */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">
                            This methodology is open for community review and improvement.
                        </p>
                        <a
                            href="https://github.com/manasdutta04/vayura"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                        >
                            Contribute on GitHub →
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
