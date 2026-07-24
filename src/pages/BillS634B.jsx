import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import SubscriptionForm from '../components/SubscriptionForm';

const TIMELINE_STEPS = [
  { key: 'introduced', status: 'done', icon: '📝' },
  { key: 'senate', status: 'done', icon: '🏛️' },
  { key: 'assembly', status: 'done', icon: '⚖️' },
  { key: 'governor', status: 'current', icon: '✍️' },
];

const BENEFITS = [
  { key: 'screening', icon: '🩺', color: 'var(--color-teal-400)' },
  { key: 'insurance', icon: '🛡️', color: 'var(--color-indigo-400)' },
  { key: 'care', icon: '🤝', color: 'var(--color-amber-400)' },
  { key: 'outreach', icon: '📢', color: 'var(--color-risk-low)' },
];

const PREPARE_STEPS = [
  { key: 'step1', icon: '📊', num: '01' },
  { key: 'step2', icon: '👨‍⚕️', num: '02' },
  { key: 'step3', icon: '📋', num: '03' },
  { key: 'step4', icon: '📣', num: '04' },
];

function BillS634B() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState(null);
  const [copied, setCopied] = useState(false);
  const revealRefs = useRef([]);

  useEffect(() => {
    document.title = `${t('bill.page_title')} — AAPI Health Equity`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [t]);

  const addRevealRef = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const faqs = [1, 2, 3, 4, 5];

  return (
    <div className="bill-page page-enter" id="bill-s634b-page">
      {/* Hero */}
      <section className="bill-page__hero">
        <div className="bill-page__hero-content">
          <span className="hero__badge">✦ {t('bill.status_badge')}</span>
          <h1>
            {t('bill.page_title')}
          </h1>
          <p className="bill-page__hero-subtitle">{t('bill.page_subtitle')}</p>
          <div className="bill-page__hero-actions">
            <a href="#bill-subscribe-section" className="btn btn--primary btn--lg" id="bill-hero-subscribe">
              ✉ {t('bill.modal_subscribe')}
            </a>
            <button className="btn btn--secondary btn--lg" onClick={handleShare} id="bill-hero-share">
              {copied ? `✓ ${t('bill.share_copied')}` : `🔗 ${t('bill.share_title')}`}
            </button>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bill-page__section reveal" ref={addRevealRef}>
        <div className="section-heading">
          <span className="section-heading__badge">✦ {t('bill.timeline_title')}</span>
          <h2>{t('bill.timeline_title')}</h2>
        </div>

        <div className="bill-timeline" id="bill-timeline">
          {TIMELINE_STEPS.map((step, i) => (
            <div
              key={step.key}
              className={`bill-timeline__step bill-timeline__step--${step.status}`}
            >
              <div className="bill-timeline__icon">{step.icon}</div>
              <div className="bill-timeline__connector" />
              <div className="bill-timeline__content">
                <h3>{t(`bill.timeline_${step.key}`)}</h3>
                <p>{t(`bill.timeline_${step.key}_desc`)}</p>
              </div>
              {step.status === 'current' && (
                <span className="bill-timeline__pulse" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bill-page__section reveal" ref={addRevealRef}>
        <div className="section-heading">
          <h2>{t('bill.benefits_title')}</h2>
        </div>

        <div className="bill-benefits fade-stagger">
          {BENEFITS.map((benefit) => (
            <div className="glass-card bill-benefit-card" key={benefit.key} id={`benefit-${benefit.key}`}>
              <div className="bill-benefit-card__icon" style={{ background: `${benefit.color}22`, color: benefit.color }}>
                {benefit.icon}
              </div>
              <h3>{t(`bill.benefit_${benefit.key}_title`)}</h3>
              <p>{t(`bill.benefit_${benefit.key}_desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Prepare */}
      <section className="bill-page__section reveal" ref={addRevealRef}>
        <div className="section-heading">
          <h2>{t('bill.prepare_title')}</h2>
        </div>

        <div className="bill-prepare fade-stagger">
          {PREPARE_STEPS.map((step) => (
            <div className="glass-card bill-prepare-card" key={step.key} id={`prepare-${step.key}`}>
              <span className="bill-prepare-card__num">{step.num}</span>
              <div className="bill-prepare-card__icon">{step.icon}</div>
              <h3>{t(`bill.prepare_${step.key}_title`)}</h3>
              <p>{t(`bill.prepare_${step.key}_desc`)}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
          <Link to="/screener" className="btn btn--primary btn--lg" id="bill-take-screener">
            📊 {t('hero.cta_screen')}
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bill-page__section reveal" ref={addRevealRef}>
        <div className="section-heading">
          <h2>{t('bill.faq_title')}</h2>
        </div>

        <div className="bill-faq" id="bill-faq">
          {faqs.map((num) => {
            const isOpen = openFaq === num;
            return (
              <div className={`bill-faq__item ${isOpen ? 'bill-faq__item--open' : ''}`} key={num}>
                <button
                  className="bill-faq__question"
                  onClick={() => setOpenFaq(isOpen ? null : num)}
                  aria-expanded={isOpen}
                  id={`faq-q${num}`}
                >
                  <span>{t(`bill.faq_q${num}`)}</span>
                  <span className="bill-faq__toggle">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="bill-faq__answer" id={`faq-a${num}`}>
                    <p>{t(`bill.faq_a${num}`)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Subscribe */}
      <section className="bill-page__section reveal" ref={addRevealRef} id="bill-subscribe-section">
        <div className="glass-card bill-subscribe-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>{t('bill.subscribe_title')}</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>{t('bill.subscribe_text')}</p>
          <SubscriptionForm />
        </div>
      </section>
    </div>
  );
}

export default BillS634B;
