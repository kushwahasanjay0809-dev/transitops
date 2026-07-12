import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Search, Shield, Edit2, Trash2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['ADMIN', 'MANAGER', 'DISPATCHER', 'VIEWER'];
const ROLE_BADGE = { ADMIN: 'badge-danger', MANAGER: 'badge-warning', DISPATCHER: 'badge-info', VIEWER: 'badge-neutral' };

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', role: 'VIEWER', password: '', isActive: true };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', role: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Password reset modal
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(query).forEach(([k, v]) => { if (v !== '' && v !== undefined) params[k] = v; });
      const res = await api.get('/users', { params });
      setUsers(res.data.data); setMeta(res.data.meta);
    } catch { toast.error('Failed to load users'); } finally { setLoading(false); }
  }, [query]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone || '', role: u.role?.name || 'VIEWER', password: '', isActive: u.isActive });
    setErrors({}); setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({});
    const payload = { ...form, phone: form.phone || null };
    if (editing) {
      if (!payload.password) delete payload.password;
    }
    try {
      if (editing) { await api.put(`/users/${editing.id}`, payload); toast.success('User updated'); }
      else { await api.post('/users', payload); toast.success('User created'); }
      setModalOpen(false); fetchUsers();
    } catch (err) {
      const msg = err.response?.data;
      if (msg?.errors) { const errs = {}; msg.errors.forEach((e) => { errs[e.path] = e.message; }); setErrors(errs); }
      else toast.error(msg?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/users/${deleteTarget.id}`); toast.success('User deleted'); setDeleteTarget(null); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setDeleting(false); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setResetting(true);
    try {
      await api.put(`/users/${resetTarget.id}`, { password: newPassword });
      toast.success('Password reset successfully');
      setResetTarget(null); setNewPassword('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setResetting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">Manage platform users and roles</p></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add User</button>
      </div>
      <div className="filter-bar">
        <div className="search-input"><Search className="search-icon" size={16} /><input placeholder="Search users..." value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} /></div>
        <select className="form-select" style={{ width: 140 }} value={query.role} onChange={(e) => setQuery({ ...query, role: e.target.value, page: 1 })}><option value="">All Roles</option>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
      </div>
      {loading ? <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div> : users.length === 0 ? (
        <div className="card"><div className="empty-state"><Shield size={40} className="empty-state-icon" /><h3>No users found</h3></div></div>
      ) : (
        <><div className="table-container"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id}>
              <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>{u.phone || '—'}</td>
              <td><span className={`badge ${ROLE_BADGE[u.role?.name] || 'badge-neutral'}`}>{u.role?.name}</span></td>
              <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
              <td><div style={{ display: 'flex', gap: '0.25rem' }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(u)} title="Edit"><Edit2 size={15} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setResetTarget(u); setNewPassword(''); }} title="Reset Password"><Lock size={15} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(u)} title="Delete" style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>
              </div></td>
            </tr>
          ))}</tbody></table></div>
          <Pagination meta={meta} onPageChange={(p) => setQuery({ ...query, page: p })} />
        </>
      )}

      {/* Create/Edit */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit}><ModalBody>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />{errors.email && <span className="form-error">{errors.email}</span>}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Role *</label><select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label><input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} {...(!editing && { required: true })} minLength={8} />{errors.password && <span className="form-error">{errors.password}</span>}</div>
            {editing && <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}><option value="true">Active</option><option value="false">Inactive</option></select></div>}
          </div>
        </ModalBody><ModalFooter>
          <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </ModalFooter></form>
      </Modal>

      {/* Reset Password */}
      <Modal isOpen={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Password" size="sm">
        <ModalBody>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Reset password for <strong>{resetTarget?.firstName} {resetTarget?.lastName}</strong>
          </p>
          <div className="form-group"><label className="form-label">New Password *</label><input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} placeholder="Min 8 characters" /></div>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-secondary" onClick={() => setResetTarget(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleResetPassword} disabled={resetting}>{resetting ? 'Resetting...' : 'Reset Password'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete User" message={`Delete user "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? This cannot be undone.`} loading={deleting} />
    </div>
  );
}
