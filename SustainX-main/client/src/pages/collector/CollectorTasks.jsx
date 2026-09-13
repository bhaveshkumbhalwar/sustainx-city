import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getComplaints, updateComplaintStatus, completeComplaintApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { toComplaintsUi } from '../../adapters/complaint.adapter';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/ui/Icon';
import { wardLabel } from '../../lib/geography';

export default function CollectorTasks() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileRef = useRef(null);
  const { data, loading, error, refetch } = useFetch(getComplaints);
  const [search, setSearch] = useState('');
  const [completeTarget, setCompleteTarget] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const ward = wardLabel(user?.block);
  const list = toComplaintsUi(data);
  const pending = list.filter((c) => c.status === 'pending');
  const active = list.filter((c) => c.status === 'in-progress');
  const done = list.filter((c) => c.status === 'completed' || c.status === 'rejected');
  const combined = [...pending, ...active, ...done];

  const startTask = async (c) => {
    try {
      await updateComplaintStatus(c.id, { status: 'in-progress', note: 'Collector started work' });
      showToast(`${c.id} moved to in-progress`, 'success');
      refetch();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not update status.', 'error');
    }
  };

  const handleProofSelect = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setProofFile(f);
  };

  const submitComplete = async () => {
    if (!completeTarget || !proofFile) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('image', proofFile);
      await completeComplaintApi(completeTarget.id, fd);
      showToast(`${completeTarget.id} marked complete.`, 'success');
      setCompleteTarget(null);
      setProofFile(null);
      refetch();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not complete task.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openComplete = (c) => {
    setCompleteTarget(c);
    setProofFile(null);
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true, render: (_, v) => <span className="u-mono">{v}</span> },
    { key: 'wasteType', label: 'Type', sortable: true },
    { key: 'location', label: 'Location', render: (row) => row.location || '—' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'priority', label: 'Priority', render: (row) => <PriorityBadge level={row.priority} /> },
    { key: 'createdLabel', label: 'Reported', sortable: true },
    {
      key: '_action',
      label: '',
      width: '160px',
      render: (row) => (
        <div className="u-flex">
          {row.status === 'pending' && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => startTask(row)}>
              Start
            </button>
          )}
          {(row.status === 'in-progress' || row.status === 'pending') && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => openComplete(row)}>
              <Icon name="check" size={15} /> Done
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Collection tasks" subtitle={`Complaints assigned to ${ward}`} icon="clipboard" />

      {error ? (
        <p>Failed to load tasks: {error?.message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={combined}
          keyField="id"
          loading={loading}
          searchPlaceholder="Search by ID, location or type…"
          searchValue={search}
          onSearchChange={setSearch}
          emptyTitle="No tasks"
          emptyDescription="Your ward has no open complaints."
        />
      )}

      <Modal title="Complete with photo proof" isOpen={!!completeTarget} onClose={() => setCompleteTarget(null)}>
        {completeTarget && (
          <div className="report-form">
            <p>Upload a photo proving <strong>{completeTarget.id}</strong> has been resolved.</p>
            {proofFile ? (
              <div className="report-image-box">
                <span className="u-text-sm u-text-muted">{proofFile.name}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProofFile(null)}>
                  <Icon name="close" size={14} /> Remove
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
                <Icon name="image" size={18} /> Attach proof photo
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleProofSelect} />
            <div className="report-actions u-mt-1">
              <button type="button" className="btn btn-ghost" onClick={() => setCompleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={!proofFile || submitting} onClick={submitComplete}>
                {submitting ? 'Uploading…' : 'Submit proof'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}