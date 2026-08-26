import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BILL_STATUS, SITE } from '../config/site';

function BillS634B() {
  const [copied, setCopied] = useState(false);
  useEffect(() => { document.title = `S634B update — ${SITE.name}`; }, []);

  async function share() {
    const payload = { title: 'New York S634B update', text: 'See the verified status and plain-language summary of New York bill S634B.', url: window.location.href };
    if (navigator.share) { try { await navigator.share(payload); return; } catch (error) { if (error.name === 'AbortError') return; } }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true); window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="bill-page">
      <header className="bill-page__hero"><div className="bill-page__hero-content">
        <p className="eyebrow">New York legislative update</p><h1>Screening coverage bill S634B</h1>
        <p className="bill-page__hero-subtitle">Passed the New York Senate and Assembly. As of {BILL_STATUS.lastVerified}, it is awaiting the Governor’s action and is not yet law.</p>
        <div className="status-panel"><span className="status-dot" aria-hidden="true" /><div><strong>Current status: awaiting action</strong><span>Last verified {BILL_STATUS.lastVerified}</span></div></div>
        <div className="button-row"><a className="btn btn--primary" href={BILL_STATUS.officialUrl} target="_blank" rel="noreferrer">View official bill record</a><button className="btn btn--secondary" onClick={share}>{copied ? 'Link copied' : 'Share this update'}</button></div>
      </div></header>

      <section className="bill-page__section bill-summary"><div><p className="eyebrow">Plain-language summary</p><h2>What the bill would do if signed</h2></div><div className="prose"><p>S634B would require certain New York-regulated commercial health insurance policies to cover diabetes and prediabetes screening according to nationally recognized, evidence-based clinical practice guidelines, without cost-sharing.</p><p>It would apply to eligible policies or contracts issued, renewed, modified, altered, or amended on or after the law’s effective date. Exact coverage depends on the final enacted text and whether a person’s plan is subject to New York insurance law.</p></div></section>

      <section className="bill-page__section"><p className="eyebrow">Four things to know</p><h2>Before you make a healthcare decision</h2><div className="fact-grid">
        <article><span>01</span><h3>It is not law yet</h3><p>Passing both chambers does not equal the Governor’s signature. We will update this page only after checking the official record.</p></article>
        <article><span>02</span><h3>Not every plan is the same</h3><p>Federal plans and some self-funded employer plans may follow different rules. Confirm benefits with your insurer.</p></article>
        <article><span>03</span><h3>BMI 23 is guidance</h3><p>For Asian American adults, BMI 23 is a recognized threshold for considering diabetes screening. A clinician should consider your full health history.</p></article>
        <article><span>04</span><h3>Care should not wait</h3><p>You can ask a healthcare professional about screening now. Do not delay care while waiting for legislation.</p></article>
      </div></section>

      <section className="bill-page__section timeline-simple"><p className="eyebrow">Status timeline</p><h2>Where the bill stands</h2><ol>
        <li className="is-done"><strong>Introduced and amended</strong><span>Bill text developed in the 2025–2026 session.</span></li><li className="is-done"><strong>Senate passed</strong><span>Approved by the New York State Senate.</span></li><li className="is-done"><strong>Assembly passed</strong><span>Approved by the New York State Assembly.</span></li><li className="is-current"><strong>Governor’s action</strong><span>Awaiting signature, veto, or other official action.</span></li>
      </ol></section>

      <section className="source-box"><h2>How we verify this page</h2><p>We use the official New York State Senate bill record as the source of truth. Advocacy announcements provide context but do not replace the official status.</p><div className="button-row"><a href={BILL_STATUS.officialUrl} target="_blank" rel="noreferrer">Official S634B record ↗</a><a href={BILL_STATUS.updateUrl} target="_blank" rel="noreferrer">August 18 legislative update ↗</a></div></section>
      <section className="bill-next"><h2>Take a useful step today</h2><p>Prepare questions for a healthcare professional and locate culturally relevant support.</p><div className="button-row"><Link className="btn btn--primary" to="/screener">Start health check</Link><Link className="btn btn--secondary" to="/resources">Find community help</Link></div></section>
    </article>
  );
}

export default BillS634B;
