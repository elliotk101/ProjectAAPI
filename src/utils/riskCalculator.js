export function calculateBMI(heightCm, weightKg) {
  const height = Number(heightCm);
  const weight = Number(weightKg);
  if (!Number.isFinite(height) || !Number.isFinite(weight) || height <= 0 || weight <= 0) return null;
  return +(weight / ((height / 100) ** 2)).toFixed(1);
}

export function evaluateScreeningGuidance(data) {
  const age = Number(data.age);
  const bmi = Number(data.bmi);
  const waist = Number(data.waistCm);
  const height = Number(data.heightCm);
  const waistToHeight = Number.isFinite(waist) && waist > 0 && Number.isFinite(height) && height > 0
    ? +(waist / height).toFixed(2)
    : null;
  const factors = [
    { key: 'bmi', present: Number.isFinite(bmi) && bmi >= 23, value: Number.isFinite(bmi) ? bmi : null },
    { key: 'age', present: Number.isFinite(age) && age >= 35, value: Number.isFinite(age) ? age : null },
    { key: 'centralAdiposity', present: waistToHeight !== null && waistToHeight >= 0.5, value: waistToHeight },
    { key: 'family', present: data.familyHistory === true },
    { key: 'gestational', present: data.gestational === true },
    { key: 'hypertension', present: data.hypertension === true },
    { key: 'cardiovascular', present: data.cardiovascular === true },
    { key: 'pcos', present: data.pcos === true },
    { key: 'prediabetes', present: data.priorPrediabetes === true },
    { key: 'activity', present: data.activityLevel === 'rarely' || data.activityLevel === 'occasional' },
    { key: 'sugaryDrinks', present: data.sugaryDrinks === 'daily' },
    { key: 'afterMeal', present: data.afterMeal === 'no' },
    { key: 'sleep', present: data.sleep === 'yes' },
  ];
  const clinicalKeys = new Set(['bmi', 'centralAdiposity', 'family', 'gestational', 'hypertension', 'cardiovascular', 'pcos', 'prediabetes']);
  const clinicalFactors = factors.filter((factor) => clinicalKeys.has(factor.key) && factor.present);
  const lastTestDue = data.lastTest === 'never' || data.lastTest === 'over3' || data.lastTest === 'unknown';
  const routineScreeningDue = (Number.isFinite(age) && age >= 35) || lastTestDue || data.priorPrediabetes === true || data.gestational === true;
  return {
    discussionRecommended: clinicalFactors.length > 0,
    routineScreeningDue,
    ageOnly: Number.isFinite(age) && age >= 35 && clinicalFactors.length === 0,
    lastTestDue,
    waistToHeight,
    factors,
    clinicalFactorCount: clinicalFactors.length,
    lifestyleFactors: factors.filter((factor) => ['activity', 'sugaryDrinks', 'afterMeal', 'sleep'].includes(factor.key) && factor.present),
  };
}
