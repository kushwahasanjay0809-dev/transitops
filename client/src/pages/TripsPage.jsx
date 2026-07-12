import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Search, Route, Edit2, Trash2, Eye, Play, CheckCircle, XCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['SCHEDULED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_BADGE = { SCHEDULED: 'badge-info', DISPATCHED: 'badge-warning', IN_PROGRESS: 'badge-primary', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' };

export default function TripsPage() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN', 'MANAGER', 'DISPATCHER');
  const canDelete = hasRole('ADMIN', 'MANAGER');

  const [trips, setTrips] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', status: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', driverId: '', originRegionId: '', destinationRegionId: '', cargoDescription: '', cargoWeightKg: '', distanceKm: '', scheduledDeparture: '', scheduledArrival: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [regions, setRegions] = useState([]);

  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(query).forEach(([k, v]) => { if (v !== '' && v !== undefined) params[k] = v; });
      const res = await api.get('/trips', { params });
      setTrips(res.data.data);
      setMeta(res.data.meta);
    } catch { toast.error('Failed to load trips'); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const loadDropdowns = async () => {
    try {
      const [v, d, r] = await Promise.all([
        api.get('/vehicles/available'),
        api.get('/drivers/available'),
        api.get('/regions/all'),
      ]);
      setVehicles(v.data.data);
      setDrivers(d.data.data);
      setRegions(r.data.data);
    } catch { toast.error('Failed to load dropdown data'); }
  };

  const openCreate = async () => {
    await loadDropdowns();
    setForm({ vehicleId: '', driverId: '', originRegionId: '', destinationRegionId: '', cargoDescription: '', cargoWeightKg: '', distanceKm: '', scheduledDeparture: '', scheduledArrival: '', notes: '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      vehicleId: parseInt(form.vehicleId),
      driverId: parseInt(form.driverId),
      originRegionId: parseInt(form.originRegionId),
      destinationRegionId: parseInt(form.destinationRegionId),
      cargoDescription: form.cargoDescription || null,
      cargoWeightKg: form.cargoWeightKg ? parseFloat(form.cargoWeightKg) : null,
      distanceKm: form.distanceKm ? parseFloat(form.distanceKm) : null,
      scheduledDeparture: form.scheduledDeparture,
      scheduledArrival: form.scheduledArrival,
      notes: form.notes || null,
    };
    try {
      await api.post('/trips', payload);
      toast.success('Trip created');
      setModalOpen(false);
      fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trip');
    } finally { setSaving(false); }
  };

  const handleAction = async (id, action, body = {}) => {
    try {
      await api.patch(`/trips/${id}/${action}`, body);
      toast.success(`Trip ${action}ed successfully`);
      fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} trip`);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.patch(`/trips/${cancelTarget.id}/cancel`, { reason: cancelReason });
      toast.success('Trip cancelled');
      setCancelTarget(null);
      setCancelReason('');
      fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel trip');
    } finally { setCancelling(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/trips/${deleteTarget.id}`); toast.success('Trip deleted'); setDeleteTarget(null); fetchTrips(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const viewTrip = async (id) => {
    try { const res = await api.get(`/trips/${id}`); setViewTarget(res.data.data); }
    catch { toast.error('Failed to load trip details'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Trips</h1><p className="page-subtitle">Manage transport trips and dispatches</p></div>
        {canWrite && <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Create Trip</button>}
      </div>

      <div className="filter-bar">
        <div className="search-input"><Search className="search-icon" size={16} /><input placeholder="Search trips..." value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} /></div>
        <select className="form-select" style={{ width: 160 }} value={query.status} onChange={(e) => setQuery({ ...query, status: e.target.value, page: 1 })}>
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /><span>Loading...</span></div>
      ) : trips.length === 0 ? (
        <div className="card"><div className="empty-state"><Route size={40} className="empty-state-icon" /><h3>No trips found</h3></div></div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead><tr><th>Trip #</th><th>Route</th><th>Vehicle</th><th>Driver</th><th>Departure</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.tripNumber}</td>
                    <td>{t.originRegion?.code} → {t.destinationRegion?.code}</td>
                    <td>{t.vehicle?.registrationNumber}</td>
                    <td>{t.driver?.firstName} {t.driver?.lastName}</td>
                    <td>{new Date(t.scheduledDeparture).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge ${STATUS_BADGE[t.status]}`}>{t.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => viewTrip(t.id)} title="View"><Eye size={15} /></button>
                        {canWrite && t.status === 'SCHEDULED' && (
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleAction(t.id, 'dispatch')} title="Dispatch" style={{ color: 'var(--color-warning)' }}><Send size={15} /></button>
                        )}
                        {canWrite && t.status === 'DISPATCHED' && (
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleAction(t.id, 'start')} title="Start" style={{ color: 'var(--color-accent)' }}><Play size={15} /></button>
                        )}
                        {canWrite && ['DISPATCHED', 'IN_PROGRESS'].includes(t.status) && (
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleAction(t.id, 'complete')} title="Complete" style={{ color: 'var(--color-success)' }}><CheckCircle size={15} /></button>
                        )}
                        {canWrite && ['SCHEDULED', 'DISPATCHED'].includes(t.status) && (
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setCancelTarget(t); setCancelReason(''); }} title="Cancel" style={{ color: 'var(--color-danger)' }}><XCircle size={15} /></button>
                        )}
                        {canDelete && ['SCHEDULED', 'CANCELLED'].includes(t.status) && (
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(t)} title="Delete" style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={(p) => setQuery({ ...query, page: p })} />
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Trip" size="lg">
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Vehicle *</label>
                <select className="form-select" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
                  <option value="">Select vehicle</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.make} {v.model} ({v.capacityKg}kg)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Driver *</label>
                <select className="form-select" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} required>
                  <option value="">Select driver</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} ({d.licenseType})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Origin Region *</label>
                <select className="form-select" value={form.originRegionId} onChange={(e) => setForm({ ...form, originRegionId: e.target.value })} required>
                  <option value="">Select origin</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Destination Region *</label>
                <select className="form-select" value={form.destinationRegionId} onChange={(e) => setForm({ ...form, destinationRegionId: e.target.value })} required>
                  <option value="">Select destination</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Scheduled Departure *</label><input className="form-input" type="datetime-local" value={form.scheduledDeparture} onChange={(e) => setForm({ ...form, scheduledDeparture: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Scheduled Arrival *</label><input className="form-input" type="datetime-local" value={form.scheduledArrival} onChange={(e) => setForm({ ...form, scheduledArrival: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Cargo Weight (kg)</label><input className="form-input" type="number" min="0" value={form.cargoWeightKg} onChange={(e) => setForm({ ...form, cargoWeightKg: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Distance (km)</label><input className="form-input" type="number" min="0" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Cargo Description</label><input className="form-input" value={form.cargoDescription} onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })} /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Creating...</> : 'Create Trip'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="Trip Details" size="lg">
        {viewTarget && (
          <ModalBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              {[
                ['Trip #', viewTarget.tripNumber],
                ['Status', <span className={`badge ${STATUS_BADGE[viewTarget.status]}`}>{viewTarget.status}</span>],
                ['Vehicle', `${viewTarget.vehicle?.registrationNumber} — ${viewTarget.vehicle?.make} ${viewTarget.vehicle?.model}`],
                ['Driver', `${viewTarget.driver?.firstName} ${viewTarget.driver?.lastName}`],
                ['Origin', viewTarget.originRegion?.name],
                ['Destination', viewTarget.destinationRegion?.name],
                ['Cargo', viewTarget.cargoDescription || 'N/A'],
                ['Weight', viewTarget.cargoWeightKg ? `${parseFloat(viewTarget.cargoWeightKg).toLocaleString()} kg` : 'N/A'],
                ['Distance', viewTarget.distanceKm ? `${parseFloat(viewTarget.distanceKm).toLocaleString()} km` : 'N/A'],
                ['Sched. Departure', new Date(viewTarget.scheduledDeparture).toLocaleString('en-IN')],
                ['Sched. Arrival', new Date(viewTarget.scheduledArrival).toLocaleString('en-IN')],
                ['Actual Departure', viewTarget.actualDeparture ? new Date(viewTarget.actualDeparture).toLocaleString('en-IN') : 'N/A'],
                ['Actual Arrival', viewTarget.actualArrival ? new Date(viewTarget.actualArrival).toLocaleString('en-IN') : 'N/A'],
                ['Dispatched By', viewTarget.dispatchedBy ? `${viewTarget.dispatchedBy.firstName} ${viewTarget.dispatchedBy.lastName}` : 'N/A'],
              ].map(([label, value], i) => (
                <div key={i}><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.125rem' }}>{label}</div><div style={{ fontWeight: 500 }}>{value}</div></div>
              ))}
            </div>
            {viewTarget.notes && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', whiteSpace: 'pre-wrap' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Notes</div>
                {viewTarget.notes}
              </div>
            )}
          </ModalBody>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Trip" size="sm">
        <ModalBody>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Cancel trip <strong>{cancelTarget?.tripNumber}</strong>? This will release the vehicle and driver.
          </p>
          <div className="form-group">
            <label className="form-label">Cancellation Reason *</label>
            <textarea className="form-textarea" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} placeholder="Enter reason for cancellation..." required />
          </div>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-secondary" onClick={() => setCancelTarget(null)}>Back</button>
          <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling || !cancelReason.trim()}>
            {cancelling ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Cancelling...</> : 'Cancel Trip'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Trip" message={`Delete trip "${deleteTarget?.tripNumber}"?`} loading={deleting} />
    </div>
  );
}
