import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Search, MapPin, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegionsPage() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN', 'MANAGER');
  const [regions, setRegions] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', state: '', country: 'India', isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(query).forEach(([k, v]) => { if (v !== '' && v !== undefined) params[k] = v; });
      const res = await api.get('/regions', { params });
      setRegions(res.data.data); setMeta(res.data.meta);
    } catch { toast.error('Failed to load regions'); } finally { setLoading(false); }
  }, [query]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', state: '', country: 'India', isActive: true }); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ name: r.name, code: r.code, state: r.state || '', country: r.country || 'India', isActive: r.isActive }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, state: form.state || null };
    try {
      if (editing) { await api.put(`/regions/${editing.id}`, payload); toast.success('Region updated'); }
      else { await api.post('/regions', payload); toast.success('Region created'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/regions/${deleteTarget.id}`); toast.success('Region deleted'); setDeleteTarget(null); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); } finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Regions</h1><p className="page-subtitle">Manage geographic regions</p></div>
        {canWrite && <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Region</button>}
      </div>
      <div className="filter-bar">
        <div className="search-input"><Search className="search-icon" size={16} /><input placeholder="Search regions..." value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} /></div>
      </div>
      {loading ? <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div> : regions.length === 0 ? (
        <div className="card"><div className="empty-state"><MapPin size={40} className="empty-state-icon" /><h3>No regions found</h3></div></div>
      ) : (
        <>
          <div className="table-container">
            <table><thead><tr><th>Name</th><th>Code</th><th>State</th><th>Country</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{regions.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td><td><span className="badge badge-neutral">{r.code}</span></td>
                  <td>{r.state || '—'}</td><td>{r.country}</td>
                  <td><span className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td><div style={{ display: 'flex', gap: '0.25rem' }}>
                    {canWrite && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(r)}><Edit2 size={15} /></button>}
                    {canWrite && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(r)} style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>}
                  </div></td>
                </tr>
              ))}</tbody></table>
          </div>
          <Pagination meta={meta} onPageChange={(p) => setQuery({ ...query, page: p })} />
        </>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Region' : 'Add Region'}>
        <form onSubmit={handleSubmit}><ModalBody>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Code *</label><input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required maxLength={10} /></div>
            <div className="form-group"><label className="form-label">State</label><input className="form-input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Country</label><input className="form-input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
            {editing && <div className="form-group"><label className="form-label">Active</label><select className="form-select" value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}><option value="true">Active</option><option value="false">Inactive</option></select></div>}
          </div>
        </ModalBody><ModalFooter>
          <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </ModalFooter></form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Region" message={`Delete region "${deleteTarget?.name}"?`} loading={deleting} />
    </div>
  );
}
