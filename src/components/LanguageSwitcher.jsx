import { useI18n } from '../i18n/i18nProvider';

function LanguageSwitcher() {
  const { lang, setLang, languages, t } = useI18n();
  return (
    <label className="lang-switcher">
      <span className="sr-only">{t('nav.select_language')}</span>
      <span aria-hidden="true">{t('nav.language')}</span>
      <select value={lang} onChange={(event) => setLang(event.target.value)} aria-label={t('nav.select_language')}>
        {languages.map((language) => (
          <option key={language.code} value={language.code}>{language.native}</option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSwitcher;
