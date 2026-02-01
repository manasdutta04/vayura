/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';
import MapLegend from './map-legend';
import { renderToStaticMarkup } from 'react-dom/server';
import DistrictTooltip from './district-tooltip';

interface MapData {
  id: string;
  name: string;
  state: string;
  slug: string;
  oxygenSupply: number;
  oxygenDemand: number;
}

const IndiaMap = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [stateData, setStateData] = useState<any>(null);
  const [districtsData, setDistrictsData] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [geoRes, stateRes, dataRes] = await Promise.all([
          fetch('/geojson/india-districts.geojson'),
          fetch('/geojson/india-states.geojson'),
          fetch('/api/map-data')
        ]);
        
        if (!geoRes.ok || !stateRes.ok || !dataRes.ok) {
          console.error('Fetch error:', {
            districtsGeo: { ok: geoRes.ok, status: geoRes.status },
            statesGeo: { ok: stateRes.ok, status: stateRes.status },
            mapData: { ok: dataRes.ok, status: dataRes.status }
          });
          throw new Error('Failed to fetch map data');
        }
        
        const geoJson = await geoRes.json();
        const stateJson = await stateRes.json();
        const districts = await dataRes.json();
        
        setGeoData(geoJson);
        setStateData(stateJson);
        setDistrictsData(districts);
      } catch (error) {
        console.error('Error loading map data:', error);
        setError('Unable to load interactive map. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dataMap = useMemo(() => {
    const map = new Map<string, MapData>();
    districtsData.forEach(d => {
      // Create a key using both name and state to avoid collisions
      const key = `${d.name.toLowerCase()}-${d.state.toLowerCase()}`;
      map.set(key, d);
      // Also set by name only as fallback
      map.set(d.name.toLowerCase(), d);
    });
    return map;
  }, [districtsData]);

  const getColor = (supply: number, demand: number) => {
    if (demand === 0) return '#10b981'; // Default to green if no demand data
    const ratio = supply / demand;
    if (ratio >= 1.0) return '#10b981'; // Green - Surplus
    if (ratio >= 0.5) return '#fbbf24'; // Yellow - Moderate deficit
    if (ratio >= 0.25) return '#f97316'; // Orange - High deficit
    return '#ef4444'; // Red - Critical deficit
  };

  const style = (feature: any) => {
    const districtName = feature.properties.district || feature.properties.NAME_2;
    const stateName = feature.properties.st_nm || feature.properties.NAME_1;
    
    const key = `${districtName?.toLowerCase()}-${stateName?.toLowerCase()}`;
    const data = dataMap.get(key) || dataMap.get(districtName?.toLowerCase());
    
    return {
      fillColor: data ? getColor(data.oxygenSupply, data.oxygenDemand) : '#e2e8f0',
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const districtName = feature.properties.district || feature.properties.NAME_2;
    const stateName = feature.properties.st_nm || feature.properties.NAME_1;
    
    const key = `${districtName?.toLowerCase()}-${stateName?.toLowerCase()}`;
    const data = dataMap.get(key) || dataMap.get(districtName?.toLowerCase());

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.9,
          weight: 2,
          color: '#64748b'
        });
        l.bringToFront();
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.7,
          weight: 1,
          color: 'white'
        });
      },
      click: () => {
        if (data) {
          router.push(`/district/${data.slug}`);
        }
      }
    });

    if (districtName) {
      const tooltipContent = renderToStaticMarkup(
        <DistrictTooltip 
          name={districtName}
          state={stateName || 'Unknown State'}
          oxygenSupply={data?.oxygenSupply || 0}
          oxygenDemand={data?.oxygenDemand || 0}
        />
      );
      layer.bindTooltip(tooltipContent, {
        sticky: true,
        className: 'custom-tooltip',
        direction: 'top'
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading Interactive Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3 className="text-slate-900 font-bold">Map Loading Failed</h3>
          <p className="text-slate-500 text-sm max-w-xs">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[700px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
      <MapContainer 
        center={[22.5937, 78.9629]} 
        zoom={5} 
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ background: '#f8fafc' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {geoData && (
          <GeoJSON 
            data={geoData} 
            style={style} 
            onEachFeature={onEachFeature}
          />
        )}
        {stateData && (
          <GeoJSON 
            data={stateData} 
            style={{
              fillColor: 'transparent',
              weight: 2,
              opacity: 1,
              color: '#000000', // Black for state boundaries
              fillOpacity: 0,
              interactive: false // Don't block clicks to districts
            }}
          />
        )}
        <MapLegend />
      </MapContainer>
      
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-slate-200 pointer-events-none">
        <h3 className="text-sm font-bold text-slate-800">Environmental Intelligence Map</h3>
        <p className="text-[10px] text-slate-500">Explore district-level oxygen self-sufficiency across India</p>
      </div>
    </div>
  );
};

export default IndiaMap;
