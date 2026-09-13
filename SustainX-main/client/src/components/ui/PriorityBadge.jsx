import Badge from './Badge';

export default function PriorityBadge({ level = 'normal', label }) {
  const map = {
    low: ['neutral', 'Low'],
    normal: ['info', 'Normal'],
    medium: ['warning', 'Medium'],
    high: ['high', 'High'],
    critical: ['danger', 'Critical'],
  };
  const [tone, defaultLabel] = map[level] || map.normal;
  return <Badge tone={tone} icon="!" className="priority-badge">{label || defaultLabel}</Badge>;
}