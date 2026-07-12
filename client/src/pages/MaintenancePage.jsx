import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Search, Wrench, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_BADGE = { OPEN: 'badge-warning', IN_PROGRESS: 'badge-info', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' };
const TYPE_BADGE = { PREVENTIVE: 'badge-info', CORRECTIVE: 'badge-warning', EMERGENCY: 'badge-danger' };

export default function MaintenancePage() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN', 'MANAGER');
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', status: '', type: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ vehicleId: '', type: 'PREVENTIVE', description: '', cost: 0, startDate: '', endDate: '', vendorName: '', notes: '', status: 'OPEN' });
  const [saving, setSaving] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(query).forEach(([k, v]) => { if (v !== '' && v !== undefined) params[k] = v; });
      const res = await api.get('/maintenance', { params });
      setLogs(res.data.data); setMeta(res.data.meta);
    } catch { toast.error('Failed to load maintenance logs'); } finally { setLoading(false); }
  }, [query]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const loadVehicles = async () => {
    try { const res = await api.get('/vehicles?limit=100'); setVehicles(res.data.data); } catch {}
  };

  const openCreate = async () => {
    await loadVehicles();
    setEditing(null); setForm({ vehicleId: '', type: 'PREVENTIVE', description: '', cost: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', vendorName: '', notes: '', status: 'OPEN' });
    setModalOpen(true);
  };

  const openEdit = async (log) => {
    await loadVehicles();
    setEditing(log);
    setForm({ vehicleId: log.vehicleId, type: log.type, description: log.description, cost: parseFloat(log.cost), startDate: log.startDate?.split('T')[0] || '', endDate: log.endDate?.split('T')[0] || '', vendorName: log.vendorName || '', notes: log.notes || '', status: log.status });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, cost: parseFloat(form.cost) || 0, vehicleId: parseInt(form.vehicleId), endDate: form.endDate || null, vendorName: form.vendorName || null, notes: form.notes || null };
    if (!editing) delete payload.status;
    try {
      if (editing) { await api.put(`/maintenance/${editing.id}`, payload); toast.success('Maintenance log updated'); }
      else { await api.post('/maintenance', payload); toast.success('Maintenance log created'); }
      setModalOpen(false); fetchLogs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/maintenance/${deleteTarget.id}`); toast.success('Deleted'); setDeleteTarget(null); fetchLogs(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); } finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Maintenance</h1><p className="page-subtitle">Track vehicle maintenance and repairs</p></div>
        {canWrite && <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> New Log</button>}
      </div>
      <div className="filter-bar">
        <div className="search-input"><Search className="search-icon" size={16} /><input placeholder="Search..." value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} /></div>
        <select className="form-select" style={{ width: 150 }} value={query.status} onChange={(e) => setQuery({ ...query, status: e.target.value, page: 1 })}><option value="">All Status</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="form-select" style={{ width: 150 }} value={query.type} onChange={(e) => setQuery({ ...query, type: e.target.value, page: 1 })}><option value="">All Types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
      </div>
      {loading ? <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div> : logs.length === 0 ? (
        <div className="card"><div className="empty-state"><Wrench size={40} className="empty-state-icon" /><h3>No maintenance logs</h3></div></div>
      ) : (
        <><div className="table-container"><table><thead><tr><th>Vehicle</th><th>Type</th><th>Description</th><th>Cost (₹)</th><th>Start</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{logs.map((l) => (
            <tr key={l.id}>
              <td style={{ fontWeight: 600 }}>{l.vehicle?.registrationNumber}</td>
              <td><span className={`badge ${TYPE_BADGE[l.type]}`}>{l.type}</span></td>
              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.description}</td>
              <td>₹{parseFloat(l.cost).toLocaleString('en-IN')}</td>
              <td>{new Date(l.startDate).toLocaleDateString('en-IN')}</td>
              <td><span className={`badge ${STATUS_BADGE[l.status]}`}>{l.status}</span></td>
              <td><div style={{ display: 'flex', gap: '0.25rem' }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewTarget(l)}><Eye size={15} /></button>
                {canWrite && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(l)}><Edit2 size={15} /></button>}
                {canWrite && ['OPEN', 'CANCELLED'].includes(l.status) && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(l)} style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>}
              </div></td>
            </tr>
          ))}</tbody></table></div>
          <Pagination meta={meta} onPageChange={(p) => setQuery({ ...query, page: p })} />
        </>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Maintenance Log' : 'New Maintenance Log'} size="lg">
        <form onSubmit={handleSubmit}><ModalBody>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Vehicle *</label><select className="form-select" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required><option value="">Select</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.make} {v.model}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Type *</label><select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            {editing && <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>}
            <div className="form-group"><label className="form-label">Cost (₹)</label><input className="form-input" type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Start Date *</label><input className="form-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Description *</label><textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} /></div>
            <div className="form-group"><label className="form-label">Vendor</label><input className="form-input" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} /></div>
          </div>
        </ModalBody><ModalFooter>
          <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </ModalFooter></form>
      </Modal>
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="Maintenance Details">
        {viewTarget && <ModalBody>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            {[['Vehicle', viewTarget.vehicle?.registrationNumber], ['Type', <span className={`badge ${TYPE_BADGE[viewTarget.type]}`}>{viewTarget.type}</span>], ['Status', <span className={`badge ${STATUS_BADGE[viewTarget.status]}`}>{viewTarget.status}</span>], ['Cost', `₹${parseFloat(viewTarget.cost).toLocaleString('en-IN')}`], ['Start', new Date(viewTarget.startDate).toLocaleDateString('en-IN')], ['End', viewTarget.endDate ? new Date(viewTarget.endDate).toLocaleDateString('en-IN') : 'Ongoing'], ['Vendor', viewTarget.vendorName || 'N/A'], ['Reported By', viewTarget.reportedBy ? `${viewTarget.reportedBy.firstName} ${viewTarget.reportedBy.lastName}` : 'N/A']].map(([l, v], i) => <div key={i}><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{l}</div><div style={{ fontWeight: 500 }}>{v}</div></div>)}
          </div>
          {viewTarget.description && <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>{viewTarget.description}</div>}
        </ModalBody>}
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Log" message="Delete this maintenance log?" loading={deleting} />
    </div>
  );
}
