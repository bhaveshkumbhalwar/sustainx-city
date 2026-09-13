import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getComplaints, getDashboardStats } from '../../services/api';
import { toComplaintsUi } from '../../adapters/complaint.adapter';
import { wards } from '../../lib/geography';
import { DEMO_LABELS, MOCK_WARD_PERFORMANCE } from '../../mock/operations.mock';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import ChartCard from '../../components/charts/ChartCard';
import BarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import LineChart from '../../components/charts/LineChart';

export default function AdminAnalytics() {
  const { data: raw } = useFetch(getComplaints);
  const { data: stats } = useFetch(getDashboardStats);

  const complaints = useMemo(() => toComplaintsUi(raw), [raw]);
  const s = stats || {};

  const wardBarPoints = wards().map((w) => ({
    label: w.code,
    value: complaints.filter((c) => c.block === w.code).length,
    tone: 'primary',
  }));

  const statusSegments = [
    { label: 'Pending', value: s.pending || 0, tone: 'info' },
    { label: 'In Progress', value: s.progress || 0, tone: 'warning' },
    { label: 'Resolved', value: s.done || 0, tone: 'success' },
  ];

  // Weekly trend: illustrative — deterministic demo pattern, not live data.
  const weeklyLinePoints = DEMO_LABELS.map((label, i) => ({
    label,
    value: [14, 12, 16, 11, 18, 15, 13][i] ?? 13,
  }));

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Aggregated waste metrics across the city."
        icon="chart"
        actions={<Badge tone="warning">Charts are illustrative where noted</Badge>}
      />

      <div className="stat-grid u-mb-1">
        <StatCard icon="list" label="Total reports" value={s.total ?? 0} loading={!stats} tone="info" />
        <StatCard icon="clock" label="Open (pending + in-progress)" value={(s.pending || 0) + (s.progress || 0)} loading={!stats} tone="warning" />
        <StatCard icon="check" label="Resolved" value={s.done || 0} loading={!stats} tone="success" />
        <StatCard icon="package" label="Orders delivered" value={s.orderAnalytics?.delivered ?? 0} loading={!stats} />
      </div>

      <div className="u-grid-2 u-mt-1">
        <ChartCard title="Reports by ward" subtitle="Live complaint count">
          <BarChart points={wardBarPoints} valueFormatter={(v) => String(v)} name="reports per ward" />
        </ChartCard>

        <ChartCard title="Status breakdown">
          <DonutChart segments={statusSegments} valueFormatter={(v) => String(v)} center={String(s.total || 0)} />
        </ChartCard>
      </div>

      <div className="u-grid-2 u-mt-1">
        <ChartCard
          title="Weekly complaint trend"
          subtitle={<><Badge tone="warning">Demo</Badge> Illustrative pattern</>}
        >
          <LineChart points={weeklyLinePoints} valueFormatter={(v) => String(v)} name="weekly trend" />
        </ChartCard>

        <SectionCard title="Ward performance snapshot" subtitle={<><Badge tone="warning">Demo</Badge> Efficiency and satisfaction figures</>}>
          <div className="bin-list">
            {MOCK_WARD_PERFORMANCE.map((w) => (
              <div className="ward-perf-row" key={w.ward}>
                <span className="ward-perf-name">Ward {w.label}</span>
                <div className="ward-perf-stats">
                  <Badge tone="success">{w.resolved} resolved</Badge>
                  <Badge tone="warning">{w.pending} open</Badge>
                  <span className="ward-perf-score">Efficiency {w.collectionEff}% · Satisfaction {w.satisfaction}%</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}