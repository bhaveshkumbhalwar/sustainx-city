import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getIotBinData } from '../../services/api';
import { toBinsUi } from '../../adapters/bin.adapter';
import { demoCoordForWard } from '../../mock/demoGeo';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import MapContainer from '../../components/maps/MapContainer';

export default function NearbyBins() {
  const { data, loading, error, refetch } = useFetch(getIotBinData);

  const bins = useMemo(() => toBinsUi(data), [data]);
  const total = bins.length;
  const high = bins.filter((b) => b.level >= 70).length;
  const overflow = bins.filter((b) => b.level >= 85).length;

  const markers = useMemo(
    () =>
      bins.map((b) => {
        const geo = demoCoordForWard(b.block);
        return {
          id: b.id,
          lat: geo?.lat,
          lng: geo?.lng,
          tone: b.state.tone,
          label: `Bin ${b.binId} — ${b.level}%`,
          popup: { title: `Bin ${b.binId}`, desc: `${b.state.label} · ${b.ward} · ${b.level}%` },
        };
      }),
    [bins],
  );

  return (
    <>
      <PageHeader title="Smart bins" subtitle="Observed fill levels from connected devices across all wards." icon="trash" />

      <div className="stat-grid u-mb-1">
        <StatCard icon="trash" label="Total bins" value={total} loading={loading} />
        <StatCard icon="alert-triangle" label="High fill (≥70%)" value={high} loading={loading} tone={high ? 'warning' : 'neutral'} />
        <StatCard icon="alert-triangle" label="Overflow risk (≥85%)" value={overflow} loading={loading} tone={overflow ? 'danger' : 'neutral'} />
      </div>

      <MapContainer markers={markers} title="Bin map" height={360} />

      <SectionCard title="All bins" className="u-mt-1">
        {loading ? (
          <div className="bin-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton skeleton-rect" style={{ height: 60 }} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : bins.length === 0 ? (
          <EmptyState
            icon="trash"
            title="No bin data"
            description="Connect IoT devices or wait for readings to appear here."
          />
        ) : (
          <div className="bin-list">
            {bins.map((b) => (
              <div className="bin-row" key={b.id}>
                <div className="bin-row-head">
                  <span className="bin-row-name">Bin {b.binId}</span>
                  <Badge tone={b.state.tone} dot>
                    {b.state.label}
                  </Badge>
                </div>
                <div className="bin-row-meta">
                  {b.ward} · updated {b.updatedLabel}
                </div>
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