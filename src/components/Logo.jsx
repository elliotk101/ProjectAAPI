import { Link } from 'react-router-dom';
import { SITE } from '../config/site';

function Logo({ compact = false }) {
  return (
    <Link to="/" className={`brand-lockup ${compact ? 'brand-lockup--compact' : ''}`} aria-label={`${SITE.name} home`}>
      <span className="brand-lockup__wordmark" aria-hidden="true"><span>AAPI</span><span>CHECK</span></span>
      {!compact && <span className="brand-lockup__descriptor">{SITE.descriptor}</span>}
    </Link>
  );
}

export default Logo;
