'use client';

import { useTranslations } from 'next-intl';
import { BookOpen, Calculator, Database, AlertTriangle, GitBranch, Calendar } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { ENVIRONMENTAL_CONSTANTS } from '@/lib/constants/environmental';

export default function MethodologyPage() {
    const t = useTranslations('methodology');

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50">
                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    {/* Page Title */}
                    <div className="mb-8 sm:mb-12">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">{t('title')}</h1>
                        <p className="text-sm sm:text-base md:text-lg text-gray-600">
                            {t('subtitle')}
                        </p>
                    </div>
                    {/* Model Version Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <GitBranch className="w-5 h-5 text-green-700 flex-shrink-0" />
                            <div>
                                <div className="text-xs sm:text-sm font-medium text-gray-600">{t('version')}</div>
                                <div className="text-xl sm:text-2xl font-bold text-green-700">v1.0</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:border-l sm:border-gray-300 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                            <Calendar className="w-5 h-5 text-green-700 flex-shrink-0" />
                            <div>
                                <div className="text-xs sm:text-sm font-medium text-gray-600">{t('lastUpdated')}</div>
                                <div className="text-base sm:text-lg font-semibold text-green-700">{t('jan2026')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Overview */}
                    <section className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('overview.title')}</h2>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4">
                                {t('overview.p1')}
                            </p>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                {t('overview.p2')}
                            </p>
                        </div>
                    </section>

                    {/* Oxygen Demand Calculation */}
                    <section className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('demand.title')}</h2>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">{t('demand.baseFormula')}</h3>
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto">
                                <div className="mb-2 whitespace-nowrap">{t('demand.formula')}</div>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">{t('demand.constants')}</h3>
                            <ul className="space-y-2 mb-4 sm:mb-6">
                                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-0.5 sm:gap-2">
                                    <span className="text-sm text-gray-700">{t('demand.humanConsumption')}</span>
                                    <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm">{ENVIRONMENTAL_CONSTANTS.OXYGEN.HUMAN_CONSUMPTION_LITERS_DAY} L/day/person</span>
                                </li>
                                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-0.5 sm:gap-2">
                                    <span className="text-sm text-gray-700">{t('demand.litersToKg')}</span>
                                    <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm">{(ENVIRONMENTAL_CONSTANTS.OXYGEN.LITERS_TO_KG_CONVERSION * 1000).toFixed(3)} kg / 1000 L</span>
                                </li>
                                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-0.5 sm:gap-2">
                                    <span className="text-sm text-gray-700">{t('demand.daysPerYear')}</span>
                                    <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm">{ENVIRONMENTAL_CONSTANTS.OXYGEN.DAYS_PER_YEAR}</span>
                                </li>
                            </ul>

                            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">{t('demand.environmentalPenalty')}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                {t('demand.penaltyDesc')}
                            </p>

                            <div className="space-y-3 sm:space-y-4">
                                {/* AQI Factor */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">{t('demand.aqiPenalty')}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">{t('demand.aqiGood')}</span>
                                            <span className="font-mono font-semibold text-blue-900">1.0×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">{t('demand.aqiModerate')}</span>
                                            <span className="font-mono font-semibold text-blue-900">1.05×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">{t('demand.aqiSensitive')}</span>
                                            <span className="font-mono font-semibold text-blue-900">1.15×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">{t('demand.aqiUnhealthy')}</span>
                                            <span className="font-mono font-semibold text-blue-900">1.30×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">{t('demand.aqiVeryUnhealthy')}</span>
                                            <span className="font-mono font-semibold text-blue-900">1.50×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">{t('demand.aqiHazardous')}</span>
                                            <span className="font-mono font-semibold text-blue-900">1.75×</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Soil Factor */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                                    <h4 className="font-semibold text-amber-900 mb-2 text-sm sm:text-base">{t('demand.soilPenalty')}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">{t('demand.soilGood')}</span>
                                            <span className="font-mono font-semibold text-amber-900">1.0×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">{t('demand.soilModerate')}</span>
                                            <span className="font-mono font-semibold text-amber-900">1.1×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">{t('demand.soilPoor')}</span>
                                            <span className="font-mono font-semibold text-amber-900">1.3×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">{t('demand.soilCritical')}</span>
                                            <span className="font-mono font-semibold text-amber-900">1.6×</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Disaster Factor */}
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                                    <h4 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">{t('demand.disasterPenalty')}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-red-700">{t('demand.disasterNone')}</span>
                                            <span className="font-mono font-semibold text-red-900">1.0×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-red-700">{t('demand.disasterLow')}</span>
                                            <span className="font-mono font-semibold text-red-900">1.05×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-red-700">{t('demand.disasterMid')}</span>
                                            <span className="font-mono font-semibold text-red-900">1.15×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-red-700">{t('demand.disasterHigh')}</span>
                                            <span className="font-mono font-semibold text-red-900">1.30×</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-red-700">{t('demand.disasterExtreme')}</span>
                                            <span className="font-mono font-semibold text-red-900">1.50×</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs sm:text-sm text-gray-700">
                                    <strong>{t('demand.totalPenalty')}</strong> {t('demand.penaltyCalc')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Oxygen Supply Calculation */}
                    <section className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('supply.title')}</h2>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">{t('supply.baseFormula')}</h3>
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg font-mono text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto">
                                <div className="mb-2 whitespace-nowrap">{t('supply.formula')}</div>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">{t('supply.constants')}</h3>
                            <ul className="space-y-2 mb-4 sm:mb-6">
                                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-0.5 sm:gap-2">
                                    <span className="text-sm text-gray-700">{t('supply.baseProduction')}</span>
                                    <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm">{ENVIRONMENTAL_CONSTANTS.OXYGEN.PRODUCTION_PER_TREE_KG_YEAR} kg/year</span>
                                </li>
                                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-0.5 sm:gap-2">
                                    <span className="text-sm text-gray-700">{t('supply.lifespan')}</span>
                                    <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm">{ENVIRONMENTAL_CONSTANTS.TREES.DEFAULT_LIFESPAN_YEARS} years</span>
                                </li>
                                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-0.5 sm:gap-2">
                                    <span className="text-sm text-gray-700">{t('supply.soilRange')}</span>
                                    <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm">70% - 100%</span>
                                </li>
                            </ul>

                            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">{t('supply.soilAdjustment')}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                                {t('supply.soilAdjDesc')}
                            </p>
                            <div className="bg-green-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                                <div className="font-mono text-xs sm:text-sm text-green-900">
                                    {t('supply.soilAdjFormula')}
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600">
                                {t('supply.soilAdjNote')}
                            </p>
                        </div>
                    </section>

                    {/* Data Sources */}
                    <section className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dataSources.title')}</h2>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{t('dataSources.population')}</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">{t('dataSources.populationDesc')}</p>
                                </div>
                                <div className="border-l-4 border-green-500 pl-3 sm:pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{t('dataSources.forest')}</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">{t('dataSources.forestDesc')}</p>
                                </div>
                                <div className="border-l-4 border-amber-500 pl-3 sm:pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{t('dataSources.aqi')}</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">{t('dataSources.aqiDesc')}</p>
                                </div>
                                <div className="border-l-4 border-purple-500 pl-3 sm:pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{t('dataSources.treeIdentification')}</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">{t('dataSources.treeIdentificationDesc')}</p>
                                </div>
                                <div className="border-l-4 border-red-500 pl-3 sm:pl-4">
                                    <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{t('dataSources.soilDisaster')}</h4>
                                    <p className="text-xs sm:text-sm text-gray-600">{t('dataSources.soilDisasterDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Known Limitations */}
                    <section className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('limitations.title')}</h2>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6 shadow-sm">
                            <p className="text-xs sm:text-sm text-amber-900 mb-3 sm:mb-4 font-medium">
                                {t('limitations.acknowledge')}
                            </p>
                            <ul className="space-y-2 sm:space-y-3">
                                <li className="flex gap-2 sm:gap-3">
                                    <span className="text-amber-600 mt-0.5 sm:mt-1">•</span>
                                    <div className="text-xs sm:text-sm">
                                        <strong className="text-amber-900">{t('limitations.simplified')}</strong>
                                        <span className="text-amber-800"> {t('limitations.simplifiedDesc')}</span>
                                    </div>
                                </li>
                                <li className="flex gap-2 sm:gap-3">
                                    <span className="text-amber-600 mt-0.5 sm:mt-1">•</span>
                                    <div className="text-xs sm:text-sm">
                                        <strong className="text-amber-900">{t('limitations.defaultAqi')}</strong>
                                        <span className="text-amber-800"> {t('limitations.defaultAqiDesc')}</span>
                                    </div>
                                </li>
                                <li className="flex gap-2 sm:gap-3">
                                    <span className="text-amber-600 mt-0.5 sm:mt-1">•</span>
                                    <div className="text-xs sm:text-sm">
                                        <strong className="text-amber-900">{t('limitations.aiEstimation')}</strong>
                                        <span className="text-amber-800"> {t('limitations.aiEstimationDesc')}</span>
                                    </div>
                                </li>
                                <li className="flex gap-2 sm:gap-3">
                                    <span className="text-amber-600 mt-0.5 sm:mt-1">•</span>
                                    <div className="text-xs sm:text-sm">
                                        <strong className="text-amber-900">{t('limitations.speciesVariance')}</strong>
                                        <span className="text-amber-800"> {t('limitations.speciesVarianceDesc')}</span>
                                    </div>
                                </li>
                                <li className="flex gap-2 sm:gap-3">
                                    <span className="text-amber-600 mt-0.5 sm:mt-1">•</span>
                                    <div className="text-xs sm:text-sm">
                                        <strong className="text-amber-900">{t('limitations.seasonal')}</strong>
                                        <span className="text-amber-800"> {t('limitations.seasonalDesc')}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* References */}
                    <section className="mb-8 sm:mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{t('references.title')}</h2>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                <li className="flex gap-2">
                                    <span className="text-gray-400">1.</span>
                                    <div>
                                        <span className="text-gray-700">Nowak, D. J., et al. (2007). &quot;Oxygen production by urban trees in the United States.&quot; Arboriculture &amp; Urban Forestry.</span>
                                    </div>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-gray-400">2.</span>
                                    <div>
                                        <span className="text-gray-700">Forest Survey of India. (Latest). &quot;State of Forest Report.&quot; Ministry of Environment &amp; Forests, Government of India.</span>
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
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 text-center">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                            {t('footer.review')}
                        </p>
                        <a
                            href="https://github.com/manasdutta04/vayura"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                        >
                            {t('footer.contribute')}
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
