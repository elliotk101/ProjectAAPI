# AAPICHECK search setup

## Implemented

- Existing language selection and URLs remain unchanged. English is the default search-facing language.
- `src/config/seo.js` defines public route titles, descriptions, canonical URLs and indexability.
- The build emits route-specific HTML heads (for example `dist/screener.html`) and a sitemap. These are metadata shells, **not prerendered page bodies**. Google still needs JavaScript to read the React content.
- Client navigation updates descriptions, canonical, robots and social metadata. Existing translated browser titles remain managed by the pages.
- `/tracker` has `noindex, follow`; unknown client routes receive `noindex` and lose their canonical. This is not authentication or access control.
- No screening answers, results or visit-card data are added to metadata or the sitemap. No analytics or third-party tracking has been added.

## Owner steps after deployment

1. Add `aapicheck.org` as a Domain property in Google Search Console.
2. Copy Google's unique DNS TXT verification value into the authoritative DNS provider. Do not replace existing TXT records. Verify ownership in Search Console.
3. Submit `https://aapicheck.org/sitemap.xml` in Sitemaps.
4. Inspect `/`, `/screener`, `/map`, `/resources`, `/compliance` using URL Inspection / Test live URL. Confirm rendered content, crawl permissions, user-declared canonical, and Google-selected canonical when available. Request indexing for the key pages.
5. Check Security issues and Manual actions. A browser extension's reputation warning is not evidence of Google's security verdict.
6. Monitor indexing and Search performance (queries, impressions, clicks) after launch. Submission does not guarantee indexing or ranking.

## Deployment acceptance checks

- Run `npm test` and `npm run build`.
- Confirm production `/screener` returns its own title, description and canonical in the **HTTP response HTML**, not the home metadata. The checked-in Cloudflare assets configuration should serve the generated `.html` assets before its SPA fallback; verify this on the actual host after deployment.
- Confirm HTTPS and the preferred non-www domain redirect consistently; DNS and redirect settings have not been changed here.
- Confirm `/tracker` response contains `noindex` and the sitemap does not include it.
- Unknown URLs still use the existing SPA fallback (potential HTTP 200); client-side `noindex` is the current mitigation, not a server-side 404 fix.
- Test direct navigation and in-app links, mobile layout, saved Korean language, and switching languages. Confirm no stale `noindex` remains when navigating back from an unknown page.
- Full body prerendering/SSR remains a separate future enhancement, especially for education pages. Do not pre-render personalized screening results.

## Sources

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://support.google.com/webmasters/answer/7440203
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
