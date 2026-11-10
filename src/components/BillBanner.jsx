import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import { getBillCopy, useBillStatus } from '../utils/useBillStatus';

function BillBanner() {
  const { t, lang } = useI18n();
  const billStatus = useBillStatus();
  const { bannerText } = getBillCopy(billStatus, t, lang);
  return (
    <aside className="bill-banner" aria-label={t('bill.status_badge')}>
      <div className="bill-banner__inner">
        <p>{bannerText}</p>
        <div className="bill-banner__actions">
          <span>{t('bill.verified')} {billStatus.lastVerified}</span>
          <Link to="/bill-s634b">{t('bill.banner_cta')}</Link>
          <a href={billStatus.officialUrl} target="_blank" rel="noreferrer">{t('bill.official_record')} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </aside>
  );
}

export default BillBanner;
