import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Search, Truck, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = ['TRUCK', 'VAN', 'BUS', 'CAR', 'TRAILER'];
const FUELS = ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'];
const STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];

const STATUS_BADGE = {
  AVAILABLE: 'badge-success',
  ON_TRIP: 'badge-info',
  IN_SHOP: 'badge-warning',
  RETIRED: 'badge-neutral',
};

const emptyForm = {
  registrationNumber: '', make: '', model: '', year: new Date().getFullYear(),
  type: 'TRUCK', capacityKg: '', fuelType: 'DIESEL', status: 'AVAILABLE',
  mileage: 0, insuranceExpiry: '', lastServiceDate: '',
};

export default function VehiclesPage() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN', 'MANAGER');

  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', status: '', type: '', fuelType: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [viewTarget, setViewTarget] = useState(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(query).forEach(([k, v]) => { if (v !== '' && v !== undefined) params[k] = v; });
      const res = await api.get('/vehicles', { params });
      setVehicles(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      registrationNumber: v.registrationNumber,
      make: v.make, model: v.model, year: v.year, type: v.type,
      capacityKg: parseFloat(v.capacityKg), fuelType: v.fuelType, status: v.status,
      mileage: parseFloat(v.mileage),
      insuranceExpiry: v.insuranceExpiry ? v.insuranceExpiry.split('T')[0] : '',
      lastServiceDate: v.lastServiceDate ? v.lastServiceDate.split('T')[0] : '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {
      ...form,
      year: parseInt(form.year),
      capacityKg: parseFloat(form.capacityKg),
      mileage: parseFloat(form.mileage) || 0,
      insuranceExpiry: form.insuranceExpiry || null,
      lastServiceDate: form.lastServiceDate || null,
    };

    try {
      if (editing) {
        await api.put(`/vehicles/${editing.id}`, payload);
        toast.success('Vehicle updated');
      } else {
        await api.post('/vehicles', payload);
        toast.success('Vehicle created');
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      const msg = err.response?.data;
      if (msg?.errors) {
        const errs = {};
        msg.errors.forEach((e) => { errs[e.path] = e.message; });
        setErrors(errs);
      } else {
        toast.error(msg?.message || 'Failed to save vehicle');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/vehicles/${deleteTarget.id}`);
      toast.success('Vehicle deleted');
      setDeleteTarget(null);
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const viewVehicle = async (id) => {
    try {
      const res = await api.get(`/vehicles/${id}`);
      setViewTarget(res.data.data);
    } catch {
      toast.error('Failed to load vehicle details');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">Manage your fleet of vehicles</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> Add Vehicle
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" size={16} />
          <input
            placeholder="Search vehicles..."
            value={query.search}
            onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
          />
        </div>
        <select className="form-select" style={{ width: 140 }} value={query.status} onChange={(e) => setQuery({ ...query, status: e.target.value, page: 1 })}>
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 130 }} value={query.type} onChange={(e) => setQuery({ ...query, type: e.target.value, page: 1 })}>
          <option value="">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="form-select" style={{ width: 130 }} value={query.fuelType} onChange={(e) => setQuery({ ...query, fuelType: e.target.value, page: 1 })}>
          <option value="">All Fuel</option>
          {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /><span>Loading...</span></div>
      ) : vehicles.length === 0 ? (
        <div className="card"><div className="empty-state"><Truck size={40} className="empty-state-icon" /><h3>No vehicles found</h3><p>Try adjusting your filters</p></div></div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reg. Number</th>
                  <th>Make / Model</th>
                  <th>Year</th>
                  <th>Type</th>
                  <th>Fuel</th>
                  <th>Capacity (kg)</th>
                  <th>Mileage (km)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                    <td>{v.make} {v.model}</td>
                    <td>{v.year}</td>
                    <td><span className="badge badge-neutral">{v.type}</span></td>
                    <td>{v.fuelType}</td>
                    <td>{parseFloat(v.capacityKg).toLocaleString()}</td>
                    <td>{parseFloat(v.mileage).toLocaleString()}</td>
                    <td><span className={`badge ${STATUS_BADGE[v.status]}`}>{v.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => viewVehicle(v.id)} title="View"><Eye size={15} /></button>
                        {canWrite && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(v)} title="Edit"><Edit2 size={15} /></button>}
                        {canWrite && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(v)} title="Delete" style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>}
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

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vehicle' : 'Add Vehicle'} size="lg">
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Registration Number *</label>
                <input className={`form-input ${errors.registrationNumber ? 'error' : ''}`} value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} required />
                {errors.registrationNumber && <span className="form-error">{errors.registrationNumber}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Make *</label>
                <input className="form-input" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Model *</label>
                <input className="form-input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Year *</label>
                <input className="form-input" type="number" min="1990" max="2100" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity (kg) *</label>
                <input className="form-input" type="number" min="1" step="0.01" value={form.capacityKg} onChange={(e) => setForm({ ...form, capacityKg: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Type *</label>
                <select className="form-select" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
                  {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mileage (km)</label>
                <input className="form-input" type="number" min="0" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Insurance Expiry</label>
                <input className="form-input" type="date" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : editing ? 'Update Vehicle' : 'Create Vehicle'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="Vehicle Details" size="md">
        {viewTarget && (
          <ModalBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              {[
                ['Registration', viewTarget.registrationNumber],
                ['Status', <span className={`badge ${STATUS_BADGE[viewTarget.status]}`}>{viewTarget.status}</span>],
                ['Make', viewTarget.make],
                ['Model', viewTarget.model],
                ['Year', viewTarget.year],
                ['Type', viewTarget.type],
                ['Fuel Type', viewTarget.fuelType],
                ['Capacity', `${parseFloat(viewTarget.capacityKg).toLocaleString()} kg`],
                ['Mileage', `${parseFloat(viewTarget.mileage).toLocaleString()} km`],
                ['Insurance Expiry', viewTarget.insuranceExpiry ? new Date(viewTarget.insuranceExpiry).toLocaleDateString('en-IN') : 'N/A'],
                ['Trips', viewTarget._count?.trips ?? 'N/A'],
                ['Maintenance Logs', viewTarget._count?.maintenanceLogs ?? 'N/A'],
              ].map(([label, value], i) => (
                <div key={i}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.125rem' }}>{label}</div>
                  <div style={{ fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
          </ModalBody>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle "${deleteTarget?.registrationNumber}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
