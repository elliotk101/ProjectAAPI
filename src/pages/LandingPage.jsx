import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import { BILL_STATUS, SITE } from '../config/site';

function LandingPage() {
  const { t } = useI18n();
  useEffect(() => { document.title = `${SITE.name} — ${t('hero.title_1')} ${t('hero.title_2')}`; }, [t]);

  const pathways = [
    { number: '01', title: t('hero.cta_screen'), body: t('pillars.screening_desc'), to: '/screener', label: t('hero.cta_screen') },
    { number: '02', title: t('hero.cta_resources'), body: t('pillars.resources_desc'), to: '/resources', label: t('hero.cta_resources') },
    { number: '03', title: t('nav.bill'), body: t('bill.banner_text'), to: '/bill-s634b', label: t('bill.banner_cta') },
  ];

  return (
    <div className="home-page">
      <section className="home-hero">
        <img className="home-hero__image" src="/aapicheck-community-hero.jpg" alt="" fetchPriority="high" />
        <div className="home-hero__shade" aria-hidden="true" />
        <div className="home-hero__content">
          <p className="eyebrow">{t('hero.badge')}</p>
          <h1>{t('hero.title_1')}<br /><span>{t('hero.title_2')}</span>{t('hero.title_3') && <> {t('hero.title_3')}</>}</h1>
          <p className="home-hero__lead">{t('hero.subtitle')}</p>
          <div className="button-row">
            <Link to="/screener" className="btn btn--primary btn--lg">{t('hero.cta_screen')}</Link>
            <Link to="/resources" className="btn btn--secondary btn--lg">{t('hero.cta_resources')}</Link>
          </div>
          <p className="privacy-note">{t('privacy.section_collection_text')}</p>
        </div>
      </section>

      <section className="home-intro" aria-labelledby="why-aapicheck">
        <div><p className="eyebrow">{t('pillars.badge')}</p><h2 id="why-aapicheck">{t('pillars.title')}</h2></div>
        <p>{t('pillars.subtitle')}</p>
      </section>

      <section className="pathway-grid" aria-label={t('pillars.badge')}>
        {pathways.map((item) => (
          <article className="pathway-card" key={item.number}>
            <span className="pathway-card__number">{item.number}</span><h2>{item.title}</h2><p>{item.body}</p>
            <Link to={item.to}>{item.label} <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </section>

      <section className="threshold-callout">
        <div className="threshold-callout__number" aria-label="BMI 23">23</div>
        <div><p className="eyebrow">{t('landing.cta_title_2')}</p><h2>{t('landing.cta_title_1')} {t('landing.cta_title_2')}{t('landing.cta_title_3')}</h2>
          <p>{t('landing.cta_text')}</p>
          <Link to="/screener" className="text-link">{t('landing.cta_button')}</Link></div>
      </section>

      <section className="bill-home-card">
        <div><p className="eyebrow">{t('bill.status_badge')} · {t('bill.verified')} {BILL_STATUS.lastVerified}</p><h2>{t('bill.timeline_governor')}</h2>
          <p>{t('bill.banner_text')}</p></div>
        <div className="button-row"><Link to="/bill-s634b" className="btn btn--primary">{t('bill.banner_cta')}</Link>
          <a className="btn btn--secondary" href={BILL_STATUS.officialUrl} target="_blank" rel="noreferrer">{t('bill.official_record')}</a></div>
      </section>
    </div>
  );
}

export default LandingPage;
