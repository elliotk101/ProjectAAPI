import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import { calculateBMI, calculateRisk } from '../utils/riskCalculator';

const STEPS = ['age', 'body', 'health', 'lifestyle', 'ethnicity'];

const INITIAL_DATA = {
  age: '',
  heightCm: '',
  weightKg: '',
  waist: '',
  // Imperial fields
  heightFt: '',
  heightIn: '',
  weightLbs: '',
  waistIn: '',
  familyHistory: null,
  gestational: null,
  activityLevel: '',
  ethnicity: '',
};

// Conversion helpers
function ftInToCm(ft, inches) {
  const totalInches = (Number(ft) || 0) * 12 + (Number(inches) || 0);
  return totalInches > 0 ? +(totalInches * 2.54).toFixed(1) : '';
}
function lbsToKg(lbs) {
  return lbs ? +(Number(lbs) * 0.453592).toFixed(1) : '';
}
function inToCm(inches) {
  return inches ? +(Number(inches) * 2.54).toFixed(1) : '';
}

function RiskScreener() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [result, setResult] = useState(null);
  const [unitSystem, setUnitSystem] = useState('metric');

  useEffect(() => {
    document.title = `${t('screener.title')} — AAPI Health Equity`;
  }, [t]);

  const update = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  // Compute effective metric values based on unit system
  const effectiveHeightCm = unitSystem === 'imperial'
    ? ftInToCm(data.heightFt, data.heightIn)
    : Number(data.heightCm);
  const effectiveWeightKg = unitSystem === 'imperial'
    ? lbsToKg(data.weightLbs)
    : Number(data.weightKg);
  const effectiveWaist = unitSystem === 'imperial'
    ? inToCm(data.waistIn)
    : Number(data.waist);

  const bmi = calculateBMI(effectiveHeightCm, effectiveWeightKg);

  const canProceed = () => {
    switch (step) {
      case 0: return data.age !== '' && Number(data.age) > 0;
      case 1:
        if (unitSystem === 'imperial') {
          return data.heightFt !== '' && data.weightLbs !== '';
        }
        return data.heightCm !== '' && data.weightKg !== '';
      case 2: return data.familyHistory !== null;
      case 3: return data.activityLevel !== '';
      case 4: return data.ethnicity !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate results
      const res = calculateRisk({
        age: Number(data.age),
        bmi,
        waist: effectiveWaist || null,
        familyHistory: data.familyHistory === true,
        gestational: data.gestational,
        activityLevel: data.activityLevel,
        ethnicity: data.ethnicity,
      });
      setResult(res);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleRestart = () => {
    setStep(0);
    setData(INITIAL_DATA);
    setResult(null);
  };

  const riskLevelKey = result
    ? `screener.risk_${result.level.replace('-', '_')}`
    : '';

  return (
    <div className="screener page-enter">
      <div className="section-heading" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--fs-3xl)' }}>{t('screener.title')}</h1>
        <p>{t('screener.subtitle')}</p>
      </div>

      {/* Progress bar */}
      {!result && (
        <div className="screener__progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`screener__progress-step ${
                i < step ? 'screener__progress-step--done' : ''
              } ${i === step ? 'screener__progress-step--active' : ''}`}
            />
          ))}
        </div>
      )}

      {/* Step content */}
      {!result ? (
        <div className="glass-card screener__card" key={step}>
          {step === 0 && (
            <>
              <h2>{t('screener.step_age')}</h2>
              <p>{t('screener.age_label')}</p>
              <div className="screener__field">
                <div className="input-group">
                  <input
                    type="number"
                    className="input-field"
                    placeholder={t('screener.age_placeholder')}
                    value={data.age}
                    onChange={(e) => update('age', e.target.value)}
                    min="1"
                    max="120"
                    id="input-age"
                    aria-label={t('screener.age_label')}
                  />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2>{t('screener.step_body')}</h2>
              <p>{t('screener.bmi_note')}</p>

              {/* Unit Toggle */}
              <div className="unit-toggle" style={{ marginBottom: 'var(--space-6)' }}>
                <button
                  type="button"
                  className={`unit-toggle__option ${unitSystem === 'metric' ? 'unit-toggle__option--active' : ''}`}
                  onClick={() => setUnitSystem('metric')}
                  id="unit-metric"
                >
                  📏 {t('screener.unit_metric')}
                </button>
                <button
                  type="button"
                  className={`unit-toggle__option ${unitSystem === 'imperial' ? 'unit-toggle__option--active' : ''}`}
                  onClick={() => setUnitSystem('imperial')}
                  id="unit-imperial"
                >
                  📐 {t('screener.unit_imperial')}
                </button>
              </div>

              {/* Height */}
              {unitSystem === 'metric' ? (
                <div className="screener__field">
                  <div className="input-group">
                    <label htmlFor="input-height">{t('screener.height_label')}</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder={t('screener.height_placeholder')}
                      value={data.heightCm}
                      onChange={(e) => update('heightCm', e.target.value)}
                      id="input-height"
                    />
                  </div>
                </div>
              ) : (
                <div className="screener__field" style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label htmlFor="input-height-ft">{t('screener.height_ft_label')}</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder={t('screener.height_ft_placeholder')}
                      value={data.heightFt}
                      onChange={(e) => update('heightFt', e.target.value)}
                      id="input-height-ft"
                      min="0"
                      max="8"
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label htmlFor="input-height-in">{t('screener.height_in_label')}</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder={t('screener.height_in_placeholder')}
                      value={data.heightIn}
                      onChange={(e) => update('heightIn', e.target.value)}
                      id="input-height-in"
                      min="0"
                      max="11"
                    />
                  </div>
                </div>
              )}

              {/* Weight */}
              <div className="screener__field">
                <div className="input-group">
                  <label htmlFor={unitSystem === 'metric' ? 'input-weight' : 'input-weight-lbs'}>
                    {unitSystem === 'metric' ? t('screener.weight_label') : t('screener.weight_lbs_label')}
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder={unitSystem === 'metric' ? t('screener.weight_placeholder') : t('screener.weight_lbs_placeholder')}
                    value={unitSystem === 'metric' ? data.weightKg : data.weightLbs}
                    onChange={(e) => update(unitSystem === 'metric' ? 'weightKg' : 'weightLbs', e.target.value)}
                    id={unitSystem === 'metric' ? 'input-weight' : 'input-weight-lbs'}
                  />
                </div>
              </div>

              {/* BMI Display */}
              {bmi && (
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: bmi >= 23 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)', border: `1px solid ${bmi >= 23 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'}` }}>
                  <strong>{t('screener.your_bmi')}:</strong> {bmi}
                  {bmi >= 23 && <span style={{ color: 'var(--color-amber-400)', marginLeft: 'var(--space-2)' }}>⚠ {t('screener.bmi_note')}</span>}
                </div>
              )}

              {/* Waist */}
              <div className="screener__field" style={{ marginTop: 'var(--space-4)' }}>
                <div className="input-group">
                  <label htmlFor={unitSystem === 'metric' ? 'input-waist' : 'input-waist-in'}>
                    {unitSystem === 'metric' ? t('screener.waist_label') : t('screener.waist_in_label')}
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder={unitSystem === 'metric' ? t('screener.waist_placeholder') : t('screener.waist_in_placeholder')}
                    value={unitSystem === 'metric' ? data.waist : data.waistIn}
                    onChange={(e) => update(unitSystem === 'metric' ? 'waist' : 'waistIn', e.target.value)}
                    id={unitSystem === 'metric' ? 'input-waist' : 'input-waist-in'}
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2>{t('screener.step_health')}</h2>
              <div className="screener__field">
                <div className="input-group">
                  <label>{t('screener.family_history')}</label>
                  <div className="toggle-group">
                    <button
                      type="button"
                      className={`toggle-option ${data.familyHistory === true ? 'toggle-option--selected' : ''}`}
                      onClick={() => update('familyHistory', true)}
                      id="btn-family-yes"
                    >
                      {t('screener.yes')}
                    </button>
                    <button
                      type="button"
                      className={`toggle-option ${data.familyHistory === false ? 'toggle-option--selected' : ''}`}
                      onClick={() => update('familyHistory', false)}
                      id="btn-family-no"
                    >
                      {t('screener.no')}
                    </button>
                  </div>
                </div>
              </div>
              <div className="screener__field">
                <div className="input-group">
                  <label>{t('screener.gestational')}</label>
                  <div className="toggle-group">
                    <button
                      type="button"
                      className={`toggle-option ${data.gestational === true ? 'toggle-option--selected' : ''}`}
                      onClick={() => update('gestational', true)}
                      id="btn-gestational-yes"
                    >
                      {t('screener.yes')}
                    </button>
                    <button
                      type="button"
                      className={`toggle-option ${data.gestational === false ? 'toggle-option--selected' : ''}`}
                      onClick={() => update('gestational', false)}
                      id="btn-gestational-no"
                    >
                      {t('screener.no')}
                    </button>
                    <button
                      type="button"
                      className={`toggle-option ${data.gestational === null ? 'toggle-option--selected' : ''}`}
                      onClick={() => update('gestational', null)}
                      id="btn-gestational-na"
                    >
                      {t('screener.not_applicable')}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2>{t('screener.step_lifestyle')}</h2>
              <div className="screener__field">
                <div className="input-group">
                  <label>{t('screener.activity_label')}</label>
                  <div className="toggle-group" style={{ flexWrap: 'wrap' }}>
                    {['daily', 'weekly', 'occasional', 'rarely'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`toggle-option ${data.activityLevel === level ? 'toggle-option--selected' : ''}`}
                        onClick={() => update('activityLevel', level)}
                        id={`btn-activity-${level}`}
                      >
                        {t(`screener.activity_${level}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2>{t('screener.step_ethnicity')}</h2>
              <div className="screener__field">
                <div className="input-group">
                  <label>{t('screener.ethnicity_label')}</label>
                  <div className="toggle-group" style={{ flexWrap: 'wrap' }}>
                    {['south_asian', 'east_asian', 'southeast_asian', 'pacific_islander', 'other_aapi'].map((eth) => (
                      <button
                        key={eth}
                        type="button"
                        className={`toggle-option ${data.ethnicity === eth ? 'toggle-option--selected' : ''}`}
                        onClick={() => update('ethnicity', eth)}
                        id={`btn-eth-${eth}`}
                      >
                        {t(`screener.ethnicity_${eth}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="screener__actions">
            <button
              className="btn btn--secondary"
              onClick={handleBack}
              disabled={step === 0}
              style={{ opacity: step === 0 ? 0.3 : 1 }}
              id="btn-back"
            >
              ← {t('screener.back')}
            </button>
            <button
              className="btn btn--primary"
              onClick={handleNext}
              disabled={!canProceed()}
              style={{ opacity: canProceed() ? 1 : 0.4 }}
              id="btn-next"
            >
              {step === STEPS.length - 1 ? t('screener.see_results') : `${t('screener.next')} →`}
            </button>
          </div>
        </div>
      ) : (
        /* === RESULTS === */
        <div className="glass-card screener__card results" key="results">
          <h2>{t('screener.result_title')}</h2>

          <div className={`results__score results__score--${result.level}`}>
            <span className="results__score-value">{result.score}</span>
            <span className="results__score-label">{t(riskLevelKey)}</span>
          </div>

          {/* === RISK SCALE & EXPLANATION === */}
          <div className="score-explanation-box">
            <h3>{t('screener.score_scale_title')}</h3>
            <p className="score-explanation-intro">
              Your overall risk score is <strong>{result.score} out of 100</strong>. Scores evaluate your likelihood of developing pre-diabetes or type 2 diabetes based on ADA guidelines adjusted for AAPI populations.
            </p>

            {/* Scale Bar */}
            <div className="risk-scale-container" aria-label="Risk score scale from 0 to 100">
              <div className="risk-scale-track">
                <div className="scale-segment scale-segment--low" title="0-29 Low Risk" style={{ flex: '30' }}>
                  <span>0-29</span>
                </div>
                <div className="scale-segment scale-segment--moderate" title="30-49 Moderate Risk" style={{ flex: '20' }}>
                  <span>30-49</span>
                </div>
                <div className="scale-segment scale-segment--high" title="50-69 High Risk" style={{ flex: '20' }}>
                  <span>50-69</span>
                </div>
                <div className="scale-segment scale-segment--very-high" title="70-100 Very High Risk" style={{ flex: '30' }}>
                  <span>70-100</span>
                </div>
              </div>
              <div
                className="risk-scale-pin"
                style={{ left: `${Math.min(Math.max(result.score, 2), 98)}%` }}
                title={`Your score: ${result.score}`}
              >
                <div className="pin-head">{result.score}</div>
                <div className="pin-pointer" />
              </div>
            </div>

            {/* Scale Ranges Grid */}
            <div className="scale-legend-grid">
              <div className={`legend-item ${result.level === 'low' ? 'legend-item--active' : ''}`}>
                <span className="legend-dot legend-dot--low" />
                <span>{t('screener.range_low_desc')}</span>
              </div>
              <div className={`legend-item ${result.level === 'moderate' ? 'legend-item--active' : ''}`}>
                <span className="legend-dot legend-dot--moderate" />
                <span>{t('screener.range_moderate_desc')}</span>
              </div>
              <div className={`legend-item ${result.level === 'high' ? 'legend-item--active' : ''}`}>
                <span className="legend-dot legend-dot--high" />
                <span>{t('screener.range_high_desc')}</span>
              </div>
              <div className={`legend-item ${result.level === 'very-high' ? 'legend-item--active' : ''}`}>
                <span className="legend-dot legend-dot--very-high" />
                <span>{t('screener.range_very_high_desc')}</span>
              </div>
            </div>
          </div>

          {/* === ITEMIZED SCORE BREAKDOWN === */}
          <div className="score-breakdown-box">
            <h3>{t('screener.score_breakdown_title')}</h3>
            <div className="breakdown-table">
              {result.breakdown && result.breakdown.map((item, idx) => (
                <div className="breakdown-row" key={idx}>
                  <div className="breakdown-row__label">
                    <span>{t(item.factorKey)}</span>
                    {item.isAapiSpecific && (
                      <span className="aapi-tag">AAPI Cutoff</span>
                    )}
                  </div>
                  <div className="breakdown-row__value">
                    {item.valueKey ? t(item.valueKey) : item.value}
                  </div>
                  <div className="breakdown-row__pts">
                    +{item.points} {t('screener.pts')}
                  </div>
                </div>
              ))}

              {result.multiplier && result.multiplier > 1.0 && (
                <div className="breakdown-row breakdown-row--multiplier">
                  <div className="breakdown-row__label">
                    <span>{t('screener.factor_ethnicity_multiplier')}</span>
                    {result.ethnicityKey && <span className="sub-ethnicity-tag">{t(result.ethnicityKey)}</span>}
                  </div>
                  <div className="breakdown-row__value">
                    x{result.multiplier}
                  </div>
                  <div className="breakdown-row__pts">
                    Sub-group Weight
                  </div>
                </div>
              )}

              <div className="breakdown-row breakdown-row--total">
                <div className="breakdown-row__label">
                  <strong>Total Calculated Risk Score</strong>
                </div>
                <div className="breakdown-row__pts" style={{ fontSize: 'var(--fs-lg)', fontWeight: 'bold' }}>
                  {result.score} / 100
                </div>
              </div>
            </div>
          </div>

          <div className="results__recommendations">
            <h3>{t('screener.next_steps')}</h3>
            <ul>
              {result.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginTop: 'var(--space-8)', flexWrap: 'wrap' }}>
            <Link to="/resources" className="btn btn--primary" id="btn-find-provider">
              📁 {t('screener.find_provider')}
            </Link>
            <Link to="/tracker" className="btn btn--secondary" id="btn-view-tracker">
              ✅ {t('nav.tracker')}
            </Link>
            <button className="btn btn--secondary" onClick={handleRestart} id="btn-restart">
              🔄 {t('screener.start_over')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskScreener;
