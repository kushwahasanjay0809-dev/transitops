import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Search, Users, Edit2, Trash2, Eye, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['AVAILABLE', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED'];
const LICENSE_TYPES = ['A', 'B', 'C', 'D', 'E'];
const STATUS_BADGE = { AVAILABLE: 'badge-success', ON_TRIP: 'badge-info', ON_LEAVE: 'badge-warning', SUSPENDED: 'badge-danger' };

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '', licenseNumber: '',
  licenseExpiry: '', licenseType: 'C', status: 'AVAILABLE',
  dateOfBirth: '', hireDate: '', address: '', emergencyContact: '',
};

export default function DriversPage() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN', 'MANAGER');

  const [drivers, setDrivers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', status: '', licenseType: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [viewTarget, setViewTarget] = useState(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(query).forEach(([k, v]) => { if (v !== '' && v !== undefined) params[k] = v; });
      const res = await api.get('/drivers', { params });
      setDrivers(res.data.data);
      setMeta(res.data.meta);
    } catch { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone,
      licenseNumber: d.licenseNumber, licenseType: d.licenseType, status: d.status,
      licenseExpiry: d.licenseExpiry?.split('T')[0] || '',
      dateOfBirth: d.dateOfBirth?.split('T')[0] || '',
      hireDate: d.hireDate?.split('T')[0] || '',
      address: d.address || '', emergencyContact: d.emergencyContact || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    const payload = { ...form };
    if (!payload.address) payload.address = null;
    if (!payload.emergencyContact) payload.emergencyContact = null;
    try {
      if (editing) { await api.put(`/drivers/${editing.id}`, payload); toast.success('Driver updated'); }
      else { await api.post('/drivers', payload); toast.success('Driver created'); }
      setModalOpen(false); fetchDrivers();
    } catch (err) {
      const msg = err.response?.data;
      if (msg?.errors) { const errs = {}; msg.errors.forEach((e) => { errs[e.path] = e.message; }); setErrors(errs); }
      else toast.error(msg?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/drivers/${deleteTarget.id}`); toast.success('Driver deleted'); setDeleteTarget(null); fetchDrivers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const viewDriver = async (id) => {
    try { const res = await api.get(`/drivers/${id}`); setViewTarget(res.data.data); }
    catch { toast.error('Failed to load driver details'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Drivers</h1><p className="page-subtitle">Manage your driver roster</p></div>
        {canWrite && <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Driver</button>}
      </div>

      <div className="filter-bar">
        <div className="search-input"><Search className="search-icon" size={16} /><input placeholder="Search drivers..." value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} /></div>
        <select className="form-select" style={{ width: 140 }} value={query.status} onChange={(e) => setQuery({ ...query, status: e.target.value, page: 1 })}>
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 140 }} value={query.licenseType} onChange={(e) => setQuery({ ...query, licenseType: e.target.value, page: 1 })}>
          <option value="">All License</option>
          {LICENSE_TYPES.map((t) => <option key={t} value={t}>Type {t}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /><span>Loading...</span></div>
      ) : drivers.length === 0 ? (
        <div className="card"><div className="empty-state"><Users size={40} className="empty-state-icon" /><h3>No drivers found</h3></div></div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>License</th><th>Type</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.firstName} {d.lastName}</td>
                    <td>{d.email}</td>
                    <td>{d.phone}</td>
                    <td>{d.licenseNumber}</td>
                    <td><span className="badge badge-neutral">{d.licenseType}</span></td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {new Date(d.licenseExpiry).toLocaleDateString('en-IN')}
                        {d.isLicenseExpired && <AlertTriangle size={14} color="var(--color-danger)" />}
                      </span>
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[d.status]}`}>{d.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => viewDriver(d.id)} title="View"><Eye size={15} /></button>
                        {canWrite && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(d)} title="Edit"><Edit2 size={15} /></button>}
                        {canWrite && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(d)} title="Delete" style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add Driver'} size="lg">
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">License Number *</label><input className="form-input" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">License Type *</label><select className="form-select" value={form.licenseType} onChange={(e) => setForm({ ...form, licenseType: e.target.value })}>{LICENSE_TYPES.map((t) => <option key={t} value={t}>Type {t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">License Expiry *</label><input className="form-input" type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Date of Birth *</label><input className="form-input" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Hire Date *</label><input className="form-input" type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Address</label><textarea className="form-textarea" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} /></div>
              <div className="form-group"><label className="form-label">Emergency Contact</label><input className="form-input" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} /></div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : editing ? 'Update Driver' : 'Create Driver'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="Driver Details" size="md">
        {viewTarget && (
          <ModalBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              {[
                ['Name', `${viewTarget.firstName} ${viewTarget.lastName}`],
                ['Status', <span className={`badge ${STATUS_BADGE[viewTarget.status]}`}>{viewTarget.status}</span>],
                ['Email', viewTarget.email], ['Phone', viewTarget.phone],
                ['License #', viewTarget.licenseNumber], ['License Type', viewTarget.licenseType],
                ['License Expiry', <span style={{ color: viewTarget.isLicenseExpired ? 'var(--color-danger)' : 'inherit' }}>{new Date(viewTarget.licenseExpiry).toLocaleDateString('en-IN')} {viewTarget.isLicenseExpired && '(EXPIRED)'}</span>],
                ['DOB', new Date(viewTarget.dateOfBirth).toLocaleDateString('en-IN')],
                ['Hire Date', new Date(viewTarget.hireDate).toLocaleDateString('en-IN')],
                ['Trips', viewTarget._count?.trips ?? 'N/A'],
              ].map(([label, value], i) => (
                <div key={i}><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.125rem' }}>{label}</div><div style={{ fontWeight: 500 }}>{value}</div></div>
              ))}
            </div>
          </ModalBody>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Driver" message={`Delete driver "${deleteTarget?.firstName} ${deleteTarget?.lastName}"?`} loading={deleting} />
    </div>
  );
}
