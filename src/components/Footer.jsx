import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import { BILL_STATUS, SITE } from '../config/site';
import Logo from './Logo';

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand"><Logo /><p>{t('footer.brand_desc')}</p><strong>{SITE.domain}</strong></div>
        <div className="footer__col">
          <h2 className="footer__col-title">{t('footer.col_tools')}</h2>
          <Link to="/screener">{t('nav.screener')}</Link><Link to="/resources">{t('nav.resources')}</Link>
          <Link to="/map">{t('nav.map')}</Link><Link to="/compliance">{t('nav.compliance')}</Link>
        </div>
        <div className="footer__col">
          <h2 className="footer__col-title">Verified sources</h2>
          <a href={BILL_STATUS.officialUrl} target="_blank" rel="noreferrer">NY Senate: S634B</a>
          <a href="https://www.nysenate.gov/legislation/bills/2025/S6288/amendment/B" target="_blank" rel="noreferrer">NY Senate: S6288B</a>
          <a href="https://data.cityofnewyork.us/" target="_blank" rel="noreferrer">NYC Open Data</a>
        </div>
        <div className="footer__col">
          <h2 className="footer__col-title">{t('footer.col_legal')}</h2>
          <Link to="/privacy">{t('footer.privacy')}</Link><Link to="/terms">{t('footer.terms')}</Link>
          <Link to="/accessibility">{t('footer.accessibility')}</Link>
        </div>
      </div>
      <div className="footer__bottom"><span>© {new Date().getFullYear()} {SITE.name}. Community health information, not medical advice.</span></div>
    </footer>
  );
}

export default Footer;
