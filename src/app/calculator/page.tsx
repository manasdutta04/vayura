'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/ui/header';

export default function CalculatorPage() {
    const [trees, setTrees] = useState(100);
    const [animatedCO2, setAnimatedCO2] = useState(0);
    const [animatedCars, setAnimatedCars] = useState(0);
    const [animatedFlights, setAnimatedFlights] = useState(0);

    // Scientific constants
    const CO2_PER_TREE_KG_YEAR = 21; // Average CO2 absorbed per tree per year (kg)
    const CO2_PER_CAR_KG_YEAR = 4600; // Average car emissions per year (kg)
    const CO2_PER_FLIGHT_KG = 90; // Short-haul flight per person (kg)

    // Calculate values
    const totalCO2 = trees * CO2_PER_TREE_KG_YEAR;
    const carsOffset = totalCO2 / CO2_PER_CAR_KG_YEAR;
    const flightsOffset = totalCO2 / CO2_PER_FLIGHT_KG;

    // Animate numbers
    useEffect(() => {
        const duration = 1000; // 1 second
        const steps = 60;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setAnimatedCO2(Math.floor(totalCO2 * progress));
            setAnimatedCars(carsOffset * progress);
            setAnimatedFlights(flightsOffset * progress);

            if (currentStep >= steps) {
                clearInterval(interval);
                setAnimatedCO2(totalCO2);
                setAnimatedCars(carsOffset);
                setAnimatedFlights(flightsOffset);
            }
        }, stepDuration);

        return () => clearInterval(interval);
    }, [trees, totalCO2, carsOffset, flightsOffset]);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-white pb-20">
                <section className="max-w-6xl mx-auto px-6 pt-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
                            CO₂ Impact Calculator
                        </h1>
                        <p className="text-sm text-gray-500">
                            Discover the environmental impact of tree planting and calculate your carbon offset
                        </p>
                    </div>

                    {/* Calculator Card */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Input Section */}
                        <div className="p-8 bg-gray-50/30 border-b border-gray-100">
                            {/* Value Display */}
                            <div className="flex flex-col items-center mb-8">
                                <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                                    Trees Planted
                                </label>
                                <div className="flex items-baseline gap-2 justify-center">
                                    <input
                                        type="number"
                                        min="1"
                                        max="10000"
                                        value={trees}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // Allow empty string purely for typing experience, but otherwise parse
                                            if (val === '') {
                                                setTrees(0); // Temporary state for empty input
                                                return;
                                            }
                                            const num = parseInt(val);
                                            if (!isNaN(num)) {
                                                setTrees(num);
                                            }
                                        }}
                                        onBlur={() => {
                                            // Clamp on blur
                                            let final = Math.max(1, Math.min(10000, trees));
                                            if (trees === 0) final = 1; // Handle empty/zero case
                                            setTrees(final);
                                        }}
                                        className="text-6xl font-bold text-gray-900 tracking-tight bg-transparent text-center w-48 sm:w-64 border-b-2 border-transparent hover:border-gray-200 focus:border-green-500 focus:outline-none transition-all placeholder-gray-200 appearance-none m-0 p-0 leading-none"
                                        style={{ MozAppearance: 'textfield' }} // Remove spin buttons Firefox
                                    />
                                    <span className="text-xl text-gray-500 font-medium">trees</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="max-w-md mx-auto">
                                <div className="flex items-center gap-6 mb-8">
                                    <button
                                        onClick={() => setTrees(Math.max(1, trees - 10))}
                                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all active:scale-95"
                                        aria-label="Decrease"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                        </svg>
                                    </button>

                                    <div className="flex-1">
                                        <input
                                            type="range"
                                            min="1"
                                            max="10000"
                                            value={trees}
                                            onChange={(e) => setTrees(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                        />
                                    </div>

                                    <button
                                        onClick={() => setTrees(Math.min(10000, trees + 10))}
                                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all active:scale-95"
                                        aria-label="Increase"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex justify-center gap-2 flex-wrap">
                                    {[10, 100, 500, 1000, 5000].map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => setTrees(preset)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${trees === preset
                                                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700'
                                                }`}
                                        >
                                            {preset.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="p-6">
                            {/* Main CO2 Display */}
                            <div className="text-center mb-6 p-6 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-sm font-semibold text-green-700 mb-2 uppercase tracking-wide">
                                    Annual CO₂ Offset
                                </div>
                                <div className="text-6xl font-bold text-green-600 mb-2">
                                    {animatedCO2.toLocaleString()}
                                </div>
                                <div className="text-xl text-green-700 font-medium">
                                    kg CO₂ per year
                                </div>
                                <div className="text-sm text-green-600 mt-2">
                                    That's {(animatedCO2 / 1000).toFixed(2)} tonnes of carbon dioxide!
                                </div>
                            </div>

                            {/* Comparison Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {/* Cars Equivalent */}
                                <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                        <h3 className="text-base font-semibold text-blue-900">Cars Off Road</h3>
                                    </div>
                                    <div className="text-4xl font-bold text-blue-600 mb-1">
                                        {animatedCars.toFixed(2)}
                                    </div>
                                    <p className="text-sm text-blue-700">
                                        cars removed for 1 year
                                    </p>
                                </div>

                                {/* Flights Equivalent */}
                                <div className="p-5 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </div>
                                        <h3 className="text-base font-semibold text-purple-900">Flight Offset</h3>
                                    </div>
                                    <div className="text-4xl font-bold text-purple-600 mb-1">
                                        {Math.floor(animatedFlights)}
                                    </div>
                                    <p className="text-sm text-purple-700">
                                        short-haul flights offset
                                    </p>
                                </div>
                            </div>

                            {/* Additional Metrics */}
                            <div className="p-5 bg-amber-50 rounded-lg border border-amber-200">
                                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2 text-sm">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                    </svg>
                                    More Interesting Facts
                                </h3>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="text-amber-600 font-bold mt-0.5">•</span>
                                        <span className="text-amber-900">
                                            Produces <strong>{(trees * 118).toLocaleString()} kg</strong> of oxygen annually
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-amber-600 font-bold mt-0.5">•</span>
                                        <span className="text-amber-900">
                                            Enough oxygen for <strong>{Math.floor(trees * 118 / 730)}</strong> people per year
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-amber-600 font-bold mt-0.5">•</span>
                                        <span className="text-amber-900">
                                            Equal to <strong>{(totalCO2 / 907).toFixed(1)}</strong> tonnes of waste recycled
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-200">
                            <div className="text-center">
                                <p className="text-gray-600 mb-4 text-sm">
                                    Ready to make an impact? Plant trees and offset your carbon footprint today!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <a
                                        href="/plant"
                                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm"
                                    >
                                        Plant Trees Now
                                    </a>
                                    <a
                                        href="/donate"
                                        className="px-6 py-3 bg-white text-green-600 font-semibold rounded-lg border border-green-600 hover:bg-green-50 transition-colors text-sm"
                                    >
                                        Donate Trees
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="mt-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3 text-base">How We Calculate</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>• Each mature tree absorbs approximately <strong>21 kg of CO₂</strong> per year</p>
                            <p>• Average car emits <strong>4,600 kg of CO₂</strong> annually</p>
                            <p>• Short-haul flight produces ~<strong>90 kg of CO₂</strong> per passenger</p>
                            <p>• Each tree produces ~<strong>118 kg of oxygen</strong> per year</p>
                            <p className="text-gray-500 italic pt-2">Source: USDA Forest Service, EPA, IPCC</p>
                        </div>
                    </div>
                </section>
            </main>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #16a34a;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }
                .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: #16a34a;
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                }
                /* Remove spinner buttons from number input */
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
            `}</style>
        </>
    );
}
