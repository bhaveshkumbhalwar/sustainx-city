// Smart bin adapters.
// Bin "level" is OBSERVED sensor data. Predictions are never presented as
// readings — the prediction adapter returns clearly-labeled estimates.

import { wardLabel, zoneOf } from '../lib/geography';
import { timeAgo } from '../lib/format';
import { clampPct } from '../lib/format';

export const BIN_STATES = [
  { max: 50, tone: 'success', label: 'Normal' },
  { max: 70, tone: 'warning', label: 'Getting Full' },
  { max: 85, tone: 'high', label: 'High Fill' },
  { max: 101, tone: 'danger', label: 'Overflow Risk' },
];

export function binState(level) {
  const pct = clampPct(level);
  return BIN_STATES.find((s) => pct <= s.max) || BIN_STATES[BIN_STATES.length - 1];
}

// Estimate interpolation for display purposes at +/-15 min (data updates).
export function needsCollection(bin) {
  return clampPct(bin?.level) >= 80;
}

export function toBinUi(raw) {
  const level = clampPct(raw?.level);
  return {
    ...raw,
    id: raw?.binId,
    level,
    state: binState(level),
    ward: wardLabel(raw?.block),
    zone: zoneOf(raw?.block),
    updatedLabel: timeAgo(raw?.lastUpdated || raw?.updatedAt),
    needsCollection: needsCollection(raw),
  };
}

export function toBinsUi(list) {
  return (list || []).map(toBinUi);
}

// Cautious fill prediction. Clearly labeled as ESTIMATED, derived from the
// most recent observed readings. Not a real ML model — kept in a mock module.
export function predictFill(bin) {
  const level = clampPct(bin?.level);
  if (level < 40) return null;
  const hoursTo80 = Math.max(1, Math.round((80 - level) / 4));
  const risk = level >= 85 ? 'High' : level >= 70 ? 'Medium' : 'Low';
  return {
    level,
    estimatedLevel: Math.min(100, level + 10),
    estimatedIn: level >= 80 ? 0 : hoursTo80,
    risk,
    source: 'demo',
  };
}