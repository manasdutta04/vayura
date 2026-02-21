"use client";

import { toPng } from "html-to-image";
import { DistrictDetail } from "@/lib/types";
import { getAQICategory } from "@/lib/utils/helpers";

interface Props {
  district: DistrictDetail;
}

export default function DistrictReportCard({ district }: Props) {
  const handleDownload = async () => {
    const element = document.getElementById("report-card");
    if (!element) return;

    const dataUrl = await toPng(element);
    const link = document.createElement("a");
    link.download = `${district.name}-report.png`;
    link.href = dataUrl;
    link.click();
  };

  const aqiInfo = getAQICategory(district.environmentalData.aqi);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md">
      <div id="report-card">
        <h2 className="text-xl font-bold mb-4">
          {district.name}, {district.state}
        </h2>

        <div className="mb-3">
          <span
            className="px-3 py-1 text-sm font-semibold rounded"
            style={{ backgroundColor: `${aqiInfo.color}20`, color: aqiInfo.color }}
          >
            {aqiInfo.label}
          </span>
        </div>

        <p>
  <strong>AQI:</strong> {Math.round(district.environmentalData.aqi)}
</p>

<p>
  <strong>Oxygen Deficit:</strong>{" "}
  {Math.round(
    district.oxygenCalculation.formula_breakdown.adjusted_o2_demand_kg
  ).toLocaleString()} kg/year
</p>

<p>
  <strong>Trees Required:</strong>{" "}
  {Math.round(district.oxygenCalculation.trees_required).toLocaleString()}
</p>
      </div>

      <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 transition"
      >
        Download as PNG
      </button>
    </div>
  );
}