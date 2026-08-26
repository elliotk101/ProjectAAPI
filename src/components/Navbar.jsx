import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';

function Navbar() {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [largeText, setLargeText] = useState(() => {
    try { return localStorage.getItem('aapicheck-text-size') === 'large'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.dataset.textSize = largeText ? 'large' : 'normal';
    try { localStorage.setItem('aapicheck-text-size', largeText ? 'large' : 'normal'); } catch { /* no-op */ }
  }, [largeText]);

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const links = [
    ['/', t('nav.home')],
    ['/screener', t('nav.screener')],
    ['/resources', t('nav.resources')],
    ['/map', t('nav.map')],
    ['/bill-s634b', t('nav.bill')],
  ];

  return (
    <nav className="navbar" aria-label="Primary navigation">
      <div className="navbar__inner">
        <Logo />
        <div id="mobile-navigation" className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </div>
        <div className="navbar__right">
          <button type="button" className="text-size-toggle" aria-pressed={largeText}
            onClick={() => setLargeText((value) => !value)} title="Increase text size">
            <span aria-hidden="true">A+</span><span className="sr-only">Toggle larger text</span>
          </button>
          <LanguageSwitcher />
          <button type="button" className="navbar__mobile-toggle" onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label="Toggle navigation menu">
            <span aria-hidden="true">{mobileOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
