import { DistrictDetail } from '@/lib/types';

/**
 * Generate timestamped filename for exports
 * Format: vayura_<slug>_YYYY-MM-DD.<extension>
 * Example: vayura_maharashtra_2026-01-22.csv
 */
function generateTimestampedFilename(slug: string, format: 'csv' | 'json'): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = `${year}-${month}-${day}`;
  
  return `vayura_${slug}_${timestamp}.${format}`;
}

/**
 * Format a value for CSV export
 * Handles null, undefined, arrays, dates, and numbers
 */
function formatValueForCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (Array.isArray(value)) {
    return value.join('; ');
  }
  
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  return String(value);
}

/**
 * Escape CSV field values according to RFC 4180
 * Quote field if it contains comma, newline, or quote
 * Double any quotes inside the field
 */
function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate CSV string from flattened district data
 * Single row with all metrics, headers followed by data
 * Handles missing oxygenCalculation data gracefully
 */
function generateDistrictCSV(data: DistrictDetail): string {
  const calc = data.oxygenCalculation;
  
  // Define headers and corresponding field names in a clear, logical order
  const headers = [
    // Location Information
    'District Name',
    'State',
    'Slug',
    'Population',
    'Latitude',
    'Longitude',
    
    // Environmental Metrics
    'Air Quality Index (AQI)',
    'PM2.5 (µg/m³)',
    'Soil Quality Score',
    'Disaster Frequency (events/year)',
    'Data Source',
    'Data Last Updated',
    
    // Oxygen Analysis - Main Metrics
    'Base O₂ Demand (kg/year)',
    'AQI Penalty Factor',
    'Soil Degradation Factor',
    'Disaster Loss Factor',
    'Total Penalty Multiplier',
    'Adjusted O₂ Demand (kg/year)',
    'Per-Tree O₂ Supply (kg/year, soil-adjusted)',
    'O₂ Deficit (kg/year)',
    'Trees Required',
    'Trees Required (hectares)',
    
    // Community Impact
    'Trees Planted (Local)',
    'Trees Donated (NGO)',
    'Total Trees Contributed',
    'Total O₂ Offset (kg/year)',
    
    // Calculation Metadata
    'Confidence Level',
    'Data Sources Used',
    'Key Assumptions',
    'Export Date',
  ];

  const values = [
    // Location Information
    formatValueForCSV(data.name),
    formatValueForCSV(data.state),
    formatValueForCSV(data.slug),
    formatValueForCSV(data.population),
    formatValueForCSV(data.latitude),
    formatValueForCSV(data.longitude),
    
    // Environmental Metrics
    formatValueForCSV(Math.round(data.environmentalData.aqi * 100) / 100),
    formatValueForCSV(data.environmentalData.pm25 ?? 'N/A'),
    formatValueForCSV(Math.round(data.environmentalData.soilQuality)),
    formatValueForCSV(data.environmentalData.disasterFrequency.toFixed(2)),
    formatValueForCSV(data.environmentalData.dataSource || 'N/A'),
    formatValueForCSV(new Date(data.environmentalData.timestamp).toISOString().split('T')[0]),
    
    // Oxygen Analysis - Main Metrics (with fallback if missing)
    calc ? formatValueForCSV(Math.round(calc.formula_breakdown.human_o2_demand_kg)) : 'N/A',
    calc ? formatValueForCSV(calc.formula_breakdown.aqi_penalty_factor.toFixed(3)) : 'N/A',
    calc ? formatValueForCSV(calc.formula_breakdown.soil_degradation_factor.toFixed(3)) : 'N/A',
    calc ? formatValueForCSV(calc.formula_breakdown.disaster_loss_factor.toFixed(3)) : 'N/A',
    calc ? formatValueForCSV(calc.formula_breakdown.total_penalty.toFixed(3)) : 'N/A',
    calc ? formatValueForCSV(Math.round(calc.formula_breakdown.adjusted_o2_demand_kg)) : 'N/A',
    calc ? formatValueForCSV(Math.round(calc.formula_breakdown.soil_adjusted_tree_supply_kg)) : 'N/A',
    calc ? formatValueForCSV(Math.round(calc.oxygen_deficit_kg_per_year)) : 'N/A',
    calc ? formatValueForCSV(Math.round(calc.trees_required)) : 'N/A',
    calc ? formatValueForCSV(calc.trees_required_hectares.toFixed(2)) : 'N/A',
    
    // Community Impact
    formatValueForCSV(data.stats?.totalTreesPlanted ?? 0),
    formatValueForCSV(data.stats?.totalTreesDonated ?? 0),
    formatValueForCSV(data.stats?.totalTrees ?? 0),
    formatValueForCSV(Math.round(data.stats?.oxygenOffset ?? 0)),
    
    // Calculation Metadata
    calc ? formatValueForCSV(calc.confidence_level) : 'N/A',
    calc ? formatValueForCSV(calc.data_sources.join('; ')) : 'N/A',
    calc ? formatValueForCSV(calc.assumptions.join('; ')) : 'N/A',
    formatValueForCSV(new Date().toISOString().split('T')[0]),
  ];

  // Escape each field and join with commas
  const escapedValues = values.map((value) => escapeCSVField(value));
  
  // Combine header row and data row
  const headerRow = headers.map((h) => escapeCSVField(h)).join(',');
  const dataRow = escapedValues.join(',');
  
  return `${headerRow}\n${dataRow}`;
}

/**
 * Create structured JSON export object
 * Preserves hierarchy while organizing data logically
 * Handles missing oxygenCalculation data gracefully
 */
function createDistrictJSONExport(data: DistrictDetail): Record<string, any> {
  const calc = data.oxygenCalculation;
  
  return {
    metadata: {
      export_timestamp: new Date().toISOString(),
      vayura_version: '1.0',
      data_type: 'district_environmental_health_card',
    },
    location: {
      district_name: data.name,
      state: data.state,
      slug: data.slug,
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      population: data.population,
    },
    environment: {
      air_quality: {
        aqi: Math.round(data.environmentalData.aqi * 100) / 100,
        data_source: data.environmentalData.dataSource || null,
      },
      pm25: data.environmentalData.pm25 || null,
      soil: {
        quality_score: Math.round(data.environmentalData.soilQuality),
        scale: '0-100',
      },
      disasters: {
        annual_frequency: data.environmentalData.disasterFrequency,
        unit: 'events/year',
      },
      data_last_updated: new Date(data.environmentalData.timestamp).toISOString().split('T')[0],
    },
    oxygen_analysis: calc ? {
      demand: {
        base_kg_per_year: Math.round(calc.formula_breakdown.human_o2_demand_kg),
        description: 'Base human O₂ consumption for district population',
      },
      adjustment_factors: {
        aqi_penalty: calc.formula_breakdown.aqi_penalty_factor.toFixed(3),
        soil_degradation: calc.formula_breakdown.soil_degradation_factor.toFixed(3),
        disaster_loss: calc.formula_breakdown.disaster_loss_factor.toFixed(3),
        combined_multiplier: calc.formula_breakdown.total_penalty.toFixed(3),
      },
      adjusted_demand: {
        kg_per_year: Math.round(calc.formula_breakdown.adjusted_o2_demand_kg),
        description: 'Base demand multiplied by all adjustment factors',
      },
      supply: {
        per_tree_kg_per_year: Math.round(calc.formula_breakdown.soil_adjusted_tree_supply_kg),
        description: 'O₂ production per mature tree per year, adjusted for soil quality',
      },
      deficit: {
        kg_per_year: Math.round(calc.oxygen_deficit_kg_per_year),
        trees_required: Math.round(calc.trees_required),
        hectares_required: calc.trees_required_hectares.toFixed(2),
        description: 'Gap between adjusted demand and current supply; trees needed to close gap',
      },
    } : {
      status: 'Calculation data not available',
      message: 'Environmental data is present but oxygen calculation is pending'
    },
    calculation_methodology: calc ? {
      confidence_level: calc.confidence_level,
      formula_components: {
        human_o2_consumption: '550 L/day per person',
        tree_o2_production: '110 kg/year per mature tree',
        penalty_factors: 'Applied based on air quality, soil health, disaster frequency',
      },
      key_assumptions: calc.assumptions,
      data_sources: calc.data_sources,
    } : {
      status: 'Pending',
      note: 'Methodology will be available once calculation is complete'
    },
    community_impact: {
      tree_contributions: {
        planted_locally: data.stats?.totalTreesPlanted ?? 0,
        donated_through_ngos: data.stats?.totalTreesDonated ?? 0,
        total_contributed: data.stats?.totalTrees ?? 0,
      },
      oxygen_offset: {
        kg_per_year: Math.round(data.stats?.oxygenOffset ?? 0),
        description: 'Total O₂ production from all contributed trees',
      },
    },
    notes: {
      disclaimer: 'This data is for informational purposes. Estimates are based on scientific models and publicly available data.',
      accuracy_note: calc ? `Confidence level: ${calc.confidence_level}` : 'Oxygen calculation pending',
    },
  };
}

/**
 * Trigger browser download of a file
 * Uses native Blob API and temporary anchor element
 * Automatically cleans up resources after download
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body (required for some browsers)
    document.body.appendChild(link);
    
    // Trigger click
    link.click();
  } finally {
    // Cleanup: revoke object URL to free memory
    URL.revokeObjectURL(url);
    
    // Remove temporary link (use timeout for browsers that need it)
    setTimeout(() => {
      const linkElement = document.querySelector(`a[href="${url}"]`);
      if (linkElement) {
        document.body.removeChild(linkElement);
      }
    }, 100);
  }
}

/**
 * Export district data as CSV file
 * Creates a single-row CSV with comprehensive district metrics
 * 
 * @param data - Complete DistrictDetail object
 * @param slug - URL-safe district slug for filename
 * @throws Will log error to console but not throw (download errors are user-recoverable)
 */
export function exportDistrictAsCSV(data: DistrictDetail, slug: string): void {
  try {
    const csv = generateDistrictCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = generateTimestampedFilename(slug, 'csv');
    
    triggerDownload(blob, filename);
  } catch (error) {
    console.error('Error exporting district as CSV:', error);
    // Don't throw - let UI handle the error state
  }
}

/**
 * Export district data as JSON file
 * Creates a hierarchically structured JSON with all district data
 * Pretty-formatted with 2-space indentation for readability
 * 
 * @param data - Complete DistrictDetail object
 * @param slug - URL-safe district slug for filename
 * @throws Will log error to console but not throw (download errors are user-recoverable)
 */
export function exportDistrictAsJSON(data: DistrictDetail, slug: string): void {
  try {
    const jsonData = createDistrictJSONExport(data);
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const filename = generateTimestampedFilename(slug, 'json');
    
    triggerDownload(blob, filename);
  } catch (error) {
    console.error('Error exporting district as JSON:', error);
    // Don't throw - let UI handle the error state
  }
}
