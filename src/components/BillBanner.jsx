import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';

function BillBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('aapi-bill-banner-dismissed');
      if (dismissed) {
        const dismissedAt = new Date(dismissed).getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedAt < sevenDays) {
          return; // Still within cooldown
        }
      }
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem('aapi-bill-banner-dismissed', new Date().toISOString());
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <div className="bill-banner" role="banner" id="bill-banner">
      <div className="bill-banner__inner">
        <span className="bill-banner__text">
          {t('bill.banner_text')}
        </span>
        <div className="bill-banner__actions">
          <Link to="/bill-s634b" className="bill-banner__cta" id="bill-banner-cta">
            {t('bill.banner_cta')} →
          </Link>
          <button
            className="bill-banner__dismiss"
            onClick={handleDismiss}
            aria-label={t('bill.banner_dismiss')}
            id="bill-banner-dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillBanner;
