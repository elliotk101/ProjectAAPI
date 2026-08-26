import { useEffect } from 'react';
import { useI18n } from '../i18n/i18nProvider';

function Accessibility() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t('a11y.title')} — AAPICHECK`;
  }, [t]);

  const features = [
    'a11y.feature_keyboard',
    'a11y.feature_screen_reader',
    'a11y.feature_contrast',
    'a11y.feature_language',
    'a11y.feature_responsive',
    'a11y.feature_focus',
  ];

  return (
    <div className="legal-page page-enter" id="accessibility-page">
      <div className="section-heading">
        <h1 style={{ fontSize: 'var(--fs-3xl)' }}>♿ {t('a11y.title')}</h1>
        <p>{t('a11y.last_updated')}</p>
      </div>

      <div className="legal-page__content glass-card">
        <p className="legal-page__intro">{t('a11y.intro')}</p>

        <section className="legal-page__section">
          <h2>{t('a11y.section_standards_title')}</h2>
          <p>{t('a11y.section_standards_text')}</p>
        </section>

        <section className="legal-page__section">
          <h2>{t('a11y.section_features_title')}</h2>
          <ul className="legal-page__feature-list">
            {features.map((key) => (
              <li key={key}>
                <span className="legal-page__feature-check">✓</span>
                {t(key)}
              </li>
            ))}
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>{t('a11y.section_limitations_title')}</h2>
          <p>{t('a11y.section_limitations_text')}</p>
        </section>

        <section className="legal-page__section">
          <h2>{t('a11y.section_feedback_title')}</h2>
          <p>{t('a11y.section_feedback_text')}</p>
        </section>
      </div>
    </div>
  );
}

export default Accessibility;
