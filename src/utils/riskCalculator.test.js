import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBMI, evaluateScreeningGuidance } from './riskCalculator.js';

test('calculateBMI returns a rounded metric BMI', () => {
  assert.equal(calculateBMI(170, 70), 24.2);
});

test('calculateBMI rejects invalid measurements', () => {
  assert.equal(calculateBMI(0, 70), null);
  assert.equal(calculateBMI(170, -1), null);
});

test('guidance recommends a conversation at the Asian American BMI threshold', () => {
  const result = evaluateScreeningGuidance({ age: 25, bmi: 23, familyHistory: false, gestational: false, activityLevel: 'daily' });
  assert.equal(result.discussionRecommended, true);
  assert.equal(result.screeningFactorCount, 1);
});

test('activity is shown as context but does not create a diagnostic score', () => {
  const result = evaluateScreeningGuidance({ age: 25, bmi: 21, familyHistory: false, gestational: false, activityLevel: 'rarely' });
  assert.equal(result.discussionRecommended, false);
  assert.equal(result.factors.find((factor) => factor.key === 'activity').present, true);
  assert.equal('score' in result, false);
});
