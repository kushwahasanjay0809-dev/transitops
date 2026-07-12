import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Search, Fuel, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const FUEL_TYPES = ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'];

export default function FuelLogsPage() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN', 'MANAGER', 'DISPATCHER');
  const canDelete = hasRole('ADMIN', 'MANAGER');
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', fuelType: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ vehicleId: '', driverId: '', fuelDate: '', fuelType: 'DIESEL', quantity: '', pricePerUnit: '', totalCost: '', odometerReading: '', station: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(query).forEach(([k, v]) => { if (v !== '' && v !== undefined) params[k] = v; });
      const res = await api.get('/fuel-logs', { params });
      setLogs(res.data.data); setMeta(res.data.meta);
    } catch { toast.error('Failed to load fuel logs'); } finally { setLoading(false); }
  }, [query]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const loadDropdowns = async () => {
    try {
      const [v, d] = await Promise.all([api.get('/vehicles?limit=100'), api.get('/drivers?limit=100')]);
      setVehicles(v.data.data); setDrivers(d.data.data);
    } catch {}
  };

  const openCreate = async () => {
    await loadDropdowns();
    setEditing(null);
    setForm({ vehicleId: '', driverId: '', fuelDate: new Date().toISOString().split('T')[0], fuelType: 'DIESEL', quantity: '', pricePerUnit: '', totalCost: '', odometerReading: '', station: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = async (l) => {
    await loadDropdowns();
    setEditing(l);
    setForm({ vehicleId: l.vehicleId, driverId: l.driverId, fuelDate: l.fuelDate?.split('T')[0] || '', fuelType: l.fuelType, quantity: parseFloat(l.quantity), pricePerUnit: parseFloat(l.pricePerUnit), totalCost: parseFloat(l.totalCost), odometerReading: parseFloat(l.odometerReading), station: l.station || '', notes: l.notes || '' });
    setModalOpen(true);
  };

  // Auto-calculate totalCost
  const updateQuantity = (val) => {
    const qty = parseFloat(val) || 0;
    const price = parseFloat(form.pricePerUnit) || 0;
    setForm({ ...form, quantity: val, totalCost: (qty * price).toFixed(2) });
  };
  const updatePrice = (val) => {
    const price = parseFloat(val) || 0;
    const qty = parseFloat(form.quantity) || 0;
    setForm({ ...form, pricePerUnit: val, totalCost: (qty * price).toFixed(2) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, vehicleId: parseInt(form.vehicleId), driverId: parseInt(form.driverId), quantity: parseFloat(form.quantity), pricePerUnit: parseFloat(form.pricePerUnit), totalCost: parseFloat(form.totalCost), odometerReading: parseFloat(form.odometerReading), station: form.station || null, notes: form.notes || null };
    try {
      if (editing) { await api.put(`/fuel-logs/${editing.id}`, payload); toast.success('Updated'); }
      else { await api.post('/fuel-logs', payload); toast.success('Fuel log created'); }
      setModalOpen(false); fetchLogs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/fuel-logs/${deleteTarget.id}`); toast.success('Deleted'); setDeleteTarget(null); fetchLogs(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); } finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Fuel Logs</h1><p className="page-subtitle">Track fuel consumption and costs</p></div>
        {canWrite && <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Log Fuel</button>}
      </div>
      <div className="filter-bar">
        <div className="search-input"><Search className="search-icon" size={16} /><input placeholder="Search..." value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} /></div>
        <select className="form-select" style={{ width: 140 }} value={query.fuelType} onChange={(e) => setQuery({ ...query, fuelType: e.target.value, page: 1 })}><option value="">All Fuel</option>{FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}</select>
      </div>
      {loading ? <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div> : logs.length === 0 ? (
        <div className="card"><div className="empty-state"><Fuel size={40} className="empty-state-icon" /><h3>No fuel logs</h3></div></div>
      ) : (
        <><div className="table-container"><table><thead><tr><th>Date</th><th>Vehicle</th><th>Driver</th><th>Fuel</th><th>Qty (L)</th><th>₹/Unit</th><th>Total (₹)</th><th>Odometer</th><th>Actions</th></tr></thead>
          <tbody>{logs.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.fuelDate).toLocaleDateString('en-IN')}</td>
              <td style={{ fontWeight: 600 }}>{l.vehicle?.registrationNumber}</td>
              <td>{l.driver?.firstName} {l.driver?.lastName}</td>
              <td><span className="badge badge-neutral">{l.fuelType}</span></td>
              <td>{parseFloat(l.quantity).toLocaleString()}</td>
              <td>₹{parseFloat(l.pricePerUnit).toFixed(2)}</td>
              <td style={{ fontWeight: 600 }}>₹{parseFloat(l.totalCost).toLocaleString('en-IN')}</td>
              <td>{parseFloat(l.odometerReading).toLocaleString()} km</td>
              <td><div style={{ display: 'flex', gap: '0.25rem' }}>
                {canWrite && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(l)}><Edit2 size={15} /></button>}
                {canDelete && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(l)} style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>}
              </div></td>
            </tr>
          ))}</tbody></table></div>
          <Pagination meta={meta} onPageChange={(p) => setQuery({ ...query, page: p })} />
        </>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Fuel Log' : 'Log Fuel'} size="lg">
        <form onSubmit={handleSubmit}><ModalBody>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Vehicle *</label><select className="form-select" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required><option value="">Select</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Driver *</label><select className="form-select" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} required><option value="">Select</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.fuelDate} onChange={(e) => setForm({ ...form, fuelDate: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Fuel Type *</label><select className="form-select" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>{FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Quantity (L) *</label><input className="form-input" type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => updateQuantity(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Price/Unit (₹) *</label><input className="form-input" type="number" min="0.01" step="0.01" value={form.pricePerUnit} onChange={(e) => updatePrice(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Total Cost (₹)</label><input className="form-input" type="number" value={form.totalCost} readOnly style={{ background: 'var(--bg-primary)' }} /></div>
            <div className="form-group"><label className="form-label">Odometer (km) *</label><input className="form-input" type="number" min="0" value={form.odometerReading} onChange={(e) => setForm({ ...form, odometerReading: e.target.value })} required /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Station</label><input className="form-input" value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} /></div>
          </div>
        </ModalBody><ModalFooter>
          <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </ModalFooter></form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Log" message="Delete this fuel log?" loading={deleting} />
    </div>
  );
}
