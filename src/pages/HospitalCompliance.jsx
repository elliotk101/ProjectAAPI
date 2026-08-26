import { useEffect, useMemo, useState } from 'react';
import hospitals from '../data/hospitals.json';
import { SITE } from '../config/site';
import { useI18n } from '../i18n/i18nProvider';

const BOROUGHS = ['All Boroughs', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

function HospitalCompliance() {
  const { t } = useI18n();
  const [borough, setBorough] = useState('All Boroughs');
  useEffect(() => { document.title = `${t('compliance.title')} — ${SITE.name}`; }, [t]);
  const filtered = useMemo(() => borough === 'All Boroughs' ? hospitals : hospitals.filter((hospital) => hospital.borough === borough), [borough]);

  return (
    <section className="compliance page-enter">
      <div className="section-heading"><p className="eyebrow">{t('compliance.info_title')}</p><h1>{t('compliance.title')}</h1><p>{t('compliance.subtitle')}</p></div>
      <div className="compliance__info-banner"><h2>{t('compliance.info_title')}</h2><p>{t('compliance.info_text')}</p>
        <a href="https://www.nysenate.gov/legislation/bills/2025/S6288/amendment/B" target="_blank" rel="noreferrer">{t('bill.official_record')} ↗</a></div>
      <div className="directory__filters" aria-label={t('compliance.title')}>{BOROUGHS.map((item) => <button key={item} className={`chip ${borough === item ? 'chip--active' : ''}`} aria-pressed={borough === item} onClick={() => setBorough(item)}>{item === 'All Boroughs' ? t('compliance.filter_all') : item}</button>)}</div>
      <div className="compliance__grid">{filtered.map((hospital) => <article className="glass-card compliance-card" key={hospital.id}>
        <div className="compliance-card__header"><div><h2 className="compliance-card__name">{hospital.name}</h2><p className="compliance-card__borough">{hospital.address}</p></div><span className="badge badge--teal">{hospital.borough}</span></div>
        <ul className="request-list"><li>{t('compliance.coordinator')}</li><li>{t('compliance.materials')}</li><li>{t('compliance.identification')}</li></ul>
        <a className="btn btn--secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`} target="_blank" rel="noreferrer">{t('nav.map')}</a>
      </article>)}</div>
    </section>
  );
}

export default HospitalCompliance;
