import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSeo } from '../config/seo';

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function SeoMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const seo = getSeo(pathname);
    setMeta('name', 'description', seo.description);
    setMeta('name', 'robots', seo.robots);
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('name', 'twitter:title', seo.title);
    setMeta('name', 'twitter:description', seo.description);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (seo.canonical) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = seo.canonical;
      setMeta('property', 'og:url', seo.canonical);
    } else {
      canonical?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
      document.title = seo.title;
    }
    // Existing page effects retain localized browser titles. Metadata is English,
    // matching the default crawlable language; no saved language is changed here.
  }, [pathname]);
  return null;
}
