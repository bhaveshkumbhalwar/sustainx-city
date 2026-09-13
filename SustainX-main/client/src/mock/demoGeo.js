// DEMO-ONLY representative coordinates.
// The backend does not provide GPS coordinates for most records, so the map
// panels place markers at these DEMO positions to demonstrate the GIS layout.
// These are NOT actual GPS fixes and are labeled as such in the UI.

const BASE = { lng: 72.8777, lat: 19.076 }; // generic central point placeholder

const WARD_DEMO = {
  A: { lat: 19.056, lng: 72.856, name: 'Ward A Representative Point' },
  B: { lat: 19.086, lng: 72.886, name: 'Ward B Representative Point' },
  C: { lat: 19.101, lng: 72.851, name: 'Ward C Representative Point' },
  D: { lat: 19.046, lng: 72.906, name: 'Ward D Representative Point' },
  E: { lat: 19.121, lng: 72.911, name: 'Ward E Representative Point' },
};

// Pick a demo coordinate for a ward/block code. Returns null when unknown.
export function demoCoordForWard(code) {
  if (!code) return { ...BASE, name: 'City Representative Point' };
  const c = WARD_DEMO[String(code).toUpperCase()];
  return c ? { ...c } : null;
}

// Convert complaint/bin to a marker entry or null when no coordinate exists.
export function coordFromRecord(record) {
  if (record && record.locationData && Number.isFinite(record.locationData.lat) && Number.isFinite(record.locationData.lng)) {
    return { lat: record.locationData.lat, lng: record.locationData.lng, real: true };
  }
  return null;
}

export default { demoCoordForWard, coordFromRecord, BASE };