export function calculateBMI(heightCm, weightKg) {
  const height = Number(heightCm);
  const weight = Number(weightKg);
  if (!Number.isFinite(height) || !Number.isFinite(weight) || height <= 0 || weight <= 0) return null;
  return +(weight / ((height / 100) ** 2)).toFixed(1);
}

export function evaluateScreeningGuidance(data) {
  const age = Number(data.age);
  const bmi = Number(data.bmi);
  const factors = [
    { key: 'bmi', present: Number.isFinite(bmi) && bmi >= 23, value: Number.isFinite(bmi) ? bmi : null },
    { key: 'age', present: Number.isFinite(age) && age >= 35, value: Number.isFinite(age) ? age : null },
    { key: 'family', present: data.familyHistory === true },
    { key: 'gestational', present: data.gestational === true },
    { key: 'activity', present: data.activityLevel === 'rarely' || data.activityLevel === 'occasional' },
  ];
  const screeningFactors = factors.filter((factor) => factor.key !== 'activity' && factor.present);
  return {
    discussionRecommended: screeningFactors.length > 0,
    factors,
    screeningFactorCount: screeningFactors.length,
  };
}
