import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';

function Footer() {
  const { t } = useI18n();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="navbar__logo" style={{ marginBottom: '0.5rem' }}>
            <div className="navbar__logo-icon">A</div>
            <span>AAPI Health</span>
          </Link>
          <p>{t('footer.brand_desc')}</p>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">{t('footer.col_tools')}</h4>
          <Link to="/screener">{t('nav.screener')}</Link>
          <Link to="/map">{t('nav.map')}</Link>
          <Link to="/resources">{t('nav.resources')}</Link>
          <Link to="/compliance">{t('nav.compliance')}</Link>
          <Link to="/tracker">{t('nav.tracker')}</Link>
          <Link to="/bill-s634b">{t('nav.bill')}</Link>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">{t('footer.col_resources')}</h4>
          <a href="https://data.cityofnewyork.us/" target="_blank" rel="noopener noreferrer">NYC Open Data</a>
          <a href="https://www.sacssny.org/" target="_blank" rel="noopener noreferrer">SACSS</a>
          <a href="https://www.aafederation.org/" target="_blank" rel="noopener noreferrer">Asian American Federation</a>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">{t('footer.col_legal')}</h4>
          <Link to="/privacy">{t('footer.privacy')}</Link>
          <Link to="/terms">{t('footer.terms')}</Link>
          <Link to="/accessibility">{t('footer.accessibility')}</Link>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} {t('footer.copyright')}</span>
        <span>Built with ❤️ for health equity</span>
      </div>
    </footer>
  );
}

export default Footer;
