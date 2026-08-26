import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="simple-page not-found">
      <p className="eyebrow">404</p>
      <h1>We couldn’t find that page.</h1>
      <p>The link may be outdated. Return home or start the health check.</p>
      <div className="button-row">
        <Link className="btn btn--primary" to="/">Go home</Link>
        <Link className="btn btn--secondary" to="/screener">Start health check</Link>
      </div>
    </section>
  );
}

export default NotFound;
