export function calculateHealthScore(
  aqi: number,
  disasterFrequency: number,
  soilQuality: number
): number {
  const aqiScore = Math.max(0, 100 - aqi); // lower AQI better
  const disasterScore = Math.max(0, 100 - disasterFrequency * 20); 
  const soilScore = soilQuality; // already 0–100

  const finalScore =
    aqiScore * 0.4 +
    disasterScore * 0.3 +
    soilScore * 0.3;

  return Math.round(finalScore);
}
