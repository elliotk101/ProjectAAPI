import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import LanguageSwitcher from './LanguageSwitcher';

function Navbar() {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/screener', label: t('nav.screener') },
    { to: '/map', label: t('nav.map') },
    { to: '/resources', label: t('nav.resources') },
    { to: '/compliance', label: t('nav.compliance') },
    { to: '/tracker', label: t('nav.tracker') },
    { to: '/bill-s634b', label: t('nav.bill'), highlight: true },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="AAPI Health Equity Home">
          <div className="navbar__logo-icon">A</div>
          <span>AAPI Health</span>
        </Link>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''} ${link.highlight ? 'navbar__link--highlight' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {link.highlight && <span className="navbar__pulse-dot" />}
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar__right">
          <LanguageSwitcher />
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
