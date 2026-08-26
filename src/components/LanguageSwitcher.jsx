import { useI18n } from '../i18n/i18nProvider';

function LanguageSwitcher() {
  const { lang, setLang, languages } = useI18n();
  return (
    <label className="lang-switcher">
      <span className="sr-only">Select language</span>
      <span aria-hidden="true">Language</span>
      <select value={lang} onChange={(event) => setLang(event.target.value)} aria-label="Select language">
        {languages.map((language) => (
          <option key={language.code} value={language.code}>{language.native}</option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSwitcher;
