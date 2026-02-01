import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { ShareButtons } from "@/components/ui/share-buttons";
import { DistrictDetail } from "@/lib/types";
import {
  formatCompactNumber,
  formatNumber,
  getAQICategory,
} from "@/lib/utils/helpers";
import EmptyState from "@/components/ui/EmptyState";
import { ExportButtons } from "@/components/district/ExportButtons";
import { PlantationRecommendations } from "@/components/district/PlantationRecommendations";

async function getDistrictDetail(slug: string): Promise<DistrictDetail | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/districts/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching district detail:", error);
    return null;
  }
}

interface DistrictPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DistrictPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDistrictDetail(slug);

  if (!data) {
    return {
      title: "District Not Found | Vayura",
    };
  }

  const treesNeeded = formatCompactNumber(
    Math.round(data.oxygenCalculation.trees_required),
  );
  const title = `${data.name} Oxygen Report | Vayura`;
  const description = `${data.name} needs ${treesNeeded} trees to meet its oxygen demand. View detailed environmental health statistics for ${data.name}, ${data.state}.`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://vayura.com";
  const url = `${baseUrl}/district/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Vayura",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: `${baseUrl}/logo.png`,
          width: 800,
          height: 600,
          alt: "Vayura Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/logo.png`],
    },
  };
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const data = await getDistrictDetail(slug);

  if (!data) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nature-50 via-white to-sky-50 px-6">
          <EmptyState
            title="District data not available yet"
            subtitle="Try searching for another district or adjusting your filters"
          />
        </main>
        <Footer />
      </>
    );
  }

  const aqiInfo = getAQICategory(data.environmentalData.aqi);
  const calc = data.oxygenCalculation;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-nature-50 via-white to-sky-50 pb-20">
        <section className="max-w-6xl mx-auto px-6 pt-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                District Environmental Health Card
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {data.name}, <span className="text-gray-600">{data.state}</span>
              </h1>
              <p className="mt-2 text-gray-600">
                Estimated population {formatNumber(data.population)}. Data
                refreshed in the last 24 hours.
              </p>
            </div>
            <div className="flex gap-3">
              <ExportButtons data={data} slug={slug} />
              <Link
                href="/plant"
                className="px-5 py-3 rounded-full bg-nature-600 text-white font-semibold hover:bg-nature-700 transition"
              >
                I planted a tree
              </Link>
              <Link
                href={`https://tree-nation.com/?utm_source=vayura&district=${encodeURIComponent(
                  data.name,
                )}`}
                target="_blank"
                className="px-5 py-3 rounded-full bg-white text-nature-700 font-semibold border border-nature-500 hover:bg-nature-50 transition"
              >
                Donate trees
              </Link>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                Population
              </h2>
              <p className="text-2xl font-bold text-gray-900">
                {formatCompactNumber(data.population)}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">AQI</h2>
              <p
                className="text-2xl font-bold"
                style={{ color: aqiInfo.color }}
              >
                {Math.round(data.environmentalData.aqi)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{aqiInfo.label}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                Soil quality
              </h2>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(data.environmentalData.soilQuality)} / 100
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                Disaster frequency
              </h2>
              <p className="text-2xl font-bold text-gray-900">
                {data.environmentalData.disasterFrequency.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Oxygen model explanation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Oxygen demand vs tree supply
              </h2>
              <dl className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <dt>Base human O₂ demand</dt>
                  <dd className="font-mono">
                    {formatNumber(
                      Math.round(calc.formula_breakdown.human_o2_demand_kg),
                    )}{" "}
                    kg/year
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Penalty multipliers (AQI × soil × disasters)</dt>
                  <dd className="font-mono">
                    {calc.formula_breakdown.aqi_penalty_factor.toFixed(2)} ×{" "}
                    {calc.formula_breakdown.soil_degradation_factor.toFixed(2)}{" "}
                    × {calc.formula_breakdown.disaster_loss_factor.toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Adjusted O₂ demand</dt>
                  <dd className="font-mono">
                    {formatNumber(
                      Math.round(calc.formula_breakdown.adjusted_o2_demand_kg),
                    )}{" "}
                    kg/year
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Per-tree O₂ supply (soil adjusted)</dt>
                  <dd className="font-mono">
                    {Math.round(
                      calc.formula_breakdown.soil_adjusted_tree_supply_kg,
                    )}{" "}
                    kg/year
                  </dd>
                </div>
                <div className="flex justify-between border-t border-dashed pt-3 mt-3">
                  <dt className="font-semibold">Trees required</dt>
                  <dd className="font-mono text-lg font-semibold text-nature-700">
                    {formatNumber(Math.round(calc.trees_required))} trees
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Transparent model and assumptions
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-semibold mb-1">Formulas</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Human O₂ demand = population × 550 L/day × 365, converted
                      to kg/year
                    </li>
                    <li>
                      Adjusted demand = base demand × AQI factor × soil factor ×
                      disaster factor
                    </li>
                    <li>
                      Tree O₂ supply = 110 kg O₂/year per mature tree, adjusted
                      by soil quality
                    </li>
                    <li>
                      Trees required = oxygen deficit ÷ per-tree O₂ supply
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">Assumptions</p>
                  <ul className="list-disc list-inside space-y-1">
                    {calc.assumptions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Confidence level:{" "}
                  <span className="font-semibold capitalize">
                    {calc.confidence_level}
                  </span>
                  . Estimates only, not medical or policy guidance.
                </p>
              </div>
            </div>
          </div>

          {data.recommendations && data.recommendations.length > 0 && (
            <PlantationRecommendations recommendations={data.recommendations} />
          )}

          <ShareButtons
            districtName={data.name}
            treesNeeded={formatCompactNumber(Math.round(calc.trees_required))}
            url={`${process.env.NEXT_PUBLIC_BASE_URL || "https://vayura.com"}/district/${slug}`}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
