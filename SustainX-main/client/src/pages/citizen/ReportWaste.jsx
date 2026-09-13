import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { wards } from '../../lib/geography';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import Icon from '../../components/ui/Icon';

const WASTE_TYPES = ['Mixed Waste', 'Plastic', 'Food', 'E-Waste', 'Hazardous', 'Construction', 'Other'];

const STEPS = ['Describe', 'Location', 'Submit'];

export default function ReportWaste() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    wasteType: '',
    description: '',
    location: '',
    block: '',
    imageFile: null,
    imagePreview: null,
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const canNext = () => (step === 0 ? form.wasteType && form.description.trim() : form.location.trim() && !!form.block);

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    set('imageFile', file);
    const reader = new FileReader();
    reader.onload = () => set('imagePreview', reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!canNext()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('location', form.location.trim());
      fd.append('block', form.block);
      fd.append('wasteType', form.wasteType);
      fd.append('description', form.description.trim());
      fd.append('type', 'complaint');
      if (form.imageFile) fd.append('image', form.imageFile);
      await submitComplaint(fd);
      showToast('Report submitted. Thanks for keeping the city clean!', 'success');
      navigate('/citizen/complaints');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not submit the report.', 'error');
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Report waste"
        subtitle="Tell us where and what — we'll route it to the right ward crew."
        icon="map-pin"
      />

      <div className="stepper-track">
        {STEPS.map((label, i) => (
          <div key={label} className={`stepper-seg ${i <= step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
            <span className="stepper-seg-num">{i + 1}</span>
            <span className="stepper-seg-label">{label}</span>
            {i < STEPS.length - 1 && <span className="stepper-seg-line" />}
          </div>
        ))}
      </div>

      <SectionCard className="u-mt-1">
        {step === 0 && (
          <div className="report-form">
            <div className="form-group">
              <label className="form-label">Type of waste</label>
              <select
                className="form-select"
                value={form.wasteType}
                onChange={(e) => set('wasteType', e.target.value)}
              >
                <option value="">Select waste type…</option>
                {WASTE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Describe the issue</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="e.g. Garbage overflowing near the market entrance since last evening…"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Photo (optional)</label>
              {form.imagePreview ? (
                <div className="report-image-box">
                  <img src={form.imagePreview} alt="Report preview" />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => set('imageFile', null)}>
                    <Icon name="close" size={14} /> Remove
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
                  <Icon name="image" size={18} /> Attach a photo
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFile}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="report-form">
            <div className="form-group">
              <label className="form-label">Ward</label>
              <select className="form-select" value={form.block} onChange={(e) => set('block', e.target.value)}>
                <option value="">Select ward…</option>
                {wards().map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name} ({w.zone})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location / address</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Near the fountain, main market road"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </div>
            <p className="u-text-muted u-text-sm">
              Precise street/pin descriptions help the crew find the spot faster.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="report-review">
            <div className="report-review-row">
              <span className="report-review-label">Waste type</span>
              <span className="report-review-value">{form.wasteType || '—'}</span>
            </div>
            <div className="report-review-row">
              <span className="report-review-label">Ward</span>
              <span className="report-review-value">
                {form.block ? wards().find((w) => w.code === form.block)?.name : '—'}
              </span>
            </div>
            <div className="report-review-row">
              <span className="report-review-label">Location</span>
              <span className="report-review-value">{form.location}</span>
            </div>
            <div className="report-review-row">
              <span className="report-review-label">Description</span>
              <span className="report-review-value">{form.description}</span>
            </div>
            <div className="report-review-row">
              <span className="report-review-label">Photo</span>
              <span className="report-review-value">{form.imageFile ? 'Attached' : 'None'}</span>
            </div>
          </div>
        )}

        <div className="report-actions">
          {step > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
              <Icon name="chevronLeft" size={16} /> Back
            </button>
          )}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
              Continue <Icon name="chevronRight" size={16} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
          )}
        </div>
      </SectionCard>
    </>
  );
}