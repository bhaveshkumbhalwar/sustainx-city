import { MOCK_VEHICLES, MOCK_ROUTES } from '../../mock/operations.mock';
import { wardLabel } from '../../lib/geography';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import DataTable from '../../components/ui/DataTable';

export default function AdminVehicles() {
  const vehicleColumns = [
    { key: 'id', label: 'ID', render: (_, v) => <span className="u-mono">{v}</span> },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'driver', label: 'Driver', sortable: true },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={row.status === 'active' ? 'success' : row.status === 'maintenance' ? 'warning' : 'neutral'} dot>{row.status}</Badge> },
    { key: 'ward', label: 'Ward', render: (row) => wardLabel(row.block) },
    { key: 'route', label: 'Route' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'fuel', label: 'Fuel', render: (row) => (
      <div className="bin-level-row">
        <ProgressBar value={row.fuel} tone={row.fuel >= 60 ? 'success' : row.fuel >= 30 ? 'warning' : 'danger'} label="Fuel" />
        <span className="bin-level-pct">{row.fuel}%</span>
      </div>
    ) },
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
      <PageHeader title="Vehicles & routes" subtitle="Fleet status. Data is demonstrative (demo)." icon="truck" />
      <Badge tone="warning" className="u-mb-1">Demo data — not backed by live GPS or telemetry</Badge>

      <div className="u-grid-2">
        <SectionCard title="Fleet">
          <DataTable columns={vehicleColumns} data={MOCK_VEHICLES} keyField="id" emptyTitle="No vehicles" />
        </SectionCard>
        <SectionCard title="Routes">
          <DataTable columns={routeColumns} data={MOCK_ROUTES} keyField="id" emptyTitle="No routes" />
        </SectionCard>
      </div>
    </>
  );
}