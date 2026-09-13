import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getVehicles, createVehicleApi, deleteVehicleApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { wardLabel } from '../../lib/geography';
import { useWardOptions } from '../../hooks/useGeo';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/ui/Icon';
import { fmtDateTime } from '../../lib/format';

const STATUS_TONE = { available: 'success', on_route: 'info', off_duty: 'neutral', maintenance: 'warning' };
const STATUS_LABEL = { available: 'Available', on_route: 'On route', off_duty: 'Off duty', maintenance: 'Maintenance' };
const VEHICLE_TYPES = ['compactor', 'tipper', 'mini_vehicle', 'tricycle', 'other'];

export default function AdminVehicles() {
  const { showToast } = useToast();
  const { data, loading, refetch } = useFetch(getVehicles);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ plate: '', type: 'compactor', capacityKg: '', block: '' });
  const wardOptions = useWardOptions();

  const vehicles = Array.isArray(data) ? data : [];
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.plate.trim()) {
      showToast('Vehicle plate is required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      await createVehicleApi({
        plate: form.plate.trim(),
        type: form.type,
        capacityKg: form.capacityKg ? Number(form.capacityKg) : undefined,
        block: form.block || undefined,
      });
      showToast(`Vehicle ${form.plate.trim().toUpperCase()} registered.`, 'success');
      setOpen(false);
      setForm({ plate: '', type: 'compactor', capacityKg: '', block: '' });
      refetch();
    } catch (err) {
      showToast(err?.message || 'Could not register vehicle.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (v) => {
    if (!window.confirm(`Delete vehicle ${v.plate}?`)) return;
    try {
      await deleteVehicleApi(v._id);
      showToast('Vehicle deleted.', 'success');
      refetch();
    } catch (err) {
      showToast(err?.message || 'Could not delete vehicle.', 'error');
    }
  };

  const columns = [
    { key: 'plate', label: 'Plate', sortable: true, render: (_, v) => <span className="u-mono">{v}</span> },
    { key: 'type', label: 'Type', sortable: true, render: (row) => row.type || '—' },
    { key: 'driver', label: 'Driver', render: (row) => row.driver?.name || '—' },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={STATUS_TONE[row.status] || 'neutral'} dot>{STATUS_LABEL[row.status] || row.status}</Badge> },
    { key: 'block', label: 'Ward', render: (row) => wardLabel(row.block) },
    {
      key: 'currentLocation',
      label: 'Live location',
      render: (row) => {
        const c = row.currentLocation?.coordinates;
        if (Array.isArray(c) && c.length === 2 && (c[0] !== 0 || c[1] !== 0)) {
          return <span className="u-mono u-text-sm">{c[1].toFixed(4)}, {c[0].toFixed(4)}</span>;
        }
        return <span className="u-text-muted">No GPS yet</span>;
      },
    },
    { key: 'lastLocationUpdate', label: 'Last update', render: (row) => fmtDateTime(row.lastLocationUpdate) },
    {
      key: '_del',
      label: '',
      width: '60px',
      render: (row) => (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(row)} aria-label={`Delete ${row.plate}`}>
          <Icon name="trash" size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Vehicles & routes"
        subtitle="Live fleet registry with GPS positions reported by field devices."
        icon="truck"
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            <Icon name="truck" size={15} /> Register vehicle
          </button>
        }
      />

      <div className="u-grid-2">
        <SectionCard title="Fleet">
          <DataTable
            columns={columns}
            data={vehicles}
            keyField="_id"
            loading={loading}
            emptyTitle="No vehicles"
            emptyDescription="Register the first fleet vehicle to get started."
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

      <Modal title="Register vehicle" isOpen={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="report-form">
          <div className="form-group">
            <label className="form-label" htmlFor="vehPlate">Plate number</label>
            <input id="vehPlate" className="form-input" type="text" value={form.plate} onChange={set('plate')} placeholder="e.g. MH-04-AB-1234" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="vehType">Type</label>
            <select id="vehType" className="form-select" value={form.type} onChange={set('type')}>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="vehCap">Capacity (kg, optional)</label>
            <input id="vehCap" className="form-input" type="number" min="0" value={form.capacityKg} onChange={set('capacityKg')} placeholder="e.g. 1000" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="vehBlock">Ward (optional)</label>
            <select id="vehBlock" className="form-select" value={form.block} onChange={set('block')}>
              <option value="">Unassigned</option>
              {wardOptions.map((w) => <option key={w.code} value={w.code}>{w.name} ({w.zone})</option>)}
            </select>
          </div>
          <div className="report-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Registering…' : 'Register vehicle'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
