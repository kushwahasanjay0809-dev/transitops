import { useState } from 'react';
import api from '../lib/api';
import { BarChart3, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const REPORTS = [
  { key: 'trips', label: 'Trip Report', desc: 'All trips within a date range', icon: '🚛' },
  { key: 'expenses', label: 'Expense Report', desc: 'Expenses grouped by category', icon: '💰' },
  { key: 'fuel', label: 'Fuel Report', desc: 'Fuel consumption and costs', icon: '⛽' },
  { key: 'vehicle-utilization', label: 'Vehicle Utilization', desc: 'Per-vehicle metrics and fuel efficiency', icon: '📊' },
];

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async (key) => {
    if (!dateFrom || !dateTo) { toast.error('Please select date range'); return; }
    setLoading(true); setActiveReport(key); setReportData(null);
    try {
      const res = await api.get(`/reports/${key}`, { params: { dateFrom, dateTo } });
      setReportData(res.data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate report'); }
    finally { setLoading(false); }
  };

  const downloadCSV = async (key) => {
    if (!dateFrom || !dateTo) { toast.error('Please select date range'); return; }
    try {
      const res = await api.get(`/reports/${key}`, { params: { dateFrom, dateTo, format: 'csv' }, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `${key}_report_${dateFrom}_${dateTo}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch { toast.error('Failed to download CSV'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Reports</h1><p className="page-subtitle">Generate and export operational reports</p></div>
      </div>

      {/* Date Range */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group"><label className="form-label">From Date</label><input className="form-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">To Date</label><input className="form-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
        </div>
      </div>

      {/* Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {REPORTS.map((r) => (
          <div key={r.key} className="card" style={{ cursor: 'pointer' }} onClick={() => generateReport(r.key)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '2rem' }}>{r.icon}</div>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); downloadCSV(r.key); }} title="Download CSV"><Download size={16} /></button>
            </div>
            <h4 style={{ marginBottom: '0.25rem' }}>{r.label}</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Report Output */}
      {loading && <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /><span>Generating report...</span></div>}

      {reportData && activeReport === 'trips' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Trip Report Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <SummaryCard label="Total Trips" value={reportData.summary.totalTrips} />
            <SummaryCard label="Completed" value={reportData.summary.completed} />
            <SummaryCard label="Cancelled" value={reportData.summary.cancelled} />
            <SummaryCard label="Distance (km)" value={reportData.summary.totalDistanceKm.toLocaleString()} />
          </div>
          <div className="table-container"><table><thead><tr><th>Trip #</th><th>Route</th><th>Vehicle</th><th>Driver</th><th>Status</th></tr></thead>
            <tbody>{reportData.trips.slice(0, 20).map((t) => (
              <tr key={t.id}><td style={{ fontWeight: 600 }}>{t.tripNumber}</td><td>{t.originRegion?.code} → {t.destinationRegion?.code}</td><td>{t.vehicle?.registrationNumber}</td><td>{t.driver?.firstName} {t.driver?.lastName}</td><td><span className="badge badge-neutral">{t.status}</span></td></tr>
            ))}</tbody></table></div>
          {reportData.trips.length > 20 && <p style={{ padding: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Showing 20 of {reportData.trips.length} — download CSV for full data</p>}
        </div>
      )}

      {reportData && activeReport === 'expenses' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Expense Report Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <SummaryCard label="Total Expenses" value={reportData.summary.totalExpenses} />
            <SummaryCard label="Total Amount" value={`₹${reportData.summary.totalAmount.toLocaleString('en-IN')}`} />
          </div>
          <h4 style={{ marginBottom: '0.75rem' }}>By Category</h4>
          <div className="table-container"><table><thead><tr><th>Category</th><th>Count</th><th>Total (₹)</th></tr></thead>
            <tbody>{reportData.summary.categoryBreakdown.map((c) => (
              <tr key={c.category}><td style={{ fontWeight: 600 }}>{c.category}</td><td>{c.count}</td><td>₹{c.total.toLocaleString('en-IN')}</td></tr>
            ))}</tbody></table></div>
        </div>
      )}

      {reportData && activeReport === 'fuel' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Fuel Report Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            <SummaryCard label="Total Logs" value={reportData.summary.totalLogs} />
            <SummaryCard label="Total Quantity" value={`${reportData.summary.totalQuantity.toLocaleString()} L`} />
            <SummaryCard label="Total Cost" value={`₹${reportData.summary.totalCost.toLocaleString('en-IN')}`} />
            <SummaryCard label="Avg Price/Unit" value={`₹${reportData.summary.avgPricePerUnit}`} />
          </div>
        </div>
      )}

      {reportData && activeReport === 'vehicle-utilization' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Vehicle Utilization Report</h3>
          <div className="table-container"><table><thead><tr><th>Vehicle</th><th>Type</th><th>Trips</th><th>Distance</th><th>Fuel (L)</th><th>Fuel Cost</th><th>Maint. Cost</th><th>Efficiency</th></tr></thead>
            <tbody>{(Array.isArray(reportData) ? reportData : []).map((v) => (
              <tr key={v.vehicleId}><td style={{ fontWeight: 600 }}>{v.registrationNumber}</td><td>{v.type}</td><td>{v.totalTrips}</td><td>{v.totalDistanceKm.toLocaleString()} km</td><td>{v.totalFuelQuantity.toLocaleString()}</td><td>₹{v.totalFuelCost.toLocaleString('en-IN')}</td><td>₹{v.totalMaintenanceCost.toLocaleString('en-IN')}</td><td style={{ fontWeight: 600, color: v.fuelEfficiency > 0 ? 'var(--color-success)' : 'var(--text-muted)' }}>{v.fuelEfficiency > 0 ? `${v.fuelEfficiency} km/L` : 'N/A'}</td></tr>
            ))}</tbody></table></div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
