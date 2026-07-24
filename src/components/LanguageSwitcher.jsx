import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n/i18nProvider';

function LanguageSwitcher() {
  const { lang, setLang, languages } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = languages.find((l) => l.code === lang) || languages[0];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        className="lang-switcher__trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
        id="lang-switcher-btn"
      >
        🌐 {current.native}
      </button>

      {open && (
        <div className="lang-switcher__dropdown" role="listbox" aria-labelledby="lang-switcher-btn">
          {languages.map((l) => (
            <button
              key={l.code}
              className={`lang-switcher__option ${l.code === lang ? 'lang-switcher__option--active' : ''}`}
              role="option"
              aria-selected={l.code === lang}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
            >
              <span>{l.native}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-xs)' }}>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
