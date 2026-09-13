import { STATUS_META, normalizeStatus } from '../../adapters/complaint.adapter';
import Badge from './Badge';

const TONE_BY_STATUS = {
  pending: 'info',
  'in-progress': 'warning',
  completed: 'success',
  rejected: 'danger',
};

export default function StatusBadge({ status, label }) {
  const s = normalizeStatus(status);
  const meta = STATUS_META[s] || STATUS_META.pending;
  return (
    <Badge tone={TONE_BY_STATUS[s] || 'neutral'} dot>
      {label || meta.label}
    </Badge>
  );
}