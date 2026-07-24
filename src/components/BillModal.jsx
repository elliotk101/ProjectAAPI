import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';

function BillModal() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('aapi-bill-modal-dismissed');
      if (!dismissed) {
        // Small delay so page loads first
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Show modal on error
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (dontShow) {
      try {
        localStorage.setItem('aapi-bill-modal-dismissed', 'true');
      } catch {
        // ignore
      }
    }
  };

  if (!visible) return null;

  return (
    <div className="bill-modal-overlay" onClick={handleClose} id="bill-modal-overlay">
      <div className="bill-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="bill-modal-title" id="bill-modal">
        <button className="bill-modal__close" onClick={handleClose} aria-label={t('bill.modal_close')} id="bill-modal-close">
          ✕
        </button>

        <div className="bill-modal__badge">📋 {t('bill.status_badge')}</div>

        <h2 id="bill-modal-title" className="bill-modal__title">{t('bill.modal_title')}</h2>

        <p className="bill-modal__text">{t('bill.modal_text')}</p>

        <div className="bill-modal__actions">
          <Link to="/bill-s634b" className="btn btn--primary" onClick={handleClose} id="bill-modal-learn-more">
            {t('bill.modal_learn_more')}
          </Link>
        </div>

        <label className="bill-modal__dont-show">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            id="bill-modal-dont-show"
          />
          <span>{t('bill.modal_dismiss')}</span>
        </label>
      </div>
    </div>
  );
}

export default BillModal;
