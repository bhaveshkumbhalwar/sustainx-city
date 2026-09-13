import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getIotBinData } from '../../services/api';
import { toBinsUi } from '../../adapters/bin.adapter';
import { wardLabel } from '../../lib/geography';
import { demoCoordForWard } from '../../mock/demoGeo';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import MapContainer from '../../components/maps/MapContainer';

export default function CollectorBins() {
  const { user } = useAuth();
  const ward = wardLabel(user?.block);
  const { data, loading } = useFetch(getIotBinData);
  const bins = useMemo(() => toBinsUi(data), [data]);
  const blockBins = bins.filter((b) => String(b.block).toUpperCase() === String(user?.block).toUpperCase());
  const total = blockBins.length;
  const high = blockBins.filter((b) => b.level >= 70).length;
  const overflow = blockBins.filter((b) => b.level >= 85).length;

  const markers = blockBins.map((b) => {
    const geo = demoCoordForWard(b.block);
    return { id: b.id, lat: geo?.lat, lng: geo?.lng, tone: b.state.tone, popup: { title: `Bin ${b.binId}`, desc: `${b.state.label} · ${b.level}%` } };
  });

  return (
    <>
      <PageHeader title="Ward bin alerts" subtitle={`Smart bins in ${ward}`} icon="trash" />

      <div className="stat-grid u-mb-1">
        <StatCard icon="trash" label="Total bins" value={total} loading={loading} />
        <StatCard icon="alert-triangle" label="High fill (≥70%)" value={high} loading={loading} tone={high ? 'warning' : 'neutral'} />
        <StatCard icon="alert-triangle" label="Overflow risk" value={overflow} loading={loading} tone={overflow ? 'danger' : 'neutral'} />
      </div>

      <MapContainer markers={markers} title={`${ward} bins`} height={340} />

      <SectionCard title="All bins" className="u-mt-1">
        {loading ? (
          <div className="bin-list">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-rect" style={{ height: 60 }} />)}
          </div>
        ) : blockBins.length === 0 ? (
          <EmptyState icon="trash" title="No readings" description="No IoT data for your ward yet." />
        ) : (
          <div className="bin-list">
            {blockBins.map((b) => (
              <div className="bin-row" key={b.id}>
                <div className="bin-row-head">
                  <span className="bin-row-name">Bin {b.binId}</span>
                  <Badge tone={b.state.tone} dot>{b.state.label}</Badge>
                </div>
                <div className="bin-row-meta">Updated {b.updatedLabel}</div>
                <div className="bin-level-row">
                  <ProgressBar value={b.level} tone={b.state.tone} label={`${b.binId} fill level`} />
                  <span className="bin-level-pct">{b.level}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}