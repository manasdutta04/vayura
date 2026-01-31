'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Map, Info, MousePointer2, Layers } from 'lucide-react';

// Import map component dynamically to avoid SSR issues with Leaflet
const IndiaMap = dynamic(() => import('@/components/ui/india-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Initializing Map Engine...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold tracking-wide uppercase text-sm">
              <Map size={16} />
              Geographic Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              India <span className="text-emerald-600">District Map</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Visualize oxygen self-sufficiency and environmental health across 200+ major districts. 
              Click on any district to dive deeper into its environmental statistics.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm text-slate-600">
              <MousePointer2 size={14} className="text-emerald-500" />
              <span>Click to explore</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm text-slate-600">
              <Layers size={14} className="text-emerald-500" />
              <span>Interactive Layers</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <IndiaMap />
          </div>
          
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
              <h3 className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
                <Info size={18} />
                Map Guide
              </h3>
              <ul className="space-y-4 text-sm text-emerald-900/80">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Hover over any district to see its name and current oxygen supply/demand ratio.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Color coding represents self-sufficiency status, from green (surplus) to red (critical).</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Click on a district to view detailed environmental analytics, AQI data, and tree plantation history.</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-slate-900 font-bold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Districts</div>
                  <div className="text-2xl font-black text-slate-900">200+</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Real-time Data</div>
                  <div className="text-2xl font-black text-slate-900">Enabled</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
