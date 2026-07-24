import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import { useEffect, useRef } from 'react';

function LandingPage() {
  const { t } = useI18n();
  const revealRefs = useRef([]);

  useEffect(() => {
    document.title = 'AAPI Health Equity — Digital Diabetes Prevention';
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="page-enter">
      {/* === HERO === */}
      <section className="hero" id="hero">
        <div className="hero__content">
          <span className="hero__badge">✦ {t('hero.badge')}</span>
          <h1>
            {t('hero.title_1')}{' '}
            <span className="text-gradient">{t('hero.title_2')}</span>{' '}
            {t('hero.title_3')}
          </h1>
          <p className="hero__subtitle">{t('hero.subtitle')}</p>
          <div className="hero__actions">
            <Link to="/screener" className="btn btn--primary btn--lg" id="cta-screener">
              📊 {t('hero.cta_screen')}
            </Link>
            <Link to="/resources" className="btn btn--secondary btn--lg" id="cta-resources">
              📁 {t('hero.cta_resources')}
            </Link>
            <Link to="/map" className="btn btn--secondary btn--lg" id="cta-map">
              🗺️ {t('hero.cta_map')}
            </Link>
            <Link to="/tracker" className="btn btn--secondary btn--lg" id="cta-tracker">
              ✅ {t('nav.tracker')}
            </Link>
          </div>
        </div>
      </section>

      {/* === STATS ROW === */}
      <section className="stats-row fade-stagger" ref={addRevealRef}>
        <div className="glass-card stat-card" id="stat-population">
          <div className="stat-card__icon">👥</div>
          <div className="stat-card__value">11%+</div>
          <div className="stat-card__label">{t('stats.population')}</div>
        </div>
        <div className="glass-card stat-card" id="stat-lep">
          <div className="stat-card__icon">🗣️</div>
          <div className="stat-card__value">43%</div>
          <div className="stat-card__label">{t('stats.lep')}</div>
        </div>
        <div className="glass-card stat-card" id="stat-budget">
          <div className="stat-card__icon">💰</div>
          <div className="stat-card__value">$54.35M</div>
          <div className="stat-card__label">{t('stats.budget')}</div>
        </div>
        <div className="glass-card stat-card" id="stat-nonprofits">
          <div className="stat-card__icon">🏢</div>
          <div className="stat-card__value">150+</div>
          <div className="stat-card__label">{t('stats.nonprofits')}</div>
        </div>
      </section>

      {/* === THREE PILLARS === */}
      <section className="pillars reveal" ref={addRevealRef}>
        <div className="section-heading">
          <span className="section-heading__badge">✦ {t('pillars.badge')}</span>
          <h2>{t('pillars.title')}</h2>
          <p>{t('pillars.subtitle')}</p>
        </div>

        <div className="pillars__grid fade-stagger">
          <div className="glass-card pillar-card" id="pillar-screening">
            <span className="pillar-card__number">01</span>
            <div className="pillar-card__icon">📊</div>
            <h3>{t('pillars.screening_title')}</h3>
            <p>{t('pillars.screening_desc')}</p>
          </div>

          <div className="glass-card pillar-card" id="pillar-data">
            <span className="pillar-card__number">02</span>
            <div className="pillar-card__icon">🗺️</div>
            <h3>{t('pillars.data_title')}</h3>
            <p>{t('pillars.data_desc')}</p>
          </div>

          <div className="glass-card pillar-card" id="pillar-resources">
            <span className="pillar-card__number">03</span>
            <div className="pillar-card__icon">🤝</div>
            <h3>{t('pillars.resources_title')}</h3>
            <p>{t('pillars.resources_desc')}</p>
          </div>
        </div>
      </section>

      {/* === CTA BANNER === */}
      <section className="reveal" ref={addRevealRef} style={{ padding: 'var(--space-16) var(--space-6)' }}>
        <div
          className="glass-card"
          style={{
            maxWidth: 'var(--max-width)',
            margin: '0 auto',
            textAlign: 'center',
            padding: 'var(--space-12)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(20, 184, 166, 0.08))',
          }}
        >
          <h2 style={{ fontSize: 'var(--fs-3xl)', marginBottom: 'var(--space-4)' }}>
            {t('landing.cta_title_1')}<span className="text-gradient" style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('landing.cta_title_2')}</span>{t('landing.cta_title_3')}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto var(--space-8)' }}>
            {t('landing.cta_text')}
          </p>
          <Link to="/screener" className="btn btn--primary btn--lg" id="cta-screen-banner">
            {t('landing.cta_button')}
          </Link>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
