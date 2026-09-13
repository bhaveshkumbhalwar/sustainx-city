// API → UI adapters.
// Keeps presentation components free of raw API shapes and of backend
// quirks (e.g. "in_progress" vs "in-progress").

import { wardLabel, zoneOf } from '../lib/geography';
import { timeAgo } from '../lib/format';

export const STATUS_META = {
  pending: { label: 'Submitted', tone: 'info', order: 0 },
  'in-progress': { label: 'In Progress', tone: 'warning', order: 1 },
  in_progress: { label: 'In Progress', tone: 'warning', order: 1 },
  completed: { label: 'Resolved', tone: 'success', order: 2 },
  rejected: { label: 'Rejected', tone: 'danger', order: 3 },
};

// Normalized single source for a complaint status.
export function normalizeStatus(status) {
  if (!status) return 'pending';
  if (status === 'in_progress') return 'in-progress';
  return status;
}

export function statusLabel(status) {
  const m = STATUS_META[normalizeStatus(status)];
  return m ? m.label : status || '—';
}

// Priority is DERIVED from real data only. No invented AI.
// - IoT alerts / near-full smart bins -> elevated priority
// - Fresh + unresolved -> normal
export function derivePriority(c) {
  if (c && c.type === 'iot') return 'high';
  if (c && c.binId) return 'high';
  const ageHours = c && c.createdAt ? (Date.now() - new Date(c.createdAt).getTime()) / 3600000 : 0;
  if (statusOpen(c) && ageHours > 48) return 'high';
  return 'normal';
}

export function statusOpen(c) {
  const s = normalizeStatus(c?.status);
  return s !== 'completed' && s !== 'rejected';
}

export function toComplaintUi(raw) {
  const status = normalizeStatus(raw?.status);
  return {
    ...raw,
    id: raw?.complaintId,
    status,
    priority: derivePriority(raw),
    ward: wardLabel(raw?.block),
    zone: zoneOf(raw?.block),
    block: raw?.block || null,
    createdLabel: timeAgo(raw?.createdAt),
    description: raw?.description || '',
    location: raw?.location || '—',
  };
}

export function toComplaintsUi(list) {
  return (list || []).map(toComplaintUi);
}

// Complaint type label (backend type: complaint / scan / iot)
export function sourceLabel(type) {
  switch (type) {
    case 'iot':
      return 'Smart Bin';
    case 'scan':
      return 'Bin Scan';
    default:
      return 'Citizen Report';
  }
}