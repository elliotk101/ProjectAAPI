import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { BILL_STATUS } from './src/config/site.js';
import { fetchOfficialBillStatus } from './src/utils/billStatusParser.js';

function billStatusApiPlugin() {
  let cachedPayload = null;
  let cachedAt = 0;
  const TTL_MS = 6 * 60 * 60 * 1000;

  async function handleBillStatus(req, res, next) {
    if (req.url?.split('?')[0] !== '/api/bill-status') {
      return next();
    }
    try {
      if (!cachedPayload || Date.now() - cachedAt > TTL_MS) {
        const verified = await fetchOfficialBillStatus({ timeoutMs: 8000 });
        cachedPayload = { ...BILL_STATUS, ...verified, source: 'nysenate.gov' };
        cachedAt = Date.now();
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(cachedPayload));
    } catch {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, ...BILL_STATUS, source: 'fallback' }));
    }
  }

  return {
    name: 'aapicheck-bill-status-api',
    configureServer(server) {
      server.middlewares.use(handleBillStatus);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleBillStatus);
    },
  };
}

export default defineConfig({
  plugins: [react(), billStatusApiPlugin()],
  server: {
    port: 5173,
    open: false,
  },
});
