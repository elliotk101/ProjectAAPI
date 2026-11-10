import { readFile, writeFile } from 'node:fs/promises';
import { BILL_STATUS } from '../src/config/site.js';
import { fetchOfficialBillStatus } from '../src/utils/billStatusParser.js';

const siteConfigPath = new URL('../src/config/site.js', import.meta.url);
const publicJsonPath = new URL('../public/bill-status.json', import.meta.url);

try {
  const verified = await fetchOfficialBillStatus({ timeoutMs: 8000 });
  const payload = {
    ...BILL_STATUS,
    ...verified,
    source: 'nysenate.gov',
  };

  await writeFile(publicJsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const currentSiteConfig = await readFile(siteConfigPath, 'utf8');
  const updatedSiteConfig = currentSiteConfig
    .replace(/state:\s*'[^']*'/, `state: '${verified.state}'`)
    .replace(/lastVerified:\s*'[^']*'/, `lastVerified: '${verified.lastVerified}'`)
    .replace(/lastVerifiedIso:\s*'[^']*'/, `lastVerifiedIso: '${verified.lastVerifiedIso}'`);

  if (updatedSiteConfig !== currentSiteConfig) {
    await writeFile(siteConfigPath, updatedSiteConfig, 'utf8');
  }

  console.log(
    `Bill ${verified.code}: verified "${verified.senateStatusText}" (${verified.state}) on ${verified.lastVerified}.`
  );
} catch (error) {
  const fallbackPayload = {
    ok: true,
    ...BILL_STATUS,
    source: 'fallback',
  };
  await writeFile(publicJsonPath, `${JSON.stringify(fallbackPayload, null, 2)}\n`, 'utf8');
  console.warn(
    `Bill ${BILL_STATUS.code}: live check skipped (${error.message}); using fallback date ${BILL_STATUS.lastVerified}.`
  );
}

