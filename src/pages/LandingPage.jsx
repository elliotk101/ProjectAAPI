import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import { BILL_STATUS, SITE } from '../config/site';

function LandingPage() {
  const { t } = useI18n();
  useEffect(() => { document.title = `${SITE.name} — Know Your Risk. Screen Earlier.`; }, []);

  const pathways = [
    { number: '01', title: t('hero.cta_screen'), body: 'Answer a few private questions and get a clear screening-conversation checklist.', to: '/screener', label: 'Start health check' },
    { number: '02', title: t('hero.cta_resources'), body: 'Browse 30 featured AAPI-serving organizations and verify services before visiting.', to: '/resources', label: 'Find community help' },
    { number: '03', title: 'Know your rights', body: 'Understand New York language assistance rights and the latest S634B status.', to: '/bill-s634b', label: 'Read the update' },
  ];

  return (
    <div className="home-page">
      <section className="home-hero">
        <img className="home-hero__image" src="/aapicheck-community-hero.jpg" alt="A multigenerational Asian American family smiling together in a New York park" fetchPriority="high" />
        <div className="home-hero__shade" aria-hidden="true" />
        <div className="home-hero__content">
          <p className="eyebrow">{t('hero.badge')}</p>
          <h1>{t('hero.title_1')}<br /><span>{t('hero.title_2')}</span>{t('hero.title_3') && <> {t('hero.title_3')}</>}</h1>
          <p className="home-hero__lead">{t('hero.subtitle')}</p>
          <div className="button-row">
            <Link to="/screener" className="btn btn--primary btn--lg">{t('hero.cta_screen')}</Link>
            <Link to="/resources" className="btn btn--secondary btn--lg">{t('hero.cta_resources')}</Link>
          </div>
          <p className="privacy-note"><span aria-hidden="true">●</span> Private by design: answers stay in this browser and are not saved.</p>
        </div>
      </section>

      <section className="home-intro" aria-labelledby="why-aapicheck">
        <div><p className="eyebrow">Small check. Big impact.</p><h2 id="why-aapicheck">Your health deserves clear information.</h2></div>
        <p>Asian American adults may be considered for diabetes screening at a lower BMI threshold. AAPICHECK helps you understand that guidance without assigning a diagnosis or pretending to predict your future.</p>
      </section>

      <section className="pathway-grid" aria-label="Choose what you need">
        {pathways.map((item) => (
          <article className="pathway-card" key={item.number}>
            <span className="pathway-card__number">{item.number}</span><h2>{item.title}</h2><p>{item.body}</p>
            <Link to={item.to}>{item.label} <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </section>

      <section className="threshold-callout">
        <div className="threshold-callout__number" aria-label="BMI 23">23</div>
        <div><p className="eyebrow">Why 23 matters</p><h2>A screening threshold—not a diagnosis.</h2>
          <p>BMI 23 is a recognized point for considering diabetes screening in Asian American adults. BMI is only one factor; talk with a qualified healthcare professional about what is right for you.</p>
          <Link to="/screener" className="text-link">Check the guidance <span aria-hidden="true">→</span></Link></div>
      </section>

      <section className="bill-home-card">
        <div><p className="eyebrow">Legislative update · verified {BILL_STATUS.lastVerified}</p><h2>S634B is awaiting the Governor’s action.</h2>
          <p>The bill passed the New York Senate and Assembly. It is not law yet. If signed, coverage details will follow the enacted text and the terms of each eligible policy.</p></div>
        <div className="button-row"><Link to="/bill-s634b" className="btn btn--primary">Understand the bill</Link>
          <a className="btn btn--secondary" href={BILL_STATUS.officialUrl} target="_blank" rel="noreferrer">Check official status</a></div>
      </section>
    </div>
  );
}

export default LandingPage;
