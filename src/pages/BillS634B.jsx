import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BILL_STATUS, SITE } from '../config/site';
import { useI18n } from '../i18n/i18nProvider';

function BillS634B() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  useEffect(() => { document.title = `${t('bill.page_title')} — ${SITE.name}`; }, [t]);
  async function share() {
    const payload = { title: t('bill.page_title'), text: t('bill.banner_text'), url: window.location.href };
    if (navigator.share) { try { await navigator.share(payload); return; } catch (error) { if (error.name === 'AbortError') return; } }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true); window.setTimeout(() => setCopied(false), 2000);
  }
  const facts = [['01','bill.timeline_governor','bill.banner_text'],['02','bill.benefit_insurance_title','bill.benefit_insurance_desc'],['03','bill.benefit_screening_title','bill.benefit_screening_desc'],['04','bill.benefit_care_title','bill.benefit_care_desc']];
  const timeline = [['bill.timeline_introduced','bill.timeline_introduced_desc'],['bill.timeline_senate','bill.timeline_senate_desc'],['bill.timeline_assembly','bill.timeline_assembly_desc'],['bill.timeline_governor','bill.timeline_governor_desc']];
  return <article className="bill-page">
    <header className="bill-page__hero"><div className="bill-page__hero-content"><p className="eyebrow">{t('bill.status_badge')}</p><h1>{t('bill.page_title')}</h1><p className="bill-page__hero-subtitle">{t('bill.banner_text')}</p><div className="status-panel"><span className="status-dot" aria-hidden="true" /><div><strong>{t('bill.timeline_governor')}</strong><span>{t('bill.verified')} {BILL_STATUS.lastVerified}</span></div></div><div className="button-row"><a className="btn btn--primary" href={BILL_STATUS.officialUrl} target="_blank" rel="noreferrer">{t('bill.official_record')}</a><button className="btn btn--secondary" onClick={share}>{copied ? t('bill.share_copied') : t('bill.share_title')}</button></div></div></header>
    <section className="bill-page__section bill-summary"><div><p className="eyebrow">{t('bill.status_badge')}</p><h2>{t('bill.benefits_title')}</h2></div><div className="prose"><p>{t('bill.page_subtitle')}</p><p>{t('bill.benefit_insurance_desc')}</p></div></section>
    <section className="bill-page__section"><p className="eyebrow">{t('bill.benefits_title')}</p><h2>{t('bill.prepare_title')}</h2><div className="fact-grid">{facts.map(([number,title,desc]) => <article key={number}><span>{number}</span><h3>{t(title)}</h3><p>{t(desc)}</p></article>)}</div></section>
    <section className="bill-page__section timeline-simple"><p className="eyebrow">{t('bill.status_badge')}</p><h2>{t('bill.timeline_title')}</h2><ol>{timeline.map(([title,desc],index) => <li key={title} className={index === 3 ? 'is-current' : 'is-done'}><strong>{t(title)}</strong><span>{t(desc)}</span></li>)}</ol></section>
    <section className="source-box"><h2>{t('bill.official_record')}</h2><p>{t('bill.banner_text')}</p><a href={BILL_STATUS.officialUrl} target="_blank" rel="noreferrer">{t('bill.official_record')} ↗</a></section>
    <section className="bill-next"><h2>{t('bill.prepare_title')}</h2><p>{t('bill.prepare_step2_desc')}</p><div className="button-row"><Link className="btn btn--primary" to="/screener">{t('hero.cta_screen')}</Link><Link className="btn btn--secondary" to="/resources">{t('hero.cta_resources')}</Link></div></section>
  </article>;
}
export default BillS634B;
