import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { getDashboardStats, getComplaints } from '../../services/api';
import { toComplaintsUi } from '../../adapters/complaint.adapter';
import { MOCK_AI_RECOMMENDATIONS } from '../../mock/operations.mock';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import DonutChart from '../../components/charts/DonutChart';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Icon from '../../components/ui/Icon';
import { formatNumber } from '../../lib/format';

export default function ControlRoom() {
  const { data: stats, loading } = useFetch(getDashboardStats);
  const { data: rawComplaints, loading: cl } = useFetch(getComplaints);

  const s = stats || {};
  const oa = s.orderAnalytics || {};
  const complaints = rawComplaints ? toComplaintsUi(rawComplaints) : [];
  const recent = [...complaints].slice(0, 6);

  const statusSegments = [
    { label: 'Pending', value: s.pending || 0, tone: 'info' },
    { label: 'In Progress', value: s.progress || 0, tone: 'warning' },
    { label: 'Resolved', value: s.done || 0, tone: 'success' },
  ];

  return (
    <>
      <PageHeader
        title="Control Room"
        subtitle="City-wide waste operations at a glance."
        icon="shield"
        actions={
          <div className="u-flex u-wrap">
            <Link to="/admin/complaints" className="btn btn-ghost btn-sm">Complaints</Link>
            <Link to="/admin/analytics" className="btn btn-primary btn-sm"><Icon name="chart" size={15} /> Analytics</Link>
          </div>
        }
      />

      <div className="stat-grid">
        <StatCard icon="list" label="Total reports" value={loading ? null : formatNumber(s.total)} tone="info" loading={loading} />
        <StatCard icon="clock" label="Pending" value={loading ? null : formatNumber(s.pending)} tone="warning" loading={loading} />
        <StatCard icon="activity" label="In progress" value={loading ? null : formatNumber(s.progress)} tone="info" loading={loading} />
        <StatCard icon="check" label="Resolved" value={loading ? null : formatNumber(s.done)} tone="success" loading={loading} />
        <StatCard icon="users" label="Citizens" value={loading ? null : formatNumber(s.students)} loading={loading} />
        <StatCard icon="truck" label="Collectors" value={loading ? null : formatNumber(s.collectors)} loading={loading} />
      </div>

      <div className="u-grid-2 u-mt-2">
        <SectionCard title="Status breakdown">
          <DonutChart
            segments={statusSegments}
            center={loading ? '…' : formatNumber(s.total)}
            valueFormatter={formatNumber}
          />
        </SectionCard>

        <SectionCard title="Order analytics" subtitle={oa.total ? `${oa.completionRate}% completion rate` : 'No order data'}>
          <div className="stat-grid">
            <StatCard icon="package" label="Total orders" value={formatNumber(oa.total)} tone="info" />
            <StatCard icon="check" label="Delivered" value={formatNumber(oa.delivered)} tone="success" />
            <StatCard icon="alert-triangle" label="Failed verifications" value={formatNumber(oa.failedAttempts)} tone="danger" />
          </div>
        </SectionCard>
      </div>

      <div className="u-grid-2 u-mt-2">
        <SectionCard
          title="Recent complaints"
          actions={<Link to="/admin/complaints" className="btn btn-ghost btn-sm">View all <Icon name="chevronRight" size={14} /></Link>}
          pad={false}
        >
          {cl ? (
            <div className="section-card-body"><div className="skeleton skeleton-rect" /></div>
          ) : recent.length === 0 ? (
            <p style={{ padding: '1rem', color: 'var(--txt-muted)' }}>No complaints.</p>
          ) : (
            <ul className="complaint-mini-list">
              {recent.map((c) => (
                <li key={c.id} className="complaint-mini-item">
                  <div className="complaint-mini-main">
                    <div className="complaint-mini-title">{c.id}</div>
                    <div className="complaint-mini-meta">{c.ward} · {c.wasteType}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="AI Insights"
          subtitle={<><Badge tone="warning">Demo</Badge> Recommendations are illustrative</>}
        >
          <div className="ai-cards">
            {MOCK_AI_RECOMMENDATIONS.map((r) => (
              <div key={r.id} className="ai-card">
                <Icon name={r.type === 'prediction' ? 'cpu' : r.type === 'trend' ? 'chart' : 'activity'} size={18} />
                <div className="ai-card-body">
                  <div className="ai-card-text">{r.title}</div>
                  <Badge tone={r.severity === 'warning' ? 'warning' : 'info'}>{r.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}