import { useState, useEffect, useMemo, useCallback } from 'react';
import { useI18n } from '../i18n/i18nProvider';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NYC_NEIGHBORHOODS, HEALTH_RESOURCES } from '../services/nycOpenData';
import 'leaflet/dist/leaflet.css';

/* ======================================================
   LAYER: Diabetes Prevalence
   Color-coded by prevalence rate with 5-tier scale.
   Size represents relative diabetes burden.
   ====================================================== */
function getDiabetesColor(prevalence) {
  if (prevalence >= 17) return '#dc2626'; // very high — red-600
  if (prevalence >= 14) return '#ea580c'; // high — orange-600
  if (prevalence >= 11) return '#d97706'; // elevated — amber-600
  if (prevalence >= 9)  return '#65a30d'; // moderate — lime-600
  return '#16a34a';                       // low — green-600
}

function getDiabetesLabel(prevalence, t) {
  if (prevalence >= 17) return t('map.diabetes_label_very_high');
  if (prevalence >= 14) return t('map.diabetes_label_high');
  if (prevalence >= 11) return t('map.diabetes_label_elevated');
  if (prevalence >= 9)  return t('map.diabetes_label_moderate');
  return t('map.diabetes_label_low');
}

/* ======================================================
   LAYER: AAPI Population
   Size = population count; Color intensity = % of total.
   ====================================================== */
function getAAPIColor(pct) {
  if (pct >= 40) return '#b45309'; // deep amber
  if (pct >= 25) return '#d97706';
  if (pct >= 15) return '#eab308';
  if (pct >= 8)  return '#facc15';
  return '#fde68a';                // light amber
}

/* ======================================================
   LAYER: Health Resources
   Custom icons by type (clinic / hospital / community).
   ====================================================== */
const RESOURCE_ICONS = {
  clinic: { emoji: '🏥', color: '#22c55e', label: 'Clinic / FQHC' },
  hospital: { emoji: '🏨', color: '#3b82f6', label: 'Hospital' },
  community: { emoji: '🤝', color: '#a855f7', label: 'Community Org' },
};

function createResourceIcon(type) {
  const config = RESOURCE_ICONS[type] || RESOURCE_ICONS.community;
  return L.divIcon({
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:${config.color};
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
      border:2px solid rgba(255,255,255,0.6);
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    ">${config.emoji}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

/* ======================================================
   HELPER: Fit bounds on mount
   ====================================================== */
function FitBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.map((l) => [l.lat, l.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [locations, map]);
  return null;
}

/* ======================================================
   SIDEBAR: Context-aware detail panel
   ====================================================== */
function Sidebar({ selected, activeLayer, onClose, t }) {
  if (!selected) return null;

  // Resource item sidebar
  if (activeLayer === 'resources' && selected._type === 'resource') {
    const r = selected;
    const config = RESOURCE_ICONS[r.type] || RESOURCE_ICONS.community;
    return (
      <div className="map-page__sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-lg)', lineHeight: 1.3 }}>{r.name}</h3>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-lg)', cursor: 'pointer', flexShrink: 0, marginLeft: 'var(--space-2)' }} aria-label="Close sidebar">✕</button>
        </div>
        <span className="badge" style={{ background: `${config.color}22`, color: config.color, marginBottom: 'var(--space-4)' }}>
          {config.emoji} {config.label}
        </span>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-sm)', margin: 'var(--space-3) 0' }}>📍 {r.address}</p>

        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('map.sidebar_services')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {r.services.map((s) => (
              <span key={s} className="badge badge--teal">{s}</span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('map.sidebar_languages')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {r.languages.map((l) => (
              <span key={l} className="badge badge--indigo">{l}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Neighborhood sidebar
  const n = selected;
  const diabetesColor = getDiabetesColor(n.diabetesPrevalence);
  const diabetesLabel = getDiabetesLabel(n.diabetesPrevalence, t);

  return (
    <div className="map-page__sidebar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-lg)', lineHeight: 1.3 }}>{n.name}</h3>
        <button onClick={onClose} style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-lg)', cursor: 'pointer', flexShrink: 0, marginLeft: 'var(--space-2)' }} aria-label="Close sidebar">✕</button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <span className="badge badge--indigo">{n.borough}</span>
        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>{n.uhf}</span>
      </div>

      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-sm)', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>
        {n.description}
      </p>

      {/* Stats cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Diabetes */}
        <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>{t('map.prevalence')}</div>
              <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', color: diabetesColor }}>
                {n.diabetesPrevalence}%
              </div>
            </div>
            <span className="badge" style={{ background: `${diabetesColor}22`, color: diabetesColor }}>{diabetesLabel}</span>
          </div>
          {/* Mini bar */}
          <div style={{ marginTop: 'var(--space-2)', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(n.diabetesPrevalence / 25 * 100, 100)}%`, background: diabetesColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* AAPI Population */}
        <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>{t('map.population')}</div>
              <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-amber-400)' }}>
                {n.aapiPopulation}%
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {n.aapiCount?.toLocaleString()}
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>{t('map.residents')}</div>
            </div>
          </div>
          {/* Mini bar */}
          <div style={{ marginTop: 'var(--space-2)', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(n.aapiPopulation / 70 * 100, 100)}%`, background: 'var(--color-amber-400)', borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Resources */}
        <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>{t('map.resources_available')}</div>
              <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', color: n.resources === 0 ? 'var(--color-risk-very-high)' : 'var(--color-risk-low)' }}>
                {n.resources}
              </div>
            </div>
            {n.resources === 0 && (
              <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>{t('map.gap_area')}</span>
            )}
          </div>
        </div>

        {/* Primary communities */}
        {n.primaryCommunities && (
          <div style={{ marginTop: 'var(--space-2)' }}>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('map.communities')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {n.primaryCommunities.map((c) => (
                <span key={c} className="badge badge--teal">{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   MAIN MAP COMPONENT
   ====================================================== */
function HealthMap() {
  const { t } = useI18n();
  const [selected, setSelected] = useState(null);
  const [activeLayer, setActiveLayer] = useState('diabetes');
  const [boroughFilter, setBoroughFilter] = useState('All');

  useEffect(() => {
    document.title = `${t('map.title')} — AAPICHECK`;
  }, [t]);

  const boroughs = ['All', 'Queens', 'Brooklyn', 'Manhattan', 'Bronx', 'Staten Island'];

  const filteredNeighborhoods = useMemo(() => {
    if (boroughFilter === 'All') return NYC_NEIGHBORHOODS;
    return NYC_NEIGHBORHOODS.filter((n) => n.borough === boroughFilter);
  }, [boroughFilter]);

  const filteredResources = useMemo(() => {
    if (boroughFilter === 'All') return HEALTH_RESOURCES;
    return HEALTH_RESOURCES.filter((resource) => {
      if (/Manhattan|Chinatown/i.test(resource.address)) return boroughFilter === 'Manhattan';
      if (/Brooklyn/i.test(resource.address)) return boroughFilter === 'Brooklyn';
      if (/Flushing|Elmhurst|Astoria|Bayside|Woodside|Jamaica/i.test(resource.address)) return boroughFilter === 'Queens';
      return false;
    });
  }, [boroughFilter]);

  // Sorted neighborhoods for the legend / ranking
  const sorted = useMemo(() => {
    const arr = [...filteredNeighborhoods];
    if (activeLayer === 'diabetes') arr.sort((a, b) => b.diabetesPrevalence - a.diabetesPrevalence);
    else if (activeLayer === 'aapi') arr.sort((a, b) => b.aapiPopulation - a.aapiPopulation);
    else arr.sort((a, b) => b.resources - a.resources);
    return arr.slice(0, 5);
  }, [filteredNeighborhoods, activeLayer]);

  const layers = [
    { key: 'diabetes', label: t('map.layer_diabetes'), icon: '🔴' },
    { key: 'aapi', label: t('map.layer_aapi'), icon: '🟡' },
    { key: 'resources', label: t('map.layer_resources'), icon: '🟢' },
  ];

  return (
    <div className="map-page page-enter">
      {/* Controls */}
      <div className="map-page__controls">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-lg)', marginRight: 'var(--space-4)', whiteSpace: 'nowrap' }}>
          🗺️ {t('map.title')}
        </h2>

        <p className="map-data-note">Curated public-health snapshot · verify source dates before use</p>

        {/* Layer toggles */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {layers.map((layer) => (
            <button
              key={layer.key}
              className={`chip ${activeLayer === layer.key ? 'chip--active' : ''}`}
              onClick={() => { setActiveLayer(layer.key); setSelected(null); }}
              aria-pressed={activeLayer === layer.key}
              id={`layer-${layer.key}`}
            >
              {layer.icon} {layer.label}
            </button>
          ))}
        </div>

        {/* Borough filter */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {boroughs.map((b) => (
            <button
              key={b}
              className={`chip ${boroughFilter === b ? 'chip--active' : ''}`}
              onClick={() => setBoroughFilter(b)}
              aria-pressed={boroughFilter === b}
              style={{ fontSize: 'var(--fs-xs)', padding: 'var(--space-1) var(--space-3)' }}
              id={`borough-filter-${b.toLowerCase().replace(/\s/g, '-')}`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="map-page__container">
        <MapContainer
          center={[40.7328, -73.8700]}
          zoom={11}
          style={{ width: '100%', height: '100%', minHeight: '500px' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitBounds locations={filteredNeighborhoods} />

          {/* ── DIABETES LAYER ── */}
          {activeLayer === 'diabetes' && filteredNeighborhoods.map((n) => {
            const color = getDiabetesColor(n.diabetesPrevalence);
            const radius = Math.max(10, (n.diabetesPrevalence / 23) * 24);
            return (
              <CircleMarker
                key={n.id}
                center={[n.lat, n.lng]}
                radius={radius}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.45, weight: 2 }}
                eventHandlers={{ click: () => setSelected(n) }}
              >
                <Popup>
                  <div style={{ fontFamily: 'var(--font-body)', minWidth: 200 }}>
                    <strong style={{ fontSize: 14 }}>{n.name}</strong>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{n.borough} • {n.uhf}</div>
                    <div style={{ marginTop: 8, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('map.popup_diabetes')}</span>
                      <strong style={{ color }}>{n.diabetesPrevalence}%</strong>
                    </div>
                    <div style={{ marginTop: 4, height: 6, borderRadius: 3, background: '#333', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(n.diabetesPrevalence / 25) * 100}%`, background: color, borderRadius: 3 }} />
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: '#999' }}>
                      {t('map.popup_aapi_pct')}: {n.aapiPopulation}% ({n.aapiCount?.toLocaleString()}) • {t('map.popup_resources')}: {n.resources}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* ── AAPI POPULATION LAYER ── */}
          {activeLayer === 'aapi' && filteredNeighborhoods.map((n) => {
            const color = getAAPIColor(n.aapiPopulation);
            // Size by actual count, normalized
            const maxCount = Math.max(...filteredNeighborhoods.map((x) => x.aapiCount || 0));
            const radius = Math.max(8, ((n.aapiCount || 0) / maxCount) * 28);
            return (
              <CircleMarker
                key={n.id}
                center={[n.lat, n.lng]}
                radius={radius}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.5, weight: 2 }}
                eventHandlers={{ click: () => setSelected(n) }}
              >
                <Popup>
                  <div style={{ fontFamily: 'var(--font-body)', minWidth: 210 }}>
                    <strong style={{ fontSize: 14 }}>{n.name}</strong>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{n.borough}</div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>{t('map.popup_aapi_pct')}</span>
                        <strong style={{ color }}>{n.aapiPopulation}%</strong>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                        {n.aapiCount?.toLocaleString()} {t('map.residents')}
                      </div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: '#aaa' }}>
                      {t('map.communities')}: {n.primaryCommunities?.join(', ')}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
                      {t('map.popup_diabetes')}: {n.diabetesPrevalence}% • {t('map.popup_resources')}: {n.resources}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* ── HEALTH RESOURCES LAYER ── */}
          {activeLayer === 'resources' && (
            <>
              {/* Show neighborhood outlines as context */}
              {filteredNeighborhoods.map((n) => (
                <CircleMarker
                  key={`ctx-${n.id}`}
                  center={[n.lat, n.lng]}
                  radius={n.resources === 0 ? 14 : 10}
                  pathOptions={{
                    color: n.resources === 0 ? '#ef4444' : 'rgba(255,255,255,0.15)',
                    fillColor: n.resources === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)',
                    fillOpacity: 1,
                    weight: n.resources === 0 ? 2 : 1,
                    dashArray: n.resources === 0 ? '4 4' : undefined,
                  }}
                  eventHandlers={{ click: () => setSelected(n) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'var(--font-body)', minWidth: 180 }}>
                      <strong style={{ fontSize: 14 }}>{n.name}</strong>
                      <div style={{ fontSize: 11, color: '#888' }}>{n.borough}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: n.resources === 0 ? '#ef4444' : '#22c55e' }}>
                        {n.resources === 0 ? `⚠ ${t('map.gap_area')}` : `${n.resources} ${t('map.popup_resources')}`}
                      </div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                        {t('map.popup_aapi_pct')}: {n.aapiPopulation}% ({n.aapiCount?.toLocaleString()})
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {/* Individual resource pins */}
              {filteredResources.map((r) => (
                <Marker
                  key={r.id}
                  position={[r.lat, r.lng]}
                  icon={createResourceIcon(r.type)}
                  eventHandlers={{ click: () => setSelected({ ...r, _type: 'resource' }) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'var(--font-body)', minWidth: 200 }}>
                      <strong style={{ fontSize: 13 }}>{r.name}</strong>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{r.address}</div>
                      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {r.services.slice(0, 3).map((s) => (
                          <span key={s} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'rgba(20,184,166,0.15)', color: '#14b8a6' }}>{s}</span>
                        ))}
                        {r.services.length > 3 && (
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>+{r.services.length - 3}</span>
                        )}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 10, color: '#aaa' }}>
                        🗣️ {r.languages.join(', ')}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
          )}
        </MapContainer>

        {/* Sidebar */}
        <Sidebar
          selected={selected}
          activeLayer={activeLayer}
          onClose={() => setSelected(null)}
          t={t}
        />

        {/* Legend / Top-5 ranking (bottom-left overlay) */}
        <div style={{
          position: 'absolute', bottom: 'var(--space-4)', left: 'var(--space-4)',
          zIndex: 800, background: 'rgba(15,14,23,0.92)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)', minWidth: 220, maxWidth: 280,
          fontSize: 'var(--fs-xs)',
        }}>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-3)', fontSize: 'var(--fs-sm)' }}>
            {activeLayer === 'diabetes' && `📊 ${t('map.top_areas')} — ${t('map.layer_diabetes')}`}
            {activeLayer === 'aapi' && `👥 ${t('map.top_areas')} — ${t('map.layer_aapi')}`}
            {activeLayer === 'resources' && `📍 ${t('map.top_areas')} — ${t('map.layer_resources')}`}
          </div>

          {sorted.map((n, i) => {
            const val = activeLayer === 'diabetes'
              ? `${n.diabetesPrevalence}%`
              : activeLayer === 'aapi'
              ? `${n.aapiPopulation}% (${n.aapiCount?.toLocaleString()})`
              : `${n.resources} orgs`;
            const color = activeLayer === 'diabetes'
              ? getDiabetesColor(n.diabetesPrevalence)
              : activeLayer === 'aapi'
              ? getAAPIColor(n.aapiPopulation)
              : n.resources === 0 ? '#ef4444' : '#22c55e';

            return (
              <button type="button"
                key={n.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '4px 0', borderBottom: i < sorted.length - 1 ? '1px solid var(--color-border)' : 'none',
                  cursor: 'pointer', width: '100%', textAlign: 'left', background: 'transparent', color: 'inherit',
                }}
                onClick={() => setSelected(n)}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-text-muted)', marginRight: 4 }}>{i + 1}.</span>
                  {n.name}
                </span>
                <span style={{ fontWeight: 600, color, whiteSpace: 'nowrap', marginLeft: 8 }}>{val}</span>
              </button>
            );
          })}

          {/* Color legend for diabetes mode */}
          {activeLayer === 'diabetes' && (
            <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                {['#16a34a', '#65a30d', '#d97706', '#ea580c', '#dc2626'].map((c) => (
                  <div key={c} style={{ flex: 1, height: 6, borderRadius: 2, background: c }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-muted)' }}>
                <span>&lt;9%</span>
                <span>9-11%</span>
                <span>11-14%</span>
                <span>14-17%</span>
                <span>&gt;17%</span>
              </div>
            </div>
          )}

          {/* Resource type legend */}
          {activeLayer === 'resources' && (
            <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Object.entries(RESOURCE_ICONS).map(([type, config]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{config.emoji}</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{config.label}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px dashed #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>!</span>
                <span style={{ color: '#ef4444' }}>{t('map.gap_area')} (0 {t('map.popup_resources')})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HealthMap;
