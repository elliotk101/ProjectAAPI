/**
 * NYC Open Data (Socrata) API Service
 *
 * Fetches health data from the NYC Open Data platform using the SODA API.
 * Uses the Community Health Survey and related datasets.
 */

const BASE_URL = 'https://data.cityofnewyork.us/resource';

// NYC Community Health Survey — Health indicators dataset
// This is a publicly available dataset; no API key required for light usage
const DATASETS = {
  communityHealth: 'jb7j-dtam', // Community Health Survey (CHS)
  healthIndicators: '54b2-rfgw', // NYC Health indicators
};

/**
 * Fetch data from a Socrata API endpoint with optional SoQL filtering.
 */
async function fetchSocrataData(datasetId, params = {}) {
  const url = new URL(`${BASE_URL}/${datasetId}.json`);

  // Add query params (SoQL)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`NYC Open Data API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch NYC Open Data:', error);
    throw error;
  }
}

/**
 * Get community health indicators filtered by topic (e.g., diabetes).
 */
export async function getHealthIndicators(topic = 'Diabetes') {
  return fetchSocrataData(DATASETS.communityHealth, {
    $where: `topic='${topic}'`,
    $limit: 200,
  });
}

/**
 * Get health data by neighborhood / geography.
 */
export async function getDataByNeighborhood(limit = 100) {
  return fetchSocrataData(DATASETS.communityHealth, {
    $limit: limit,
  });
}

/*
 * ====================================================================
 *  NYC NEIGHBORHOOD DATA — UHF42-ALIGNED
 * ====================================================================
 *
 * Based on NYC Department of Health UHF (United Hospital Fund)
 * neighborhood definitions, NYC Community Health Survey 2022 data,
 * and ACS 2020 demographic estimates.
 *
 * Sources:
 *   - NYC DOHMH Community Health Survey 2022 (EpiQuery)
 *   - NYC Chronic Disease Data Portal (diabetes prevalence by UHF)
 *   - ACS 2019-2023 5-Year Estimates via NYC Population FactFinder
 *   - Asian American Federation census data reports
 *
 * Diabetes prevalence = % of adults who have ever been told by a
 *   doctor they have diabetes (CHS 2022).
 * AAPI population = % of total neighborhood population identifying
 *   as Asian alone or in combination (ACS 2020).
 * ====================================================================
 */

export const NYC_NEIGHBORHOODS = [
  // ──────────────────────────────────────────────
  //  QUEENS
  // ──────────────────────────────────────────────
  {
    id: 1,
    name: 'Flushing / Whitestone',
    uhf: 'Northeast Queens',
    borough: 'Queens',
    lat: 40.7654,
    lng: -73.8328,
    diabetesPrevalence: 12.4,
    aapiPopulation: 61.5,
    aapiCount: 148200,
    resources: 14,
    primaryCommunities: ['Chinese', 'Korean', 'South Asian'],
    description: 'The largest Asian American enclave in NYC. Home to a Chinatown rivaling Manhattan\'s in scale, plus dense Korean communities along Northern Blvd. CBWCHC Flushing, SACSS, and multiple Korean-language health providers serve the area.',
  },
  {
    id: 2,
    name: 'Jackson Heights / Elmhurst',
    uhf: 'West Queens',
    borough: 'Queens',
    lat: 40.7487,
    lng: -73.8818,
    diabetesPrevalence: 14.9,
    aapiPopulation: 28.3,
    aapiCount: 57800,
    resources: 9,
    primaryCommunities: ['South Asian', 'Filipino', 'Chinese'],
    description: 'One of the most ethnically diverse ZIP codes in the world. The South Asian population is concentrated along 74th St ("Little India"). NYC Health + Hospitals/Elmhurst is a critical safety-net hospital with extensive AAPI language services.',
  },
  {
    id: 3,
    name: 'Woodside / Sunnyside',
    uhf: 'West Queens',
    borough: 'Queens',
    lat: 40.7442,
    lng: -73.9037,
    diabetesPrevalence: 13.6,
    aapiPopulation: 24.1,
    aapiCount: 31500,
    resources: 6,
    primaryCommunities: ['Filipino', 'Korean', 'Bangladeshi'],
    description: 'Home to one of NYC\'s largest Filipino communities (Little Manila). Also a growing Bangladeshi and Korean population. SAYA! and Adhikaar operate youth and worker advocacy programs here.',
  },
  {
    id: 4,
    name: 'Richmond Hill / South Ozone Park',
    uhf: 'Southwest Queens',
    borough: 'Queens',
    lat: 40.6932,
    lng: -73.8126,
    diabetesPrevalence: 23.0,
    aapiPopulation: 32.7,
    aapiCount: 48100,
    resources: 4,
    primaryCommunities: ['Indo-Caribbean', 'Punjabi Sikh', 'Bangladeshi'],
    description: 'NYC\'s highest diabetes prevalence UHF neighborhood (23%). Home to "Little Guyana" and a large Punjabi Sikh community along Liberty Ave. Severe shortage of AAPI-specific health resources relative to population size and disease burden.',
  },
  {
    id: 5,
    name: 'Jamaica / Hollis',
    uhf: 'Jamaica',
    borough: 'Queens',
    lat: 40.7028,
    lng: -73.7925,
    diabetesPrevalence: 16.8,
    aapiPopulation: 14.7,
    aapiCount: 32600,
    resources: 5,
    primaryCommunities: ['South Asian', 'Indo-Caribbean', 'Filipino'],
    description: 'Major transit hub with high diabetes prevalence (16.8%). AAPI population growing rapidly, especially South Asian and Indo-Caribbean communities. FAHSI and Mekong NYC provide culturally specific services.',
  },
  {
    id: 6,
    name: 'Bayside / Little Neck',
    uhf: 'Northeast Queens',
    borough: 'Queens',
    lat: 40.7681,
    lng: -73.7682,
    diabetesPrevalence: 9.3,
    aapiPopulation: 36.8,
    aapiCount: 44200,
    resources: 7,
    primaryCommunities: ['Korean', 'Chinese', 'South Asian'],
    description: 'Relatively affluent AAPI community with lower diabetes prevalence (9.3%). Korean Community Services (KCS) operates from Bayside. Strong network of private-practice Korean and Chinese language physicians.',
  },
  {
    id: 7,
    name: 'Murray Hill (Queens) / Broadway-Flushing',
    uhf: 'Northeast Queens',
    borough: 'Queens',
    lat: 40.7629,
    lng: -73.8088,
    diabetesPrevalence: 10.8,
    aapiPopulation: 52.4,
    aapiCount: 38700,
    resources: 8,
    primaryCommunities: ['Korean', 'Chinese'],
    description: 'Dense Korean community adjacent to downtown Flushing. The "Koreatown" corridor along Northern Blvd has numerous Korean-language medical clinics and pharmacies. Lower diabetes prevalence than southern Queens neighborhoods.',
  },
  {
    id: 8,
    name: 'Ozone Park / Woodhaven',
    uhf: 'Southwest Queens',
    borough: 'Queens',
    lat: 40.6868,
    lng: -73.8530,
    diabetesPrevalence: 19.2,
    aapiPopulation: 18.6,
    aapiCount: 26900,
    resources: 3,
    primaryCommunities: ['Bangladeshi', 'Indo-Caribbean', 'Pakistani'],
    description: 'High diabetes prevalence (19.2%) with a growing Bangladeshi and Pakistani community. Part of the Southwest Queens UHF area with the highest diabetes rates in the city. Very limited AAPI-specific health infrastructure.',
  },
  {
    id: 9,
    name: 'Fresh Meadows / Briarwood',
    uhf: 'Central Queens',
    borough: 'Queens',
    lat: 40.7332,
    lng: -73.7911,
    diabetesPrevalence: 12.1,
    aapiPopulation: 29.5,
    aapiCount: 35100,
    resources: 4,
    primaryCommunities: ['Chinese', 'Korean', 'South Asian'],
    description: 'Middle-class residential area with significant AAPI population. Moderate diabetes prevalence (12.1%). Residents often access health services in nearby Flushing.',
  },
  {
    id: 10,
    name: 'Astoria / Long Island City',
    uhf: 'Northwest Queens',
    borough: 'Queens',
    lat: 40.7592,
    lng: -73.9196,
    diabetesPrevalence: 10.2,
    aapiPopulation: 12.8,
    aapiCount: 24700,
    resources: 4,
    primaryCommunities: ['Chinese', 'Korean', 'Bangladeshi'],
    description: 'Rapidly growing AAPI population in western Queens. Mount Sinai Queens provides hospital services. AAPI community is dispersed rather than concentrated, making targeted outreach challenging.',
  },
  {
    id: 11,
    name: 'Corona / North Corona',
    uhf: 'West Queens',
    borough: 'Queens',
    lat: 40.7474,
    lng: -73.8603,
    diabetesPrevalence: 15.6,
    aapiPopulation: 15.9,
    aapiCount: 21400,
    resources: 3,
    primaryCommunities: ['Chinese', 'South Asian'],
    description: 'High diabetes prevalence (15.6%) in a diverse, lower-income neighborhood. AAPI residents often face language barriers accessing the predominantly Spanish-language service infrastructure.',
  },

  // ──────────────────────────────────────────────
  //  BROOKLYN
  // ──────────────────────────────────────────────
  {
    id: 12,
    name: 'Sunset Park',
    uhf: 'Southwest Brooklyn',
    borough: 'Brooklyn',
    lat: 40.6454,
    lng: -74.0124,
    diabetesPrevalence: 13.5,
    aapiPopulation: 35.8,
    aapiCount: 46200,
    resources: 7,
    primaryCommunities: ['Chinese', 'Vietnamese', 'Malaysian'],
    description: 'Brooklyn\'s Chinatown, centered along 8th Avenue. The Chinese population here has grown 35% since 2010. NYU Langone Sunset Park FHC and Council of Peoples Organization (COPO) provide bilingual services. Growing Vietnamese community.',
  },
  {
    id: 13,
    name: 'Bensonhurst / Bath Beach',
    uhf: 'Bensonhurst',
    borough: 'Brooklyn',
    lat: 40.6064,
    lng: -73.9958,
    diabetesPrevalence: 10.4,
    aapiPopulation: 38.2,
    aapiCount: 58600,
    resources: 4,
    primaryCommunities: ['Chinese', 'Pakistani', 'Uzbek'],
    description: 'The largest AAPI population in Brooklyn by count (58,600). Heavily Chinese community with a growing Central/South Asian presence. Avenue U corridor has numerous Chinese medical clinics. Diabetes prevalence moderate (10.4%).',
  },
  {
    id: 14,
    name: 'Borough Park / Kensington',
    uhf: 'Borough Park',
    borough: 'Brooklyn',
    lat: 40.6340,
    lng: -73.9900,
    diabetesPrevalence: 12.7,
    aapiPopulation: 15.4,
    aapiCount: 23500,
    resources: 3,
    primaryCommunities: ['Bangladeshi', 'Pakistani', 'Chinese'],
    description: 'Growing Bangladeshi community along Church Avenue corridor (sometimes called "Little Bangladesh"). BACDYS provides education and youth services. Maimonides Medical Center serves as the primary hospital.',
  },
  {
    id: 15,
    name: 'Sheepshead Bay / Gravesend',
    uhf: 'Southern Brooklyn',
    borough: 'Brooklyn',
    lat: 40.5910,
    lng: -73.9496,
    diabetesPrevalence: 11.1,
    aapiPopulation: 22.5,
    aapiCount: 31800,
    resources: 3,
    primaryCommunities: ['Chinese', 'Pakistani', 'Uzbek'],
    description: 'Significant Chinese and Central Asian communities in southern Brooklyn. Limited AAPI-specific health organizations; residents often travel to Bensonhurst or Sunset Park for culturally-competent care.',
  },
  {
    id: 16,
    name: 'East Flatbush / Flatbush',
    uhf: 'East Flatbush',
    borough: 'Brooklyn',
    lat: 40.6510,
    lng: -73.9300,
    diabetesPrevalence: 17.1,
    aapiPopulation: 5.8,
    aapiCount: 9200,
    resources: 2,
    primaryCommunities: ['Indo-Caribbean', 'Bangladeshi'],
    description: 'Very high diabetes prevalence (17.1%) driven by broader community health disparities. Small but growing AAPI community, primarily Indo-Caribbean. Severely underserved for AAPI-specific health resources.',
  },
  {
    id: 17,
    name: 'East New York / Brownsville',
    uhf: 'East New York',
    borough: 'Brooklyn',
    lat: 40.6590,
    lng: -73.8810,
    diabetesPrevalence: 17.1,
    aapiPopulation: 3.2,
    aapiCount: 5100,
    resources: 1,
    primaryCommunities: ['Bangladeshi', 'South Asian'],
    description: 'One of the highest diabetes prevalence areas in NYC (17.1%). Small AAPI community with virtually no AAPI-specific health infrastructure. A critical gap area where outreach is needed.',
  },
  {
    id: 18,
    name: 'Bay Ridge / Dyker Heights',
    uhf: 'Southwest Brooklyn',
    borough: 'Brooklyn',
    lat: 40.6305,
    lng: -74.0228,
    diabetesPrevalence: 10.8,
    aapiPopulation: 14.6,
    aapiCount: 19800,
    resources: 3,
    primaryCommunities: ['Chinese', 'Arab-Asian'],
    description: 'Growing AAPI community in southwest Brooklyn. Arab American Association of NY serves Arab-Asian populations. Moderate diabetes prevalence (10.8%).',
  },

  // ──────────────────────────────────────────────
  //  MANHATTAN
  // ──────────────────────────────────────────────
  {
    id: 19,
    name: 'Chinatown / Lower East Side',
    uhf: 'Lower Manhattan',
    borough: 'Manhattan',
    lat: 40.7158,
    lng: -73.9970,
    diabetesPrevalence: 10.3,
    aapiPopulation: 31.2,
    aapiCount: 42800,
    resources: 16,
    primaryCommunities: ['Chinese', 'Vietnamese', 'Fujianese'],
    description: 'Historic Chinatown — the oldest and densest Chinese community in NYC. Exceptionally well-served by AAPI health infrastructure: CBWCHC (flagship), Hamilton-Madison House, CPC, AAFE, JASSI, and multiple TCM clinics. Lower diabetes prevalence (10.3%) partly reflects strong community health networks.',
  },
  {
    id: 20,
    name: 'East Harlem',
    uhf: 'East Harlem',
    borough: 'Manhattan',
    lat: 40.7942,
    lng: -73.9430,
    diabetesPrevalence: 16.1,
    aapiPopulation: 7.2,
    aapiCount: 8600,
    resources: 2,
    primaryCommunities: ['Chinese', 'South Asian'],
    description: 'Very high diabetes prevalence (16.1%) in a high-poverty neighborhood. Small AAPI community with limited culturally-specific services. Mount Sinai Hospital provides some multilingual care.',
  },
  {
    id: 21,
    name: 'Midtown / Murray Hill (Manhattan)',
    uhf: 'Midtown',
    borough: 'Manhattan',
    lat: 40.7484,
    lng: -73.9756,
    diabetesPrevalence: 7.2,
    aapiPopulation: 18.4,
    aapiCount: 31200,
    resources: 5,
    primaryCommunities: ['Korean', 'Japanese', 'Indian'],
    description: 'Koreatown (32nd St corridor) and a significant Japanese and Indian professional community. Apicha CHC serves AAPI populations. Lowest diabetes prevalence in the city (7.2%) due to younger, higher-income demographics.',
  },
  {
    id: 22,
    name: 'Upper West Side / Central Harlem',
    uhf: 'Central Harlem',
    borough: 'Manhattan',
    lat: 40.8050,
    lng: -73.9660,
    diabetesPrevalence: 16.2,
    aapiPopulation: 4.1,
    aapiCount: 7800,
    resources: 1,
    primaryCommunities: ['South Asian', 'Chinese'],
    description: 'High diabetes prevalence (16.2%) primarily affecting non-AAPI communities. Small AAPI population with virtually no AAPI-specific health resources. Central Harlem Morningside Heights area.',
  },
  {
    id: 23,
    name: 'Lower Manhattan / Financial District',
    uhf: 'Lower Manhattan',
    borough: 'Manhattan',
    lat: 40.7075,
    lng: -74.0021,
    diabetesPrevalence: 8.1,
    aapiPopulation: 15.8,
    aapiCount: 10200,
    resources: 6,
    primaryCommunities: ['Chinese', 'Japanese', 'Korean'],
    description: 'Benefits from proximity to Chinatown health infrastructure. Asian American Federation HQ, CACF, and JASSI all located here. Low diabetes prevalence (8.1%).',
  },

  // ──────────────────────────────────────────────
  //  BRONX
  // ──────────────────────────────────────────────
  {
    id: 24,
    name: 'Hunts Point / Mott Haven',
    uhf: 'Hunts Point - Mott Haven',
    borough: 'Bronx',
    lat: 40.8172,
    lng: -73.8984,
    diabetesPrevalence: 18.2,
    aapiPopulation: 2.8,
    aapiCount: 3800,
    resources: 0,
    primaryCommunities: ['Bangladeshi', 'South Asian'],
    description: 'Highest diabetes prevalence in NYC (18.2%). Very small AAPI population with zero AAPI-specific health resources. A high-priority gap area for diabetes outreach and screening.',
  },
  {
    id: 25,
    name: 'Fordham / Bronx Park',
    uhf: 'Fordham - Bronx Park',
    borough: 'Bronx',
    lat: 40.8614,
    lng: -73.8895,
    diabetesPrevalence: 17.4,
    aapiPopulation: 3.5,
    aapiCount: 5200,
    resources: 1,
    primaryCommunities: ['Bangladeshi', 'South Asian'],
    description: 'Very high diabetes prevalence (17.4%). Small but growing Bangladeshi community. Lincoln Hospital provides safety-net care but limited AAPI language services.',
  },
  {
    id: 26,
    name: 'Pelham / Throgs Neck',
    uhf: 'Pelham - Throgs Neck',
    borough: 'Bronx',
    lat: 40.8289,
    lng: -73.8276,
    diabetesPrevalence: 18.0,
    aapiPopulation: 5.1,
    aapiCount: 7400,
    resources: 1,
    primaryCommunities: ['South Asian', 'Filipino'],
    description: 'Very high diabetes prevalence (18.0%). Moderate AAPI population for the Bronx, but essentially no dedicated AAPI health services. Residents must travel to Queens for culturally-competent care.',
  },
  {
    id: 27,
    name: 'Riverdale / Kingsbridge',
    uhf: 'Kingsbridge - Riverdale',
    borough: 'Bronx',
    lat: 40.8820,
    lng: -73.9100,
    diabetesPrevalence: 11.6,
    aapiPopulation: 6.3,
    aapiCount: 6100,
    resources: 1,
    primaryCommunities: ['South Asian', 'Chinese'],
    description: 'Lower diabetes prevalence for the Bronx (11.6%). Small AAPI community primarily in the more affluent Riverdale section. Limited AAPI-specific services.',
  },

  // ──────────────────────────────────────────────
  //  STATEN ISLAND
  // ──────────────────────────────────────────────
  {
    id: 28,
    name: 'North Shore (Staten Island)',
    uhf: 'Northern Staten Island',
    borough: 'Staten Island',
    lat: 40.6425,
    lng: -74.0780,
    diabetesPrevalence: 12.3,
    aapiPopulation: 11.8,
    aapiCount: 9800,
    resources: 2,
    primaryCommunities: ['Sri Lankan', 'Indian', 'Filipino'],
    description: 'Largest AAPI concentration on Staten Island, including a notable Sri Lankan community (one of the largest outside Sri Lanka). Moderate diabetes prevalence (12.3%). Staten Island University Hospital provides some multilingual services.',
  },
  {
    id: 29,
    name: 'South Shore (Staten Island)',
    uhf: 'Southern Staten Island',
    borough: 'Staten Island',
    lat: 40.5544,
    lng: -74.1502,
    diabetesPrevalence: 9.7,
    aapiPopulation: 7.4,
    aapiCount: 6200,
    resources: 1,
    primaryCommunities: ['Indian', 'Chinese', 'Korean'],
    description: 'Lower diabetes prevalence (9.7%). Smaller, dispersed AAPI community with minimal AAPI-specific health resources. Residents often travel to Brooklyn or Manhattan for culturally-competent care.',
  },
];

/**
 * Separate health resource points for the "Resources" map layer.
 * These are specific clinics, health centers, and organizations
 * that provide healthcare services to AAPI communities.
 */
export const HEALTH_RESOURCES = [
  // ── Clinics & FQHCs ──
  {
    id: 'r1',
    name: 'Charles B. Wang CHC — Chinatown',
    type: 'clinic',
    lat: 40.7178,
    lng: -73.9990,
    address: '268 Canal St, Manhattan',
    languages: ['Mandarin', 'Cantonese', 'Korean', 'Vietnamese'],
    services: ['Primary Care', 'Dental', 'Mental Health', 'Pediatrics', 'Hepatitis B'],
  },
  {
    id: 'r2',
    name: 'Charles B. Wang CHC — Flushing',
    type: 'clinic',
    lat: 40.7590,
    lng: -73.8301,
    address: '136-26 37th Ave, Flushing',
    languages: ['Mandarin', 'Cantonese', 'Korean'],
    services: ['Primary Care', 'Dental', 'Mental Health', 'OB/GYN'],
  },
  {
    id: 'r3',
    name: 'Apicha Community Health Center',
    type: 'clinic',
    lat: 40.7193,
    lng: -73.9927,
    address: '400 Broadway, Manhattan',
    languages: ['Mandarin', 'Cantonese', 'Korean', 'Vietnamese'],
    services: ['Primary Care', 'HIV/PrEP', 'Dental', 'Behavioral Health'],
  },
  {
    id: 'r4',
    name: 'NYU Langone FHC — Sunset Park',
    type: 'clinic',
    lat: 40.6432,
    lng: -74.0084,
    address: '5610 2nd Ave, Brooklyn',
    languages: ['Mandarin', 'Cantonese', 'Spanish'],
    services: ['Primary Care', 'Pediatrics', 'Diabetes Management', 'Mental Health'],
  },

  // ── Hospitals with AAPI language services ──
  {
    id: 'r5',
    name: 'NYC H+H/Elmhurst',
    type: 'hospital',
    lat: 40.7440,
    lng: -73.8840,
    address: '79-01 Broadway, Elmhurst',
    languages: ['Mandarin', 'Cantonese', 'Bengali', 'Hindi', 'Korean', 'Urdu'],
    services: ['Emergency', 'Inpatient', 'Diabetes Center', 'Interpreter Services'],
  },
  {
    id: 'r6',
    name: 'Flushing Hospital Medical Center',
    type: 'hospital',
    lat: 40.7560,
    lng: -73.8290,
    address: '4500 Parsons Blvd, Flushing',
    languages: ['Mandarin', 'Korean', 'Hindi', 'Bengali'],
    services: ['Emergency', 'Asian Behavioral Health Program', 'Diabetes Screening'],
  },
  {
    id: 'r7',
    name: 'NewYork-Presbyterian Queens',
    type: 'hospital',
    lat: 40.7585,
    lng: -73.8229,
    address: '56-45 Main St, Flushing',
    languages: ['Mandarin', 'Korean', 'Hindi', 'Bengali', 'Urdu'],
    services: ['Emergency', 'Inpatient', 'Interpreter Services', 'Diabetes Center'],
  },
  {
    id: 'r8',
    name: 'Maimonides Medical Center',
    type: 'hospital',
    lat: 40.6364,
    lng: -73.9962,
    address: '4802 10th Ave, Brooklyn',
    languages: ['Mandarin', 'Cantonese', 'Urdu', 'Bengali'],
    services: ['Emergency', 'Inpatient', 'Diabetes Center'],
  },
  {
    id: 'r9',
    name: 'Mount Sinai Queens',
    type: 'hospital',
    lat: 40.7727,
    lng: -73.9092,
    address: '25-10 30th Ave, Astoria',
    languages: ['Mandarin', 'Korean', 'Hindi'],
    services: ['Emergency', 'Inpatient', 'Outpatient Clinics'],
  },

  // ── Community Organizations with health programs ──
  {
    id: 'r10',
    name: 'SACSS — Health Navigation',
    type: 'community',
    lat: 40.7577,
    lng: -73.8302,
    address: '143-06 45th Ave, Flushing',
    languages: ['Bengali', 'Hindi', 'Urdu', 'Nepali', 'Punjabi'],
    services: ['Health Insurance Navigation', 'Medicaid/Medicare', 'Diabetes Education'],
  },
  {
    id: 'r11',
    name: 'Korean Community Services (KCS)',
    type: 'community',
    lat: 40.7688,
    lng: -73.7773,
    address: '203-05 32nd Ave, Bayside',
    languages: ['Korean'],
    services: ['Mental Health', 'Senior Health', 'Health Screening'],
  },
  {
    id: 'r12',
    name: 'Hamilton-Madison House',
    type: 'community',
    lat: 40.7114,
    lng: -73.9872,
    address: '253 South St, Manhattan',
    languages: ['Mandarin', 'Cantonese', 'Fujianese'],
    services: ['Behavioral Health', 'Senior Health', 'Home Health Aide'],
  },
  {
    id: 'r13',
    name: 'India Home — Senior Health',
    type: 'community',
    lat: 40.7447,
    lng: -73.8964,
    address: '40-07 73rd St, Woodside',
    languages: ['Hindi', 'Bengali', 'Urdu', 'Gujarati'],
    services: ['Senior Health Screening', 'Mental Health', 'Diabetes Awareness'],
  },
  {
    id: 'r14',
    name: 'Adhikaar — Worker Health',
    type: 'community',
    lat: 40.7450,
    lng: -73.8953,
    address: '71-07 Woodside Ave, Woodside',
    languages: ['Nepali', 'Tibetan', 'Hindi'],
    services: ['Occupational Health', 'Health Insurance Enrollment', 'Health Education'],
  },
  {
    id: 'r15',
    name: 'COPO — Sunset Park Health Access',
    type: 'community',
    lat: 40.6444,
    lng: -74.0129,
    address: '5008 5th Ave, Brooklyn',
    languages: ['Urdu', 'Arabic', 'Bengali', 'Pashto'],
    services: ['Health Screening', 'Insurance Navigation', 'Diabetes Education'],
  },
  {
    id: 'r16',
    name: 'CPC — Health Programs',
    type: 'community',
    lat: 40.7190,
    lng: -73.9955,
    address: '150 Elizabeth St, Manhattan',
    languages: ['Mandarin', 'Cantonese', 'Fujianese'],
    services: ['Senior Health', 'Health Education', 'Benefits Enrollment'],
  },
  {
    id: 'r17',
    name: 'FAHSI — Filipino Health',
    type: 'community',
    lat: 40.7090,
    lng: -73.7832,
    address: '185-14 Hillside Ave, Jamaica',
    languages: ['Tagalog', 'Ilocano'],
    services: ['Mental Health', 'Senior Health', 'Health Screening'],
  },
  {
    id: 'r18',
    name: 'Kalusugan Coalition',
    type: 'community',
    lat: 40.7441,
    lng: -73.9843,
    address: '27 Madison Ave, Manhattan',
    languages: ['Tagalog'],
    services: ['Health Education', 'Diabetes Prevention', 'Community Health Workers'],
  },
  {
    id: 'r19',
    name: 'Health First — Multilingual Enrollment',
    type: 'community',
    lat: 40.7128,
    lng: -74.0092,
    address: '100 Church St, Manhattan',
    languages: ['Mandarin', 'Korean', 'Bengali', 'Hindi', 'Urdu'],
    services: ['Insurance Enrollment', 'Health Plan Navigation'],
  },
  {
    id: 'r20',
    name: 'Sapna NYC — Health & Safety',
    type: 'community',
    lat: 40.7451,
    lng: -73.9016,
    address: '57-07 Woodside Ave, Woodside',
    languages: ['Hindi', 'Urdu', 'Bengali', 'Punjabi', 'Nepali'],
    services: ['Mental Health', 'Trauma Care', 'Health Referrals'],
  },
];
