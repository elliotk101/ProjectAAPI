import { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../i18n/i18nProvider';
import nonprofits from '../data/nonprofits.json';

const SERVICE_FILTERS = ['All', 'Healthcare', 'Food Security', 'Legal', 'Education', 'Social Services'];

function ResourceDirectory() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    document.title = `${t('directory.title')} — AAPICHECK`;
  }, [t]);

  const filtered = useMemo(() => {
    let results = nonprofits;

    if (activeFilter !== 'All') {
      results = results.filter((org) =>
        org.services.some((s) => s.toLowerCase() === activeFilter.toLowerCase())
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (org) =>
          org.name.toLowerCase().includes(q) ||
          org.services.some((s) => s.toLowerCase().includes(q)) ||
          org.languages.some((l) => l.toLowerCase().includes(q)) ||
          org.borough.toLowerCase().includes(q)
      );
    }

    return results;
  }, [search, activeFilter]);

  const filterKey = (filter) => {
    const key = `directory.filter_${filter.toLowerCase().replace(/\s+/g, '_')}`;
    const translated = t(key);
    return translated !== key ? translated : filter;
  };

  return (
    <div className="directory page-enter">
      <div className="section-heading">
        <h1 style={{ fontSize: 'var(--fs-3xl)' }}>{t('directory.title')}</h1>
        <p>{t('directory.subtitle')}</p>
        <p className="data-note">{t('directory.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="directory__search">
        <input
          type="text"
          className="directory__search-input"
          placeholder={t('directory.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="search-resources"
          aria-label={t('directory.search_placeholder')}
        />
      </div>

      {/* Filters */}
      <div className="directory__filters">
        {SERVICE_FILTERS.map((filter) => (
          <button
            key={filter}
            className={`chip ${activeFilter === filter ? 'chip--active' : ''}`}
            onClick={() => setActiveFilter(filter)}
            aria-pressed={activeFilter === filter}
            id={`filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {filterKey(filter)}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="result-count" aria-live="polite">Showing {filtered.length} of {nonprofits.length} organizations</p>
      {filtered.length > 0 ? (
        <div className="directory__grid fade-stagger">
          {filtered.map((org) => (
            <div className="glass-card resource-card" key={org.id} id={`org-${org.id}`}>
              <div className="resource-card__name">{org.name}</div>
              <div className="resource-card__address">📍 {org.address}</div>

              <div className="resource-card__services">
                {org.services.map((service) => (
                  <span key={service} className="badge badge--indigo">
                    {service}
                  </span>
                ))}
              </div>

              <div className="resource-card__contact">
                {org.phone && <a href={`tel:${org.phone.replace(/[^+\d]/g, '')}`}>Call {org.phone}</a>}
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(org.address)}`} target="_blank" rel="noopener noreferrer">{t('nav.map')}</a>
                {org.website && org.website !== '#' && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-teal-400)' }}>
                    🌐 {t('directory.website')}
                  </a>
                )}
              </div>

              <div className="resource-card__languages">
                {org.languages.map((lang) => (
                  <span key={lang} className="badge badge--teal">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <p>{t('directory.no_results')}</p>
        </div>
      )}
    </div>
  );
}

export default ResourceDirectory;
