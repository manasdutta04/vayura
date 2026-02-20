"use client";

import { DistrictDetail } from "@/lib/types";

interface Props {
  district: DistrictDetail;
}

export default function DistrictReportCard({ district }: Props) {
  const aqi = district.environmentalData.aqi;
  const trees = Math.round(district.oxygenCalculation.trees_required);
  const oxygenDeficit = Math.round(
    district.oxygenCalculation.formula_breakdown.adjusted_o2_demand_kg
  );

  let status = "Healthy";
  let badgeColor = "bg-green-100 text-green-700";

  if (aqi > 150) {
    status = "Critical";
    badgeColor = "bg-red-100 text-red-700";
  } else if (aqi > 80) {
    status = "Moderate";
    badgeColor = "bg-yellow-100 text-yellow-700";
  }

  return (
    <div
      id="report-card"
      className="bg-white p-6 rounded-xl shadow-lg max-w-md"
    >
      <h2 className="text-xl font-bold mb-4">
        {district.name}, {district.state}
      </h2>

      <div className="mb-3">
        <span className={`px-3 py-1 text-sm font-semibold rounded ${badgeColor}`}>
          {status}
        </span>
      </div>

      <p className="mb-1">
        <strong>AQI:</strong> {Math.round(aqi)}
      </p>

      <p className="mb-1">
        <strong>Oxygen Deficit:</strong> {oxygenDeficit.toLocaleString()} kg/year
      </p>

      <p>
        <strong>Trees Required:</strong> {trees.toLocaleString()}
      </p>
    </div>
  );
}