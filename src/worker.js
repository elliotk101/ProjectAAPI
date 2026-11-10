import { BILL_STATUS } from './config/site.js';
import { fetchOfficialBillStatus } from './utils/billStatusParser.js';

const EDGE_CACHE_TTL_SECONDS = 21600; // 6 hours
const BROWSER_CACHE_TTL_SECONDS = 3600; // 1 hour

function jsonResponse(payload, status = 200, cacheControl = `public, max-age=${BROWSER_CACHE_TTL_SECONDS}, s-maxage=${EDGE_CACHE_TTL_SECONDS}`) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/bill-status') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return jsonResponse({ ok: false, error: 'Method Not Allowed' }, 405, 'no-store');
      }

      const cache = globalThis.caches?.default;
      const cacheKey = new Request(new URL('/api/bill-status', url.origin).toString(), {
        method: 'GET',
      });

      if (cache) {
        const cached = await cache.match(cacheKey);
        if (cached) return cached;
      }

      try {
        const verified = await fetchOfficialBillStatus({
          now: new Date(),
          timeoutMs: 8000,
        });
        const response = jsonResponse({
          ...BILL_STATUS,
          ...verified,
          source: 'nysenate.gov',
        });

        if (cache && ctx?.waitUntil) {
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
        return response;
      } catch {
        return jsonResponse(
          {
            ok: true,
            ...BILL_STATUS,
            source: 'fallback',
          },
          200,
          'public, max-age=300, s-maxage=600'
        );
      }
    }

    if (env?.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};

