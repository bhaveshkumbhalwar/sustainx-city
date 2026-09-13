import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useGeoIndex } from '../../hooks/useGeo';
import { getComplaints, getBins, getIotBinData, getVehicles } from '../../services/api';
import { toComplaintsUi } from '../../adapters/complaint.adapter';
import { toBinsUi, mergeBinLevels } from '../../adapters/bin.adapter';
import { coordForBin, coordForComplaint, coordForVehicle } from '../../services/geo';
import { wardLabel } from '../../lib/geography';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import MapContainer from '../../components/maps/MapContainer';
import { fmtDateTime } from '../../lib/format';

const VEHICLE_STATUS_TONE = { available: 'success', on_route: 'info', off_duty: 'neutral', maintenance: 'warning' };

export default function LiveOperations() {
  const { data: rawComplaints } = useFetch(getComplaints);
  const { data: register } = useFetch(getBins);
  const { data: readings } = useFetch(getIotBinData);
  const { data: rawVehicles, loading: vehiclesLoading } = useFetch(getVehicles);
  const geo = useGeoIndex();

  const complaints = useMemo(() => toComplaintsUi(rawComplaints), [rawComplaints]);
  const bins = useMemo(() => toBinsUi(mergeBinLevels(register, readings)), [register, readings]);
  const vehicles = useMemo(() => (Array.isArray(rawVehicles) ? rawVehicles : []), [rawVehicles]);

  const markers = useMemo(() => {
    const binMarkers = bins
      .map((b) => {
        const c = coordForBin(b, geo);
        if (!c) return null;
        return { id: `bin-${b.id}`, lat: c.lat, lng: c.lng, tone: b.state.tone, popup: { title: `Bin ${b.binId}`, desc: `${b.state.label} · ${b.level}%` } };
      })
      .filter(Boolean);
    const complaintMarkers = complaints
      .filter((c) => c.status !== 'completed')
      .map((c) => {
        const coord = coordForComplaint(c, geo);
        if (!coord) return null;
        return { id: `comp-${c.id}`, lat: coord.lat, lng: coord.lng, tone: 'info', popup: { title: c.id, desc: `${c.ward} · ${c.wasteType}` } };
      })
      .filter(Boolean);
    const vehicleMarkers = vehicles
      .map((v) => {
        const coord = coordForVehicle(v);
        if (!coord) return null;
        return { id: `veh-${v._id}`, lat: coord.lat, lng: coord.lng, tone: 'success', popup: { title: `${v.plate} — ${v.type || 'vehicle'}`, desc: `Driver: ${v.driver?.name || '—'} · ${v.status}` } };
      })
      .filter(Boolean);
    return [...binMarkers, ...complaintMarkers, ...vehicleMarkers];
  }, [bins, complaints, vehicles, geo]);

  const liveVehicles = vehicles.filter((v) => v.status === 'available' || v.status === 'on_route').length;

  const vehicleColumns = [
    { key: 'plate', label: 'Plate', render: (_, v) => <span className="u-mono">{v}</span> },
    { key: 'type', label: 'Type', sortable: true, render: (row) => row.type || '—' },
    { key: 'driver', label: 'Driver', render: (row) => row.driver?.name || '—' },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={VEHICLE_STATUS_TONE[row.status] || 'neutral'} dot>{row.status}</Badge> },
    { key: 'block', label: 'Ward', render: (row) => wardLabel(row.block) },
    { key: 'lastLocationUpdate', label: 'Last GPS', render: (row) => fmtDateTime(row.lastLocationUpdate) },
  ];

  return (
    <>
      <PageHeader title="Live Operations" subtitle="City-wide activity map and fleet status." icon="activity" />

      <div className="stat-grid u-mb-1">
        <StatCard icon="truck" label="Active vehicles" value={liveVehicles} loading={vehiclesLoading} />
        <StatCard icon="map-pin" label="Active complaints" value={complaints.filter((c) => c.status !== 'completed').length} loading={false} tone="warning" />
        <StatCard icon="trash" label="Bins monitored" value={bins.length} loading={false} />
      </div>

      <MapContainer markers={markers} title="Operations map" height={420} demoNote={null} />

      <div className="u-grid-2 u-mt-1">
        <SectionCard title="Vehicles" subtitle="Live fleet positions from field GPS reports">
          <DataTable
            columns={vehicleColumns}
            data={vehicles}
            keyField="_id"
            loading={vehiclesLoading}
            emptyTitle="No vehicles"
            emptyDescription="No fleet vehicles are registered yet."
          />
        </SectionCard>

        <SectionCard title="Routes" subtitle="Planned collection routes">
          <EmptyState
            icon="map"
            title="Route planning not available"
            description="The backend does not expose a route-planning endpoint yet, so no routes are shown."
          />
        </SectionCard>
      </div>
    </>
  );
}
