import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useGeoIndex } from '../../hooks/useGeo';
import { getBins, getIotBinData } from '../../services/api';
import { toBinsUi, mergeBinLevels } from '../../adapters/bin.adapter';
import { coordForBin } from '../../services/geo';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import DataTable from '../../components/ui/DataTable';
import MapContainer from '../../components/maps/MapContainer';

export default function AdminBins() {
  const { data: register, loading: regLoading } = useFetch(getBins);
  const { data: readings, loading: readLoading } = useFetch(getIotBinData);
  const geo = useGeoIndex();

  const loading = regLoading || readLoading;
  const bins = useMemo(() => toBinsUi(mergeBinLevels(register, readings)), [register, readings]);

  const total = bins.length;
  const high = bins.filter((b) => b.level >= 70).length;
  const overflow = bins.filter((b) => b.level >= 85).length;

  const markers = useMemo(
    () =>
      bins
        .map((b) => {
          const coord = coordForBin(b, geo);
          if (!coord) return null;
          return {
            id: b.id,
            lat: coord.lat,
            lng: coord.lng,
            tone: b.state.tone,
            popup: {
              title: `Bin ${b.binId}`,
              desc: `${b.state.label} · ${b.level}%${coord.real ? '' : ' · ward area (approx.)'}`,
            },
          };
        })
        .filter(Boolean),
    [bins, geo],
  );

  const columns = [
    { key: 'binId', label: 'Bin ID', sortable: true, render: (_, v) => <span className="u-mono">{v}</span> },
    { key: 'ward', label: 'Ward', sortable: true },
    { key: 'zone', label: 'Zone', sortable: true },
    { key: 'level', label: 'Level', sortable: true, render: (row) => (
      <div className="bin-level-row">
        <ProgressBar value={row.level} tone={row.state.tone} label={`${row.binId} level`} />
        <span className="bin-level-pct">{row.level}%</span>
      </div>
    ) },
    { key: 'state', label: 'State', render: (row) => <Badge tone={row.state.tone} dot>{row.state.label}</Badge> },
    { key: 'updatedLabel', label: 'Updated', sortable: true },
  ];

  return (
    <>
      <PageHeader title="Smart bins" subtitle="City-wide IoT bin fleet." icon="trash" />

      <div className="stat-grid u-mb-1">
        <StatCard icon="trash" label="Total bins" value={total} loading={loading} />
        <StatCard icon="alert-triangle" label="High fill (≥70%)" value={high} loading={loading} tone={high ? 'warning' : 'neutral'} />
        <StatCard icon="alert-triangle" label="Overflow risk" value={overflow} loading={loading} tone={overflow ? 'danger' : 'neutral'} />
      </div>

      <MapContainer markers={markers} title="All bins map" height={380} demoNote={null} />

      <SectionCard title="Bin register" className="u-mt-1">
        {bins.length === 0 && !loading ? (
          <EmptyState icon="trash" title="No bin readings" description="Register bins and connect IoT devices for data to appear here." />
        ) : (
          <DataTable columns={columns} data={bins} keyField="id" loading={loading} emptyTitle="No bins" emptyDescription="No readings yet." />
        )}
      </SectionCard>
    </>
  );
}
