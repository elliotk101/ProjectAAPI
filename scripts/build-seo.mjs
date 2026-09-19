import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { SEO_PAGES, getSeo, createSitemap } from '../src/config/seo.js';

const output = new URL('../dist/', import.meta.url);
const template = await readFile(new URL('index.html', output), 'utf8');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Generate route-specific HEADs, not a prerender of the interactive page body.
// Static hosts serve these before the SPA fallback. No user data enters this build.
for (const path of Object.keys(SEO_PAGES)) {
  const seo = getSeo(path);
  const head = [
    `<title>${escape(seo.title)}</title>`,
    `<meta name="description" content="${escape(seo.description)}" />`,
    `<meta name="robots" content="${seo.robots}" />`,
    `<link rel="canonical" href="${seo.canonical}" />`,
    `<meta property="og:title" content="${escape(seo.title)}" />`,
    `<meta property="og:description" content="${escape(seo.description)}" />`,
    `<meta property="og:url" content="${seo.canonical}" />`,
    `<meta name="twitter:title" content="${escape(seo.title)}" />`,
    `<meta name="twitter:description" content="${escape(seo.description)}" />`,
  ].join('\n  ');
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+(?:name="(?:description|robots|twitter:title|twitter:description)"|property="og:(?:title|description|url)")[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace('</head>', `  ${head}\n</head>`);
  // Flat .html files preserve extensionless URLs on Cloudflare static assets.
  const filename = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
  await writeFile(new URL(filename, output), html);
}
await mkdir(output, { recursive: true });
await writeFile(new URL('sitemap.xml', output), createSitemap());
console.log(`SEO: generated ${Object.keys(SEO_PAGES).length} route heads and public sitemap.`);
