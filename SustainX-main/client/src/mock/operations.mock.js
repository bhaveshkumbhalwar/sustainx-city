// MOCK DATA — vehicles, routes, hotspot areas, recommendations.
// Clearly separated from real API services.
// Backend does not expose these endpoints. When endpoints are added later,
// replace this file with a real service adapter.

import { wardLabel } from '../lib/geography';

// Vehicles — not backed by any endpoint. Demo only.
export const MOCK_VEHICLES = [
  { id: 'GV-001', type: 'Compactor', driver: 'Rahul Singh', status: 'active', capacity: '8 tonnes', fuel: 72, block: 'A', route: 'R-101' },
  { id: 'GV-002', type: 'Tipper', driver: 'Anita Sharma', status: 'active', capacity: '3 tonnes', fuel: 58, block: 'B', route: 'R-102' },
  { id: 'GV-003', type: 'Refuse Collector', driver: 'Manoj Kumar', status: 'idle', capacity: '6 tonnes', fuel: 85, block: null, route: null },
  { id: 'GV-004', type: 'Mini Dumper', driver: 'Priya Nair', status: 'maintenance', capacity: '1.5 tonnes', fuel: 30, block: null, route: null },
];

export const MOCK_ROUTES = [
  { id: 'R-101', name: 'Ward A Sweep', stops: 12, distance: '18.4 km', vehicle: 'GV-001', status: 'active' },
  { id: 'R-102', name: 'Ward B Sweep', stops: 9, distance: '12.1 km', vehicle: 'GV-002', status: 'active' },
];

export const MOCK_HOTSPOTS = [
  { id: 'HS-1', ward: 'A', location: 'Main Road Junction', count: 14, trend: 'stable', wasteType: 'Mixed', severity: 'High' },
  { id: 'HS-2', ward: 'C', location: 'Park Entry Gate', count: 9, trend: 'up', wasteType: 'Food', severity: 'Medium' },
  { id: 'HS-3', ward: 'E', location: 'Market Entrance', count: 7, trend: 'down', wasteType: 'Mixed', severity: 'Low' },
];

export const MOCK_AI_RECOMMENDATIONS = [
  { id: 1, title: 'Ward A may need additional collection capacity tomorrow', type: 'collection', severity: 'info' },
  { id: 2, title: '3 bins show high overflow risk in next 6 hours', type: 'prediction', severity: 'warning' },
  { id: 3, title: 'Complaint volume increased 28% this week in Ward C', type: 'trend', severity: 'info' },
  { id: 4, title: 'Collector GV-003 has been idle for >2 hours', type: 'operations', severity: 'warning' },
];

// Ward-level stat badges derived from real complaint stats where possible.
// When not yet exposed by backend, marked as demo.
export const MOCK_WARD_PERFORMANCE = [
  { ward: 'A', label: wardLabel('A'), resolved: 24, pending: 6, collectionEff: 88, satisfaction: 92 },
  { ward: 'B', label: wardLabel('B'), resolved: 19, pending: 3, collectionEff: 91, satisfaction: 89 },
  { ward: 'C', label: wardLabel('C'), resolved: 16, pending: 9, collectionEff: 78, satisfaction: 85 },
  { ward: 'D', label: wardLabel('D'), resolved: 21, pending: 4, collectionEff: 86, satisfaction: 90 },
  { ward: 'E', label: wardLabel('E'), resolved: 11, pending: 5, collectionEff: 82, satisfaction: 84 },
];

// Demo analytics data when no analytics API exists.
// Each chart already has its own mock in-page; this module provides shared constants.
export const DEMO_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default { MOCK_VEHICLES, MOCK_ROUTES, MOCK_HOTSPOTS, MOCK_AI_RECOMMENDATIONS, MOCK_WARD_PERFORMANCE };