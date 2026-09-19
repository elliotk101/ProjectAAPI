export const SITE_URL = 'https://aapicheck.org';

// Public page information only. Never add screening answers or visit-card data.
export const SEO_PAGES = {
  '/': {
    title: 'AAPICHECK | AAPI Diabetes Screening & New York Health Resources',
    description: 'Explore diabetes screening guidance for Asian American and Pacific Islander adults, New York hospitals, community resources, and language assistance.',
  },
  '/screener': {
    title: 'Diabetes Screening Guide for AAPI Adults | AAPICHECK',
    description: 'Prepare for a healthcare visit with a private, step-by-step diabetes screening guide. Understand screening considerations and questions to ask, not a diagnosis.',
  },
  '/map': {
    title: 'New York Hospital Finder & NYC Health Map | AAPICHECK',
    description: 'Find New York State hospitals and explore NYC community health data. Use the map to plan your next step and confirm available services with the hospital.',
  },
  '/resources': {
    title: 'NYC AAPI Community Health Resources | AAPICHECK',
    description: 'Find a curated starting point for AAPI-serving organizations in New York City, with community support and health resources for residents and families.',
  },
  '/compliance': {
    title: 'New York Hospital Language Assistance Guide | AAPICHECK',
    description: 'Prepare to ask a New York hospital for language assistance. Explore interpreter guidance and multilingual request cards to bring to your healthcare visit.',
  },
  '/bill-s634b': {
    title: 'New York S634B Diabetes Screening Bill Guide | AAPICHECK',
    description: 'Read about New York Senate Bill S634B and diabetes screening education for AAPI communities. Follow official legislative sources for the latest bill status.',
  },
  '/accessibility': {
    title: 'Accessibility & Reading Support | AAPICHECK',
    description: 'Learn about AAPICHECK accessibility features, including text size, contrast, and reading support, and how to report an accessibility problem.',
  },
  '/privacy': {
    title: 'Privacy Policy | AAPICHECK',
    description: 'Learn how AAPICHECK handles information and what to consider when using screening tools, visit cards, and external services.',
  },
  '/terms': {
    title: 'Terms of Use | AAPICHECK',
    description: 'Read the terms for using AAPICHECK educational health information, screening guidance, and community resource tools.',
  },
  '/tracker': {
    title: 'Internal Project Tracker | AAPICHECK',
    description: 'Internal project planning page.',
    noindex: true,
  },
};

export function getSeo(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const page = Object.hasOwn(SEO_PAGES, path) ? SEO_PAGES[path] : null;
  return page
    ? { ...page, canonical: `${SITE_URL}${path}`, robots: page.noindex ? 'noindex, follow' : 'index, follow' }
    : { title: 'Page Not Found | AAPICHECK', description: 'This page could not be found. Explore AAPICHECK health resources.', canonical: null, robots: 'noindex, follow' };
}

export function createSitemap() {
  const urls = Object.keys(SEO_PAGES).filter(path => !SEO_PAGES[path].noindex);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(path => `  <url><loc>${SITE_URL}${path}</loc></url>`).join('\n')}\n</urlset>\n`;
}
