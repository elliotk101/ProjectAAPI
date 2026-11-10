export const OFFICIAL_BILL_URL = 'https://www.nysenate.gov/legislation/bills/2025/S634/amendment/B';
export const NY_TIMEZONE = 'America/New_York';

export function formatVerifiedDate(dateInput = new Date(), locale = 'en-US') {
  const date = parseDateInput(dateInput);
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: NY_TIMEZONE,
  }).format(date);
}

export function toNyIsoDate(dateInput = new Date()) {
  const date = parseDateInput(dateInput);
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: NY_TIMEZONE,
  }).formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

function parseDateInput(dateInput) {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return new Date(`${dateInput}T12:00:00Z`);
  }
  const parsed = new Date(dateInput);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasPassedMilestone(html, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<li[^>]*class="([^"]*)"[^>]*title="${escaped}"`, 'i');
  const match = html.match(pattern);
  return Boolean(match && match[1].includes('nys-bill-status-passed'));
}

export function parseNySenateBillHtml(html, verifiedDate = new Date()) {
  if (typeof html !== 'string' || !html.includes('nys-bill-status')) {
    throw new Error('Invalid NY Senate bill page HTML: missing nys-bill-status block');
  }

  const headerMatch = html.match(
    /Current\s+Bill\s+Status\s*-\s*<span>([\s\S]*?)<\/span>/i
  );
  const senateStatusText = headerMatch
    ? decodeHtmlEntities(headerMatch[1])
    : '';

  const milestones = {
    introduced: hasPassedMilestone(html, 'Introduced'),
    inCommitteeAssembly: hasPassedMilestone(html, 'In Committee Assembly'),
    inCommitteeSenate: hasPassedMilestone(html, 'In Committee Senate'),
    onFloorAssembly: hasPassedMilestone(html, 'On Floor Calendar Assembly'),
    onFloorSenate: hasPassedMilestone(html, 'On Floor Calendar Senate'),
    passedAssembly: hasPassedMilestone(html, 'Passed Assembly'),
    passedSenate: hasPassedMilestone(html, 'Passed Senate'),
    deliveredToGovernor: hasPassedMilestone(html, 'Delivered to Governor'),
    signedByGovernor: hasPassedMilestone(html, 'Signed By Governor'),
  };

  if (!senateStatusText && !milestones.introduced) {
    throw new Error('Unable to parse bill milestones from NY Senate HTML');
  }

  let state = 'in-legislature';
  if (milestones.signedByGovernor || /signed\s+by\s+gov/i.test(senateStatusText)) {
    state = 'enacted';
  } else if (/vetoed/i.test(senateStatusText)) {
    state = 'vetoed';
  } else if (milestones.passedSenate && milestones.passedAssembly) {
    state = 'awaiting-signature';
  }

  const label =
    state === 'enacted'
      ? 'Signed by the Governor — enacted into law'
      : state === 'vetoed'
        ? 'Vetoed by the Governor'
        : state === 'awaiting-signature'
          ? "Passed the Legislature — awaiting the Governor's action"
          : senateStatusText || 'In the New York State Legislature';

  return {
    ok: true,
    code: 'S634B',
    state,
    label,
    senateStatusText: senateStatusText || 'Passed Senate & Assembly',
    milestones,
    lastVerified: formatVerifiedDate(verifiedDate),
    lastVerifiedIso: toNyIsoDate(verifiedDate),
    officialUrl: OFFICIAL_BILL_URL,
  };
}

export async function fetchOfficialBillStatus({
  fetchImpl = globalThis.fetch,
  now = new Date(),
  timeoutMs = 8000,
} = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(OFFICIAL_BILL_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) {
      throw new Error(`NY Senate page responded with HTTP ${response.status}`);
    }
    const html = await response.text();
    return parseNySenateBillHtml(html, now);
  } finally {
    clearTimeout(timer);
  }
}
