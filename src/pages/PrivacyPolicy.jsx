import { useEffect } from 'react';
import { useI18n } from '../i18n/i18nProvider';

function PrivacyPolicy() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t('privacy.title')} — AAPI Health Equity`;
  }, [t]);

  const sections = [
    { titleKey: 'privacy.section_collection_title', textKey: 'privacy.section_collection_text' },
    { titleKey: 'privacy.section_storage_title', textKey: 'privacy.section_storage_text' },
    { titleKey: 'privacy.section_analytics_title', textKey: 'privacy.section_analytics_text' },
    { titleKey: 'privacy.section_health_title', textKey: 'privacy.section_health_text' },
    { titleKey: 'privacy.section_third_party_title', textKey: 'privacy.section_third_party_text' },
    { titleKey: 'privacy.section_rights_title', textKey: 'privacy.section_rights_text' },
    { titleKey: 'privacy.section_contact_title', textKey: 'privacy.section_contact_text' },
  ];

  return (
    <div className="legal-page page-enter" id="privacy-page">
      <div className="section-heading">
        <h1 style={{ fontSize: 'var(--fs-3xl)' }}>🔒 {t('privacy.title')}</h1>
        <p>{t('privacy.last_updated')}</p>
      </div>

      <div className="legal-page__content glass-card">
        <p className="legal-page__intro">{t('privacy.intro')}</p>

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

export default PrivacyPolicy;
