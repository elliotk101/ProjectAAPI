import { Link } from 'react-router-dom';
import { BILL_STATUS } from '../config/site';
import { useI18n } from '../i18n/i18nProvider';

function BillBanner() {
  const { t } = useI18n();
  return (
    <aside className="bill-banner" aria-label={t('bill.status_badge')}>
      <div className="bill-banner__inner">
        <p>{t('bill.banner_text')}</p>
        <div className="bill-banner__actions">
          <span>{t('bill.verified')} {BILL_STATUS.lastVerified}</span>
          <Link to="/bill-s634b">{t('bill.banner_cta')}</Link>
          <a href={BILL_STATUS.officialUrl} target="_blank" rel="noreferrer">{t('bill.official_record')} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </aside>
  );
}

export default BillBanner;
