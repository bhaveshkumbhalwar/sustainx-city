import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getComplaints, updateComplaintStatus } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { toComplaintsUi, sourceLabel } from '../../adapters/complaint.adapter';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/ui/Icon';
import { fmtDateTime } from '../../lib/format';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminComplaints() {
  const { showToast } = useToast();
  const { data, loading, refetch } = useFetch(getComplaints);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const list = toComplaintsUi(data);
  const filtered = filter === 'all' ? list : list.filter((c) => c.status === filter);

  const setStatus = async (c, status) => {
    try {
      await updateComplaintStatus(c.id, { status, note: `Admin set status to ${status}` });
      showToast(`${c.id} → ${status}`, 'success');
      setSelected(null);
      refetch();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not update status.', 'error');
    }
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true, render: (_, v) => <span className="u-mono">{v}</span> },
    { key: 'user', label: 'Reported by', sortable: true, render: (row) => row.user?.name || 'System' },
    { key: 'wasteType', label: 'Type', sortable: true },
    { key: 'ward', label: 'Ward', sortable: true },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'priority', label: 'Priority', render: (row) => <PriorityBadge level={row.priority} /> },
    { key: 'createdLabel', label: 'Reported', sortable: true },
    {
      key: '_open',
      label: '',
      width: '64px',
      render: (row) => (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(row)} aria-label={`View ${row.id}`}>
          <Icon name="eye" size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Complaints registry" subtitle="All citizen and IoT-driven waste reports." icon="list" />

      <div className="segmented u-mb-1" style={{ flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button key={f.value} type="button" className={`segmented-btn ${filter === f.value ? 'segmented-active' : ''}`} onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyField="id"
        loading={loading}
        searchPlaceholder="Search by ID, type, ward or user…"
        searchValue={search}
        onSearchChange={setSearch}
        emptyTitle="No complaints"
        emptyDescription="No records match the current filters."
      />

      <Modal title="Complaint detail" isOpen={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="detail-panel">
            <div className="detail-row"><span className="detail-label">ID</span><span className="detail-value u-mono">{selected.id}</span></div>
            <div className="detail-row"><span className="detail-label">Source</span><Badge tone="neutral">{sourceLabel(selected.type)}</Badge></div>
            <div className="detail-row"><span className="detail-label">Status</span><StatusBadge status={selected.status} /></div>
            <div className="detail-row"><span className="detail-label">Reporter</span><span className="detail-value">{selected.user?.name || 'System'}</span></div>
            <div className="detail-row"><span className="detail-label">Ward / Zone</span><span className="detail-value">{selected.ward} / {selected.zone}</span></div>
            <div className="detail-row"><span className="detail-label">Location</span><span className="detail-value">{selected.location}</span></div>
            <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value">{selected.wasteType}</span></div>
            <div className="detail-row"><span className="detail-label">Submitted</span><span className="detail-value">{fmtDateTime(selected.createdAt)}</span></div>
            <div className="detail-desc"><span className="detail-label">Description</span><p>{selected.description}</p></div>

            {(selected.status === 'pending' || selected.status === 'in-progress') && (
              <div className="report-actions">
                {selected.status === 'pending' && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus(selected, 'in-progress')}>
                    Start (in-progress)
                  </button>
                )}
                <button type="button" className="btn btn-red btn-sm" onClick={() => setStatus(selected, 'rejected')}>
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}