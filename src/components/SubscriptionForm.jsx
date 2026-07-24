import { useState } from 'react';
import { useI18n } from '../i18n/i18nProvider';

function SubscriptionForm({ compact = false }) {
  const { t, lang, languages } = useI18n();
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [prefLang, setPrefLang] = useState(lang);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Simple email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('bill.subscribe_error_email'));
      return;
    }

    // Store in localStorage (mock backend)
    try {
      const existing = JSON.parse(localStorage.getItem('aapi-subscriptions') || '[]');
      existing.push({
        email,
        zip: zip || null,
        language: prefLang,
        subscribedAt: new Date().toISOString(),
      });
      localStorage.setItem('aapi-subscriptions', JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="subscribe-success" id="subscribe-success">
        <div className="subscribe-success__icon">✅</div>
        <p>{t('bill.subscribe_success')}</p>
      </div>
    );
  }

  return (
    <form className={`subscribe-form ${compact ? 'subscribe-form--compact' : ''}`} onSubmit={handleSubmit} id="subscribe-form">
      <div className="subscribe-form__field">
        <label htmlFor="subscribe-email">{t('bill.subscribe_email')}</label>
        <input
          type="email"
          className="input-field"
          id="subscribe-email"
          placeholder={t('bill.subscribe_email_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label={t('bill.subscribe_email')}
        />
      </div>

      {!compact && (
        <>
          <div className="subscribe-form__field">
            <label htmlFor="subscribe-zip">{t('bill.subscribe_zip')}</label>
            <input
              type="text"
              className="input-field"
              id="subscribe-zip"
              placeholder={t('bill.subscribe_zip_placeholder')}
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              aria-label={t('bill.subscribe_zip')}
            />
          </div>

          <div className="subscribe-form__field">
            <label htmlFor="subscribe-language">{t('bill.subscribe_language')}</label>
            <select
              className="input-field"
              id="subscribe-language"
              value={prefLang}
              onChange={(e) => setPrefLang(e.target.value)}
              aria-label={t('bill.subscribe_language')}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {error && <div className="subscribe-form__error" role="alert">{error}</div>}

      <button type="submit" className="btn btn--primary" id="btn-subscribe">
        {t('bill.subscribe_button')}
      </button>
    </form>
  );
}

export default SubscriptionForm;
