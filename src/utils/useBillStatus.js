import { useEffect, useState } from 'react';
import { BILL_STATUS } from '../config/site';

const STORAGE_KEY = 'aapicheck_bill_status_v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const STATE_COPY = {
  enacted: {
    en: {
      statusTitle: 'Signed Into Law by the Governor',
      bannerText: 'S634B passed the Senate and Assembly and has been signed by the Governor. Check the official record for effective dates and policy details.',
    },
    ko: {
      statusTitle: '주지사 서명 완료 (법률 제정)',
      bannerText: 'S634B가 상·하원을 통과하여 주지사가 서명했습니다. 시행일 및 보험 적용 세부 사항은 공식 기록을 확인하세요.',
    },
    zh: {
      statusTitle: '州长已签署成为法律',
      bannerText: 'S634B已通过参众两院并由州长签署。请查看官方记录了解生效日期和保险适用详情。',
    },
    bn: {
      statusTitle: 'গভর্নর কর্তৃক আইনে স্বাক্ষরিত',
      bannerText: 'S634B সিনেট ও অ্যাসেম্বলি পাস করেছে এবং গভর্নর স্বাক্ষর করেছেন। কার্যকর তারিখ ও বিস্তারিত জানতে সরকারি রেকর্ড দেখুন।',
    },
    ur: {
      statusTitle: 'گورنر کے دستخط سے قانون بن گیا',
      bannerText: 'S634B سینیٹ اور اسمبلی سے منظور ہو کر گورنر کے دستخط پا چکا ہے۔ نفاذ کی تاریخ اور تفصیلات کے لیے سرکاری ریکارڈ دیکھیں۔',
    },
  },
  vetoed: {
    en: {
      statusTitle: 'Governor Action Recorded (Vetoed)',
      bannerText: 'Executive action has been recorded on S634B. Check the official New York Senate bill record for the latest legislative status.',
    },
    ko: {
      statusTitle: '주지사 거부권 행사 기록됨',
      bannerText: 'S634B에 대한 주지사의 결정이 기록되었습니다. 최신 입법 상태는 뉴욕주 상원 공식 법안 기록을 확인하세요.',
    },
    zh: {
      statusTitle: '已记录州长否决行动',
      bannerText: 'S634B已记录州长行动。请查看纽约州参议院官方账单记录了解最新立法状态。',
    },
    bn: {
      statusTitle: 'গভর্নরের পদক্ষেপ রেকর্ড করা হয়েছে',
      bannerText: 'S634B-এর বিষয়ে গভর্নরের পদক্ষেপ রেকর্ড করা হয়েছে। সর্বশেষ অবস্থার জন্য সরকারি বিল রেকর্ড দেখুন।',
    },
    ur: {
      statusTitle: 'گورنر کی کارروائی ریکارڈ کی گئی',
      bannerText: 'S634B پر گورنر کی کارروائی ریکارڈ کی گئی ہے۔ تازہ ترین صورتحال کے لیے سرکاری بل ریکارڈ دیکھیں۔',
    },
  },
};

export function getBillCopy(billStatus, t, lang = 'en') {
  const override = STATE_COPY[billStatus?.state];
  if (override) {
    return override[lang] || override.en;
  }
  return {
    statusTitle: t('bill.timeline_governor'),
    bannerText: t('bill.banner_text'),
  };
}

let memoryCache = null;
let inflightPromise = null;

function readCachedStatus() {
  if (memoryCache && Date.now() - memoryCache.cachedAt < CACHE_TTL_MS) {
    return memoryCache.data;
  }
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.cachedAt &&
      Date.now() - parsed.cachedAt < CACHE_TTL_MS &&
      parsed.data?.lastVerified
    ) {
      memoryCache = parsed;
      return parsed.data;
    }
  } catch {
    // Ignore storage access errors
  }
  return null;
}

function saveCachedStatus(data) {
  const entry = { cachedAt: Date.now(), data };
  memoryCache = entry;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore storage quota/privacy errors
  }
}

async function fetchJsonStatus(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  const payload = await response.json();
  if (!payload || !payload.lastVerified) return null;
  return {
    ...BILL_STATUS,
    ...payload,
  };
}

async function loadLatestBillStatus() {
  const cached = readCachedStatus();
  if (cached) return cached;

  if (!inflightPromise) {
    inflightPromise = (async () => {
      try {
        const live = await fetchJsonStatus('/api/bill-status');
        if (live) {
          saveCachedStatus(live);
          return live;
        }
      } catch {
        // Fall through to build-verified JSON
      }

      try {
        const staticVerified = await fetchJsonStatus('/bill-status.json');
        if (staticVerified) {
          saveCachedStatus(staticVerified);
          return staticVerified;
        }
      } catch {
        // Fall back to static config
      }

      return BILL_STATUS;
    })().finally(() => {
      inflightPromise = null;
    });
  }

  return inflightPromise;
}

export function useBillStatus() {
  const [billStatus, setBillStatus] = useState(() => readCachedStatus() || BILL_STATUS);

  useEffect(() => {
    let active = true;
    loadLatestBillStatus().then((latest) => {
      if (active && latest) {
        setBillStatus(latest);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return billStatus;
}
