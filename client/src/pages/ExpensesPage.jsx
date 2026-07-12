import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Search, Receipt, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['FUEL', 'MAINTENANCE', 'INSURANCE', 'TOLLS', 'FINES', 'SALARY', 'MISCELLANEOUS'];
const CAT_BADGE = { FUEL: 'badge-warning', MAINTENANCE: 'badge-info', INSURANCE: 'badge-primary', TOLLS: 'badge-neutral', FINES: 'badge-danger', SALARY: 'badge-success', MISCELLANEOUS: 'badge-neutral' };

export default function ExpensesPage() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN', 'MANAGER');
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', category: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: 'MISCELLANEOUS', amount: '', description: '', expenseDate: '', vehicleId: '', tripId: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(query).forEach(([k, v]) => { if (v !== '' && v !== undefined) params[k] = v; });
      const res = await api.get('/expenses', { params });
      setExpenses(res.data.data); setMeta(res.data.meta);
    } catch { toast.error('Failed to load expenses'); } finally { setLoading(false); }
  }, [query]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const openCreate = () => { setEditing(null); setForm({ category: 'MISCELLANEOUS', amount: '', description: '', expenseDate: new Date().toISOString().split('T')[0], vehicleId: '', tripId: '', notes: '' }); setModalOpen(true); };
  const openEdit = (e) => { setEditing(e); setForm({ category: e.category, amount: parseFloat(e.amount), description: e.description, expenseDate: e.expenseDate?.split('T')[0] || '', vehicleId: e.vehicleId || '', tripId: e.tripId || '', notes: e.notes || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, amount: parseFloat(form.amount), vehicleId: form.vehicleId ? parseInt(form.vehicleId) : null, tripId: form.tripId ? parseInt(form.tripId) : null, notes: form.notes || null };
    try {
      if (editing) { await api.put(`/expenses/${editing.id}`, payload); toast.success('Updated'); }
      else { await api.post('/expenses', payload); toast.success('Expense recorded'); }
      setModalOpen(false); fetchExpenses();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/expenses/${deleteTarget.id}`); toast.success('Deleted'); setDeleteTarget(null); fetchExpenses(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Expenses</h1><p className="page-subtitle">Track operational expenses</p></div>
        {canWrite && <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Expense</button>}
      </div>
      <div className="filter-bar">
        <div className="search-input"><Search className="search-icon" size={16} /><input placeholder="Search..." value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} /></div>
        <select className="form-select" style={{ width: 160 }} value={query.category} onChange={(e) => setQuery({ ...query, category: e.target.value, page: 1 })}><option value="">All Categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      {loading ? <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div> : expenses.length === 0 ? (
        <div className="card"><div className="empty-state"><Receipt size={40} className="empty-state-icon" /><h3>No expenses</h3></div></div>
      ) : (
        <><div className="table-container"><table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount (₹)</th><th>Vehicle</th><th>Trip</th><th>Actions</th></tr></thead>
          <tbody>{expenses.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.expenseDate).toLocaleDateString('en-IN')}</td>
              <td><span className={`badge ${CAT_BADGE[e.category] || 'badge-neutral'}`}>{e.category}</span></td>
              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</td>
              <td style={{ fontWeight: 600 }}>₹{parseFloat(e.amount).toLocaleString('en-IN')}</td>
              <td>{e.vehicle?.registrationNumber || '—'}</td>
              <td>{e.trip?.tripNumber || '—'}</td>
              <td><div style={{ display: 'flex', gap: '0.25rem' }}>
                {canWrite && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(e)}><Edit2 size={15} /></button>}
                {canWrite && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(e)} style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>}
              </div></td>
            </tr>
          ))}</tbody></table></div>
          <Pagination meta={meta} onPageChange={(p) => setQuery({ ...query, page: p })} />
        </>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'} size="md">
        <form onSubmit={handleSubmit}><ModalBody>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Category *</label><select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Amount (₹) *</label><input className="form-input" type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Description *</label><input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Vehicle ID (optional)</label><input className="form-input" type="number" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
        </ModalBody><ModalFooter>
          <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </ModalFooter></form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Expense" message="Delete this expense?" loading={deleting} />
    </div>
  );
}
