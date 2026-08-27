const NYS_HEALTH_DATA_URL = 'https://health.data.ny.gov/resource/vn5v-hh5r.json';

const FIELDS = [
  'fac_id', 'facility_name', 'fac_desc_short', 'description', 'address1',
  'city', 'state', 'fac_zip', 'fac_phone', 'county', 'ownership_type',
  'latitude', 'longitude',
].join(',');

export async function getNysHospitals(signal) {
  const url = new URL(NYS_HEALTH_DATA_URL);
  url.searchParams.set('$select', FIELDS);
  url.searchParams.set('$where', "fac_desc_short='HOSP' AND latitude IS NOT NULL AND longitude IS NOT NULL");
  url.searchParams.set('$order', 'facility_name ASC');
  url.searchParams.set('$limit', '500');

  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`NYS Health Data API error: ${response.status}`);

  const records = await response.json();
  return records.map((record) => ({
    id: record.fac_id,
    name: record.facility_name,
    type: record.description || 'Hospital',
    address: [record.address1, record.city, record.state, record.fac_zip].filter(Boolean).join(', '),
    city: record.city || '',
    county: record.county || '',
    phone: record.fac_phone || '',
    ownership: record.ownership_type || '',
    lat: Number(record.latitude),
    lng: Number(record.longitude),
    _type: 'nysHospital',
  })).filter((hospital) => Number.isFinite(hospital.lat) && Number.isFinite(hospital.lng));
}

export function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : phone;
}
