import { useFetch } from '../../hooks/useFetch';
import { getComplaints } from '../../services/api';
import { toComplaintsUi } from '../../adapters/complaint.adapter';
import { wards, zones, wardLabel } from '../../lib/geography';
import { MOCK_WARD_PERFORMANCE } from '../../mock/operations.mock';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';

export default function AdminWards() {
  const { data } = useFetch(getComplaints);
  const complaints = data ? toComplaintsUi(data) : [];

  const wardStats = wards().map((w) => {
    const list = complaints.filter((c) => c.block === w.code);
    return {
      ...w,
      total: list.length,
      open: list.filter((c) => c.status === 'pending' || c.status === 'in-progress').length,
      resolved: list.filter((c) => c.status === 'completed').length,
      perf: MOCK_WARD_PERFORMANCE.find((p) => p.ward === w.code),
    };
  });

  const columns = [
    { key: 'name', label: 'Ward', sortable: true, render: (row) => <strong>{row.name}</strong> },
    { key: 'zone', label: 'Zone', sortable: true },
    { key: 'total', label: 'Reports', sortable: true },
    { key: 'open', label: 'Open', sortable: true },
    { key: 'resolved', label: 'Resolved', sortable: true },
    {
      key: 'eff',
      label: 'Collection efficiency',
      render: (row) => row.perf ? (
        <div className="bin-level-row">
          <ProgressBar value={row.perf.collectionEff} tone={row.perf.collectionEff >= 85 ? 'success' : 'warning'} label="Collection efficiency" />
          <span className="bin-level-pct">{row.perf.collectionEff}%</span>
        </div>
      ) : '—',
    },
    { key: 'sat', label: 'Satisfaction', render: (row) => row.perf ? `${row.perf.satisfaction}%` : '—', sortable: true },
  ];

  return (
    <>
      <PageHeader title="Wards & zones" subtitle="City hierarchy: City → Zone → Ward → Area → Collection Point → Bin" icon="map" />

      <div className="stat-grid u-mb-1">
        <StatCard icon="map" label="Wards" value={wards().length} />
        <StatCard icon="map-pin" label="Zones" value={zones().length} />
        <StatCard icon="list" label="Reports (live)" value={complaints.length} tone="info" />
      </div>

      <SectionCard title="Ward performance" subtitle={<><Badge tone="warning">Demo</Badge> Efficiency & satisfaction are illustrative</>}>
        <DataTable columns={columns} data={wardStats} keyField="code" emptyTitle="No wards" emptyDescription="No ward data." />
      </SectionCard>

      <SectionCard title="Coverage map" subtitle="Representative positioning per ward">
        <div className="ward-coverage">
          {wards().map((w) => (
            <div className="ward-chip" key={w.code}>
              <span className="ward-chip-code">{w.code}</span>
              <div>
                <strong>{w.name}</strong>
                <span className="ward-chip-zone">{wardLabel(w.code)} · {w.zone}</span>
              </div>
              <Badge tone="neutral">{w.code}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}