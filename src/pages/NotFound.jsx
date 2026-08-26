import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';

function NotFound() {
  const { t } = useI18n();
  return (
    <section className="simple-page not-found">
      <p className="eyebrow">404</p>
      <h1>{t('not_found.title')}</h1>
      <p>{t('not_found.text')}</p>
      <div className="button-row">
        <Link className="btn btn--primary" to="/">{t('nav.home')}</Link>
        <Link className="btn btn--secondary" to="/screener">{t('hero.cta_screen')}</Link>
      </div>
    </section>
  );
}

export default NotFound;
