import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getDashboardStats, getComplaints, getIotBinData } from '../../services/api';
import { toComplaintsUi } from '../../adapters/complaint.adapter';
import { toBinsUi, needsCollection } from '../../adapters/bin.adapter';
import { wardLabel } from '../../lib/geography';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ProgressBar from '../../components/ui/ProgressBar';
import Icon from '../../components/ui/Icon';
import { Link } from 'react-router-dom';
import { formatNumber } from '../../lib/format';

export default function CollectorHome() {
  const { user } = useAuth();
  const stats = useFetch(getDashboardStats);
  const complaints = useFetch(getComplaints);
  const bins = useFetch(getIotBinData);

  const s = stats.data || {};
  const ward = wardLabel(user?.block);
  const myComplaints = complaints.data ? toComplaintsUi(complaints.data) : [];
  const recent = [...myComplaints].slice(0, 5);
  const allBins = bins.data ? toBinsUi(bins.data) : [];
  const blockBins = allBins.filter((b) => String(b.block).toUpperCase() === String(user?.block).toUpperCase());
  const alerts = blockBins.filter(needsCollection);

  return (
    <>
      <PageHeader
        title="Field overview"
        subtitle={`Operations for ${ward}`}
        icon="dashboard"
        actions={
          <Link to="/collector/tasks" className="btn btn-primary btn-sm">
            <Icon name="clipboard" size={16} /> View tasks
          </Link>
        }
      />

      <div className="stat-grid">
        <StatCard icon="list" label="Ward reports" value={stats.loading ? null : formatNumber(s.total)} tone="info" loading={stats.loading} />
        <StatCard icon="clock" label="New (pending)" value={stats.loading ? null : formatNumber(s.pending)} tone="warning" loading={stats.loading} />
        <StatCard icon="activity" label="In progress" value={stats.loading ? null : formatNumber(s.progress)} tone="info" loading={stats.loading} />
        <StatCard icon="check" label="Resolved" value={stats.loading ? null : formatNumber(s.done)} tone="success" loading={stats.loading} />
      </div>

      <div className="u-grid-2 u-mt-2">
        <SectionCard
          title="Latest tasks"
          subtitle="Recent complaints in your ward"
          actions={
            <Link to="/collector/tasks" className="btn btn-ghost btn-sm">
              Open tasks <Icon name="chevronRight" size={14} />
            </Link>
          }
          pad={false}
        >
          {complaints.loading ? (
            <div className="section-card-body">
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
            </div>
          ) : recent.length === 0 ? (
            <EmptyState icon="check" title="Ward is clear" description="No active reports at the moment." />
          ) : (
            <ul className="complaint-mini-list">
              {recent.map((c) => (
                <li key={c.id} className="complaint-mini-item">
                  <div className="complaint-mini-main">
                    <div className="complaint-mini-title">{c.id}</div>
                    <div className="complaint-mini-meta">{c.location || c.wasteType}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Ward bin alerts"
          subtitle="Bins needing attention in your ward"
          actions={
            <Link to="/collector/bins" className="btn btn-ghost btn-sm">
              All bins <Icon name="chevronRight" size={14} />
            </Link>
          }
        >
          {bins.loading ? (
            <div className="skeleton skeleton-rect" style={{ height: 70 }} />
          ) : alerts.length === 0 ? (
            <EmptyState icon="trash" title="All bins normal" description="No high-fill alerts in your ward right now." />
          ) : (
            <div className="bin-list">
              {alerts.slice(0, 4).map((b) => (
                <div className="bin-row" key={b.id}>
                  <div className="bin-row-head">
                    <span className="bin-row-name">Bin {b.binId}</span>
                    <Badge tone={b.state.tone} dot>{b.state.label}</Badge>
                  </div>
                  <ProgressBar value={b.level} tone={b.state.tone} label={`${b.binId} fill level`} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}