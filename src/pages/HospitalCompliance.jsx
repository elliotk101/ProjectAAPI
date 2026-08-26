import { useEffect, useMemo, useState } from 'react';
import hospitals from '../data/hospitals.json';
import { SITE } from '../config/site';

const BOROUGHS = ['All Boroughs', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

function HospitalCompliance() {
  const [borough, setBorough] = useState('All Boroughs');
  useEffect(() => { document.title = `Hospital Language Assistance Guide — ${SITE.name}`; }, []);
  const filtered = useMemo(() => borough === 'All Boroughs' ? hospitals : hospitals.filter((hospital) => hospital.borough === borough), [borough]);

  return (
    <section className="compliance page-enter">
      <div className="section-heading"><p className="eyebrow">Know your language rights</p><h1>Hospital Language Assistance Guide</h1><p>Find major New York City hospitals and learn what language assistance to request.</p>
        <p className="data-note">This directory does not rate or certify individual hospitals. Contact the hospital to confirm currently available interpreters and translated materials.</p></div>
      <div className="compliance__info-banner"><h2>What New York hospitals must prepare for</h2><p>New York’s hospital language access law, signed December 10, 2025, addresses language-needs identification, language assistance coordination, translated materials, and culturally competent staff training. Ask the hospital how it provides these services for your language.</p>
        <a href="https://www.nysenate.gov/legislation/bills/2025/S6288/amendment/B" target="_blank" rel="noreferrer">Read the official law record ↗</a></div>
      <div className="directory__filters" aria-label="Filter hospitals by borough">{BOROUGHS.map((item) => <button key={item} className={`chip ${borough === item ? 'chip--active' : ''}`} aria-pressed={borough === item} onClick={() => setBorough(item)}>{item}</button>)}</div>
      <p className="result-count" aria-live="polite">Showing {filtered.length} hospitals</p>
      <div className="compliance__grid">{filtered.map((hospital) => <article className="glass-card compliance-card" key={hospital.id}>
        <div className="compliance-card__header"><div><h2 className="compliance-card__name">{hospital.name}</h2><p className="compliance-card__borough">{hospital.address}</p></div><span className="badge badge--teal">{hospital.borough}</span></div>
        <ul className="request-list"><li>Ask for a qualified interpreter</li><li>Ask for important documents in your language</li><li>Tell staff your preferred spoken and written language</li></ul>
        <a className="btn btn--secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`} target="_blank" rel="noreferrer">Get directions</a>
      </article>)}</div>
    </section>
  );
}

export default HospitalCompliance;
