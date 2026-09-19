import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SEO_PAGES, getSeo, createSitemap } from '../src/config/seo.js';

const output = new URL('../dist/', import.meta.url);
for (const path of Object.keys(SEO_PAGES)) {
  const filename = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
  const html = await readFile(new URL(filename, output), 'utf8');
  const seo = getSeo(path);
  assert.equal((html.match(/<title>/g) || []).length, 1, `${path}: title count`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, `${path}: canonical count`);
  assert.equal((html.match(/name="description"/g) || []).length, 1, `${path}: description count`);
  assert.ok(html.includes(`href="${seo.canonical}"`), `${path}: canonical`);
  assert.ok(html.includes(`name="robots" content="${seo.robots}"`), `${path}: robots`);
  assert.ok(html.includes(seo.title.replaceAll('&', '&amp;')), `${path}: title`);
  assert.ok(html.includes('type="module"'), `${path}: app entry`);
}
assert.equal(await readFile(new URL('sitemap.xml', output), 'utf8'), createSitemap());
console.log('Verified SEO HTML for all 10 routes and generated sitemap.');
