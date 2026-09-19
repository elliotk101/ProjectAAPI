import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SEO_PAGES, SITE_URL, getSeo, createSitemap } from './seo.js';

test('public pages have unique titles, descriptions and self-canonicals', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const [path, page] of Object.entries(SEO_PAGES)) {
    const seo = getSeo(path);
    assert.equal(seo.canonical, SITE_URL + path);
    assert.equal(seo.robots, page.noindex ? 'noindex, follow' : 'index, follow');
    assert.ok(!titles.has(seo.title));
    assert.ok(!descriptions.has(seo.description));
    titles.add(seo.title);
    descriptions.add(seo.description);
  }
});

test('unknown routes are excluded and trailing slashes normalized', () => {
  for (const path of ['/missing', '/constructor', '/__proto__', '/screener/results']) {
    assert.equal(getSeo(path).canonical, null);
    assert.equal(getSeo(path).robots, 'noindex, follow');
  }
  assert.equal(getSeo('/screener/').canonical, SITE_URL + '/screener');
});

test('sitemap includes public pages only and matches development copy', () => {
  const sitemap = createSitemap();
  assert.ok(!sitemap.includes('/tracker'));
  assert.ok(!sitemap.includes('/results'));
  for (const [path, page] of Object.entries(SEO_PAGES)) {
    if (!page.noindex) assert.ok(sitemap.includes(`<loc>${SITE_URL}${path}</loc>`));
  }
  const source = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');
  for (const route of source.matchAll(/<Route path="([^"]+)"/g)) {
    if (route[1] !== '*') assert.ok(SEO_PAGES[route[1]], `Missing SEO: ${route[1]}`);
  }
  const publicSitemap = readFileSync(new URL('../../public/sitemap.xml', import.meta.url), 'utf8');
  const locations = xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]).sort();
  assert.deepEqual(locations(publicSitemap), locations(sitemap));
});
