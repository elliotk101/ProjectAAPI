import { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../i18n/i18nProvider';
import hospitals from '../data/hospitals.json';

const BOROUGHS = ['All Boroughs', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

const CHECKLIST_ITEMS = [
  { key: 'coordinator', labelKey: 'compliance.coordinator' },
  { key: 'identification', labelKey: 'compliance.identification' },
  { key: 'materials', labelKey: 'compliance.materials' },
  { key: 'training', labelKey: 'compliance.training' },
];

function getStatusIcon(value) {
  if (value === true) return { icon: '✓', cls: 'compliance-card__item-icon--yes' };
  if (value === false) return { icon: '✗', cls: 'compliance-card__item-icon--no' };
  return { icon: '?', cls: 'compliance-card__item-icon--unknown' };
}

function getComplianceScore(hospital) {
  let compliant = 0;
  let total = 0;
  CHECKLIST_ITEMS.forEach(({ key }) => {
    if (hospital[key] === true) compliant++;
    if (hospital[key] !== 'unknown') total++;
  });
  if (total === 0) return 'unknown';
  if (compliant === CHECKLIST_ITEMS.length) return 'compliant';
  if (compliant > 0) return 'partial';
  return 'unknown';
}

function HospitalCompliance() {
  const { t } = useI18n();
  const [borough, setBorough] = useState('All Boroughs');

  useEffect(() => {
    document.title = `${t('compliance.title')} — AAPI Health Equity`;
  }, [t]);

  const filtered = useMemo(() => {
    if (borough === 'All Boroughs') return hospitals;
    return hospitals.filter((h) => h.borough === borough);
  }, [borough]);

  return (
    <div className="compliance page-enter">
      <div className="section-heading">
        <h1 style={{ fontSize: 'var(--fs-3xl)' }}>{t('compliance.title')}</h1>
        <p>{t('compliance.subtitle')}</p>
      </div>

      {/* Info Banner */}
      <div className="compliance__info-banner" id="compliance-info">
        <h3>⚖️ {t('compliance.info_title')}</h3>
        <p>{t('compliance.info_text')}</p>
      </div>

      {/* Borough filter */}
      <div className="directory__filters" style={{ marginBottom: 'var(--space-8)' }}>
        {BOROUGHS.map((b) => (
          <button
            key={b}
            className={`chip ${borough === b ? 'chip--active' : ''}`}
            onClick={() => setBorough(b)}
            id={`borough-${b.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {b === 'All Boroughs' ? t('compliance.filter_all') : b}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-8)', flexWrap: 'wrap', fontSize: 'var(--fs-sm)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="compliance-card__item-icon compliance-card__item-icon--yes" style={{ width: 16, height: 16, fontSize: '10px' }}>✓</span>
          {t('compliance.status_compliant')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="compliance-card__item-icon compliance-card__item-icon--unknown" style={{ width: 16, height: 16, fontSize: '10px' }}>?</span>
          {t('compliance.status_unknown')}
        </span>
      </div>

      {/* Hospital Cards */}
      <div className="compliance__grid fade-stagger">
        {filtered.map((hospital) => {
          const status = getComplianceScore(hospital);
          const statusBadgeClass =
            status === 'compliant' ? 'badge--teal' : status === 'partial' ? 'badge--amber' : 'badge--indigo';

          return (
            <div className="glass-card compliance-card" key={hospital.id} id={`hospital-${hospital.id}`}>
              <div className="compliance-card__header">
                <div>
                  <div className="compliance-card__name">{hospital.name}</div>
                  <div className="compliance-card__borough">{hospital.address}</div>
                </div>
                <span className={`badge ${statusBadgeClass}`}>
                  {t(`compliance.status_${status}`)}
                </span>
              </div>

              <div className="compliance-card__checklist">
                {CHECKLIST_ITEMS.map(({ key, labelKey }) => {
                  const { icon, cls } = getStatusIcon(hospital[key]);
                  return (
                    <div className="compliance-card__item" key={key}>
                      <span className={`compliance-card__item-icon ${cls}`}>{icon}</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{t(labelKey)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HospitalCompliance;
