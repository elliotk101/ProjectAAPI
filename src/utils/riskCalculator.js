/**
 * AAPI-Specific Diabetes Risk Calculator
 *
 * Uses ADA-recommended lower BMI threshold (≥23 kg/m²) for Asian Americans
 * instead of the general population threshold (≥25 kg/m²).
 *
 * Risk factors are weighted based on clinical evidence for AAPI populations.
 */

/**
 * Calculate BMI from height (cm) and weight (kg).
 */
export function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
}

/**
 * Ethnicity-specific risk multipliers.
 * South Asian populations have the highest diabetes risk among AAPI groups.
 */
const ETHNICITY_WEIGHTS = {
  south_asian: 1.5,
  pacific_islander: 1.3,
  southeast_asian: 1.2,
  east_asian: 1.0,
  other_aapi: 1.1,
};

/**
 * Calculate diabetes risk score (0–100).
 *
 * @param {Object} data
 * @param {number} data.age
 * @param {number} data.bmi - Pre-calculated BMI
 * @param {number} data.waist - Waist circumference in cm
 * @param {boolean} data.familyHistory
 * @param {boolean|null} data.gestational - null if not applicable
 * @param {string} data.activityLevel - 'daily' | 'weekly' | 'occasional' | 'rarely'
 * @param {string} data.ethnicity - key from ETHNICITY_WEIGHTS
 * @returns {{ score: number, level: string, recommendations: string[] }}
 */
export function calculateRisk(data) {
  let rawScore = 0;
  const breakdown = [];

  // --- Age (max 20 points) ---
  let agePoints = 0;
  if (data.age >= 65) agePoints = 20;
  else if (data.age >= 55) agePoints = 15;
  else if (data.age >= 45) agePoints = 10;
  else if (data.age >= 35) agePoints = 5;
  rawScore += agePoints;
  breakdown.push({
    factorKey: 'screener.factor_age',
    value: `${data.age} ${data.age === 1 ? 'yr' : 'yrs'}`,
    points: agePoints,
  });

  // --- BMI using AAPI threshold ≥23 (max 25 points) ---
  let bmiPoints = 0;
  if (data.bmi) {
    if (data.bmi >= 30) bmiPoints = 25;
    else if (data.bmi >= 27) bmiPoints = 20;
    else if (data.bmi >= 25) bmiPoints = 15;
    else if (data.bmi >= 23) bmiPoints = 10; // AAPI-specific: risk starts at 23
  }
  rawScore += bmiPoints;
  breakdown.push({
    factorKey: 'screener.factor_bmi',
    value: data.bmi ? `${data.bmi} kg/m²` : 'N/A',
    points: bmiPoints,
    isAapiSpecific: data.bmi >= 23,
  });

  // --- Waist circumference (max 15 points) ---
  let waistPoints = 0;
  if (data.waist) {
    if (data.waist >= 100) waistPoints = 15;
    else if (data.waist >= 90) waistPoints = 12;
    else if (data.waist >= 80) waistPoints = 8;
  }
  rawScore += waistPoints;
  if (data.waist) {
    breakdown.push({
      factorKey: 'screener.factor_waist',
      value: `${data.waist} cm`,
      points: waistPoints,
    });
  }

  // --- Family history (max 15 points) ---
  let familyPoints = data.familyHistory ? 15 : 0;
  rawScore += familyPoints;
  breakdown.push({
    factorKey: 'screener.factor_family',
    valueKey: data.familyHistory ? 'screener.yes' : 'screener.no',
    points: familyPoints,
  });

  // --- Gestational diabetes (max 10 points) ---
  if (data.gestational !== null) {
    let gestPoints = data.gestational === true ? 10 : 0;
    rawScore += gestPoints;
    breakdown.push({
      factorKey: 'screener.factor_gestational',
      valueKey: data.gestational ? 'screener.yes' : 'screener.no',
      points: gestPoints,
    });
  }

  // --- Physical activity (max 10 points) ---
  let actPoints = 5;
  switch (data.activityLevel) {
    case 'daily':
      actPoints = 0;
      break;
    case 'weekly':
      actPoints = 3;
      break;
    case 'occasional':
      actPoints = 6;
      break;
    case 'rarely':
      actPoints = 10;
      break;
    default:
      actPoints = 5;
  }
  rawScore += actPoints;
  breakdown.push({
    factorKey: 'screener.factor_activity',
    valueKey: data.activityLevel ? `screener.activity_${data.activityLevel}` : null,
    points: actPoints,
  });

  // --- Ethnicity multiplier ---
  const multiplier = ETHNICITY_WEIGHTS[data.ethnicity] || 1.0;
  const score = Math.round(Math.min(rawScore * multiplier, 100));

  // --- Determine risk level ---
  let level;
  if (score >= 70) level = 'very-high';
  else if (score >= 50) level = 'high';
  else if (score >= 30) level = 'moderate';
  else level = 'low';

  // --- Build recommendations ---
  const recommendations = [];

  if (level === 'very-high' || level === 'high') {
    recommendations.push('Schedule an A1C blood test with your doctor as soon as possible.');
    recommendations.push('Request a fasting glucose test during your next visit.');
  }

  if (data.bmi && data.bmi >= 23) {
    recommendations.push(
      `Your BMI of ${data.bmi} exceeds the AAPI threshold of 23. Even at this level, your risk for type 2 diabetes is elevated compared to the general population.`
    );
  }

  if (data.familyHistory) {
    recommendations.push(
      'With a family history of diabetes, regular screening (at least annually) is strongly recommended.'
    );
  }

  if (data.activityLevel === 'rarely' || data.activityLevel === 'occasional') {
    recommendations.push(
      'Increasing physical activity to at least 150 minutes per week can reduce your risk by up to 58%.'
    );
  }

  if (data.waist && data.waist >= 80) {
    recommendations.push(
      'Elevated waist circumference indicates higher visceral fat, a key risk factor for AAPI populations. A waist-to-height ratio under 0.5 is ideal.'
    );
  }

  recommendations.push(
    'Connect with an AAPI-serving community health organization for culturally-competent diabetes prevention support.'
  );

  return {
    score,
    rawScore,
    multiplier,
    ethnicityKey: data.ethnicity ? `screener.ethnicity_${data.ethnicity}` : null,
    level,
    breakdown,
    recommendations,
  };
}
