import { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../i18n/i18nProvider';
import nonprofits from '../data/nonprofits.json';

const SERVICE_FILTERS = ['All', 'Healthcare', 'Food Security', 'Legal', 'Education', 'Social Services'];

const FILTER_I18N_KEY = {
  All: 'directory.filter_all',
  Healthcare: 'directory.filter_healthcare',
  'Food Security': 'directory.filter_food',
  Legal: 'directory.filter_legal',
  Education: 'directory.filter_education',
  'Social Services': 'directory.filter_social',
};

const UI_COPY = {
  en: {
    showing: 'Showing {shown} of {total} organizations',
    call: 'Call',
  },
  ko: {
    showing: '전체 {total}개 기관 중 {shown}개 표시',
    call: '전화',
  },
  zh: {
    showing: '显示 {shown} / {total} 家机构',
    call: '致电',
  },
  bn: {
    showing: 'মোট {total}টি সংস্থার মধ্যে {shown}টি দেখানো হচ্ছে',
    call: 'কল করুন',
  },
  ur: {
    showing: 'کل {total} میں سے {shown} ادارے دکھائے جا رہے ہیں',
    call: 'کال کریں',
  },
};

const TERM_TRANSLATIONS = {
  ko: {
    services: {
      Healthcare: '의료',
      'Food Security': '식량 안보',
      'Benefits Assistance': '혜택 신청 지원',
      'Senior Services': '노인 서비스',
      Education: '교육',
      'Social Services': '사회 서비스',
      'Civic Engagement': '시민 참여',
      Dental: '치과',
      'Mental Health': '정신 건강',
      Pediatrics: '소아과',
      'Youth Programs': '청소년 프로그램',
      'Domestic Violence': '가정폭력 지원',
      Legal: '법률',
      Immigration: '이민',
      Housing: '주거',
      'Financial Literacy': '금융 교육',
      'Workers Rights': '노동자 권익',
    },
    languages: {
      English: '영어',
      Korean: '한국어',
      Mandarin: '중국어(보통화)',
      Cantonese: '중국어(광둥어)',
      Bengali: '벵골어',
      Urdu: '우르두어',
      Hindi: '힌디어',
      Punjabi: '펀자브어',
      Nepali: '네팔어',
      Tibetan: '티베트어',
      Vietnamese: '베트남어',
      Tagalog: '타갈로그어',
      Ilocano: '일로카노어',
      Burmese: '버마어',
      Khmer: '크메르어',
      Thai: '태국어',
      Arabic: '아랍어',
      Fujianese: '푸젠어',
      Spanish: '스페인어',
      Japanese: '일본어',
      Gujarati: '구자라트어',
      Pashto: '파슈토어',
    },
    boroughs: {
      Queens: '퀸즈',
      Manhattan: '맨해튼',
      Brooklyn: '브루클린',
      Bronx: '브롱스',
      'Staten Island': '스태튼아일랜드',
    },
  },
  zh: {
    services: {
      Healthcare: '医疗保健',
      'Food Security': '食品安全',
      'Benefits Assistance': '福利援助',
      'Senior Services': '长者服务',
      Education: '教育',
      'Social Services': '社会服务',
      'Civic Engagement': '公民参与',
      Dental: '牙科',
      'Mental Health': '心理健康',
      Pediatrics: '儿科',
      'Youth Programs': '青年项目',
      'Domestic Violence': '家庭暴力援助',
      Legal: '法律',
      Immigration: '移民',
      Housing: '住房',
      'Financial Literacy': '理财教育',
      'Workers Rights': '劳工权益',
    },
    languages: {
      English: '英语',
      Korean: '韩语',
      Mandarin: '普通话',
      Cantonese: '粤语',
      Bengali: '孟加拉语',
      Urdu: '乌尔都语',
      Hindi: '印地语',
      Punjabi: '旁遮普语',
      Nepali: '尼泊尔语',
      Tibetan: '藏语',
      Vietnamese: '越南语',
      Tagalog: '他加禄语',
      Ilocano: '伊洛卡诺语',
      Burmese: '缅甸语',
      Khmer: '高棉语',
      Thai: '泰语',
      Arabic: '阿拉伯语',
      Fujianese: '福建话',
      Spanish: '西班牙语',
      Japanese: '日语',
      Gujarati: '古吉拉特语',
      Pashto: '普什图语',
    },
    boroughs: {
      Queens: '皇后区',
      Manhattan: '曼哈顿',
      Brooklyn: '布鲁克林',
      Bronx: '布朗克斯',
      'Staten Island': '斯塔滕岛',
    },
  },
};

function ResourceDirectory() {
  const { t, lang } = useI18n();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const ui = UI_COPY[lang] || UI_COPY.en;
  const dict = TERM_TRANSLATIONS[lang];

  useEffect(() => {
    document.title = `${t('directory.title')} — AAPICHECK`;
  }, [t]);

  const translateService = (service) => dict?.services?.[service] || service;
  const translateLanguage = (language) => dict?.languages?.[language] || language;
  const translateBorough = (borough) => dict?.boroughs?.[borough] || borough;

  const filtered = useMemo(() => {
    let results = nonprofits;

    if (activeFilter !== 'All') {
      results = results.filter((org) =>
        org.services.some((s) => s.toLowerCase() === activeFilter.toLowerCase())
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter((org) => {
        const searchable = [
          org.name,
          org.address,
          org.borough,
          translateBorough(org.borough),
          ...org.services,
          ...org.services.map(translateService),
          ...org.languages,
          ...org.languages.map(translateLanguage),
        ]
          .join(' ')
          .toLowerCase();
        return searchable.includes(q);
      });
    }

    return results;
  }, [search, activeFilter, lang]);

  const filterKey = (filter) => {
    const key = FILTER_I18N_KEY[filter] || `directory.filter_${filter.toLowerCase().replace(/\s+/g, '_')}`;
    const translated = t(key);
    return translated !== key ? translated : filter;
  };

  return (
    <div className="directory page-enter">
      <div className="section-heading">
        <h1 style={{ fontSize: 'var(--fs-3xl)' }}>{t('directory.title')}</h1>
        <p>{t('directory.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="directory__search">
        <input
          type="text"
          className="directory__search-input"
          placeholder={t('directory.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="search-resources"
          aria-label={t('directory.search_placeholder')}
        />
      </div>

      {/* Filters */}
      <div className="directory__filters">
        {SERVICE_FILTERS.map((filter) => (
          <button
            key={filter}
            className={`chip ${activeFilter === filter ? 'chip--active' : ''}`}
            onClick={() => setActiveFilter(filter)}
            aria-pressed={activeFilter === filter}
            id={`filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {filterKey(filter)}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="result-count" aria-live="polite">
        {ui.showing.replace('{shown}', filtered.length).replace('{total}', nonprofits.length)}
      </p>
      {filtered.length > 0 ? (
        <div className="directory__grid fade-stagger">
          {filtered.map((org) => (
            <div className="glass-card resource-card" key={org.id} id={`org-${org.id}`}>
              <div className="resource-card__name">{org.name}</div>
              <div className="resource-card__address">📍 {org.address}</div>

              <div className="resource-card__services">
                {org.services.map((service) => (
                  <span key={service} className="badge badge--indigo">
                    {translateService(service)}
                  </span>
                ))}
              </div>

              <div className="resource-card__contact">
                {org.phone && <a href={`tel:${org.phone.replace(/[^+\d]/g, '')}`}>{ui.call} {org.phone}</a>}
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(org.address)}`} target="_blank" rel="noopener noreferrer">{t('nav.map')}</a>
                {org.website && org.website !== '#' && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-teal-400)' }}>
                    🌐 {t('directory.website')}
                  </a>
                )}
              </div>

              <div className="resource-card__languages">
                {org.languages.map((language) => (
                  <span key={language} className="badge badge--teal">
                    {translateLanguage(language)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <p>{t('directory.no_results')}</p>
        </div>
      )}
    </div>
  );
}

export default ResourceDirectory;
