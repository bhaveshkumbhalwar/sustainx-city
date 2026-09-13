// Lightweight SVG donut chart with a legend. segments: [{label, value, tone}]
export default function DonutChart({ segments = [], size = 160, thickness = 22, center, valueFormatter = (v) => v }) {
  if (!segments.length) return null;
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              className={`chart-donut chart-donut-${s.tone || 'primary'}`}
              strokeWidth={thickness}
              strokeDasharray={`${Math.max(dash - 2, 0)} ${circ}`}
              strokeDashoffset={-offset}
            >
              <title>{`${s.label}: ${valueFormatter(s.value)}`}</title>
            </circle>
          );
          offset += dash;
          return el;
        })}
        <circle cx={c} cy={c} r={r - thickness * 0.6} className="chart-donut-hole" />
      </svg>
      <div className="donut-center">
        <div className="donut-center-value">{center ?? valueFormatter(total)}</div>
        <div className="donut-center-label">Total</div>
      </div>
      <div className="donut-legend">
        {segments.map((s, i) => (
          <div className="donut-legend-item" key={i}>
            <span className={`legend-dot legend-dot-${s.tone || 'primary'}`} />
            <span className="legend-label">{s.label}</span>
            <span className="legend-value">{valueFormatter(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}