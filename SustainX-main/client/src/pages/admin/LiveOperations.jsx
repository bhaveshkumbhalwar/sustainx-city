import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getComplaints, getIotBinData } from '../../services/api';
import { toComplaintsUi } from '../../adapters/complaint.adapter';
import { toBinsUi } from '../../adapters/bin.adapter';
import { demoCoordForWard } from '../../mock/demoGeo';
import { MOCK_VEHICLES, MOCK_ROUTES } from '../../mock/operations.mock';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import MapContainer from '../../components/maps/MapContainer';

export default function LiveOperations() {
  const { data: rawComplaints } = useFetch(getComplaints);
  const { data: rawBins } = useFetch(getIotBinData);

  const complaints = useMemo(() => toComplaintsUi(rawComplaints), [rawComplaints]);
  const bins = useMemo(() => toBinsUi(rawBins), [rawBins]);

  const markers = useMemo(() => {
    const binMarkers = bins.map((b) => {
      const g = demoCoordForWard(b.block);
      return { id: `bin-${b.id}`, lat: g?.lat, lng: g?.lng, tone: b.state.tone, popup: { title: `Bin ${b.binId}`, desc: `${b.state.label} · ${b.level}%` } };
    });
    const complaintMarkers = complaints.filter((c) => c.status !== 'completed').map((c) => {
      const g = demoCoordForWard(c.block);
      return { id: `comp-${c.id}`, lat: g?.lat, lng: g?.lng, tone: 'info', popup: { title: c.id, desc: `${c.ward} · ${c.wasteType}` } };
    });
    const vehicleMarkers = MOCK_VEHICLES.filter((v) => v.status === 'active' && v.block).map((v) => {
      const g = demoCoordForWard(v.block);
      return { id: v.id, lat: g?.lat, lng: g?.lng, tone: 'success', popup: { title: `${v.id} — ${v.type}`, desc: `Driver: ${v.driver}` } };
    });
    return [...binMarkers, ...complaintMarkers, ...vehicleMarkers];
  }, [bins, complaints]);

  const activeVehicles = MOCK_VEHICLES.filter((v) => v.status === 'active').length;

  const vehicleColumns = [
    { key: 'id', label: 'ID', render: (_, v) => <span className="u-mono">{v}</span> },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'driver', label: 'Driver', sortable: true },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={row.status === 'active' ? 'success' : row.status === 'maintenance' ? 'warning' : 'neutral'} dot>{row.status}</Badge> },
    { key: 'block', label: 'Ward' },
    { key: 'fuel', label: 'Fuel %', render: (row) => `${row.fuel}%` },
  ];

  const routeColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Route', sortable: true },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'stops', label: 'Stops' },
    { key: 'distance', label: 'Distance' },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={row.status === 'active' ? 'success' : 'neutral'} dot>{row.status}</Badge> },
  ];

  return (
    <>
      <PageHeader title="Live Operations" subtitle="City-wide activity map and fleet status." icon="activity" />

      <div className="stat-grid u-mb-1">
        <StatCard icon="truck" label="Active vehicles" value={activeVehicles} loading={false} />
        <StatCard icon="map-pin" label="Active complaints" value={complaints.filter((c) => c.status !== 'completed').length} loading={false} tone="warning" />
        <StatCard icon="trash" label="Bins monitored" value={bins.length} loading={false} />
      </div>

      <MapContainer markers={markers} title="Operations map" height={420} />

      <div className="u-grid-2 u-mt-1">
        <SectionCard title="Vehicles" subtitle={<><Badge tone="warning">Demo</Badge> Not backed by live GPS</>}>
          <DataTable columns={vehicleColumns} data={MOCK_VEHICLES} keyField="id" emptyTitle="No vehicles" emptyDescription="Vehicle fleet data is not available." />
        </SectionCard>

        <SectionCard title="Routes">
          <DataTable columns={routeColumns} data={MOCK_ROUTES} keyField="id" emptyTitle="No routes" emptyDescription="Route data is not available." />
        </SectionCard>
      </div>
    </>
  );
}