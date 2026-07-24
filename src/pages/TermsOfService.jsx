import { useEffect } from 'react';
import { useI18n } from '../i18n/i18nProvider';

function TermsOfService() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t('terms.title')} — AAPI Health Equity`;
  }, [t]);

  const sections = [
    { titleKey: 'terms.section_medical_title', textKey: 'terms.section_medical_text' },
    { titleKey: 'terms.section_opendata_title', textKey: 'terms.section_opendata_text' },
    { titleKey: 'terms.section_accuracy_title', textKey: 'terms.section_accuracy_text' },
    { titleKey: 'terms.section_use_title', textKey: 'terms.section_use_text' },
    { titleKey: 'terms.section_ip_title', textKey: 'terms.section_ip_text' },
    { titleKey: 'terms.section_liability_title', textKey: 'terms.section_liability_text' },
    { titleKey: 'terms.section_changes_title', textKey: 'terms.section_changes_text' },
  ];

  return (
    <div className="legal-page page-enter" id="terms-page">
      <div className="section-heading">
        <h1 style={{ fontSize: 'var(--fs-3xl)' }}>📄 {t('terms.title')}</h1>
        <p>{t('terms.last_updated')}</p>
      </div>

      <div className="legal-page__content glass-card">
        <p className="legal-page__intro">{t('terms.intro')}</p>

        {sections.map(({ titleKey, textKey }) => (
          <section key={titleKey} className="legal-page__section">
            <h2>{t(titleKey)}</h2>
            <p>{t(textKey)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export default TermsOfService;
