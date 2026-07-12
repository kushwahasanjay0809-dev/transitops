import { useState, useEffect } from 'react';
import api from '../lib/api';
import {
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
} from 'lucide-react';

const STATUS_COLORS = {
  AVAILABLE: 'badge-success',
  ON_TRIP: 'badge-info',
  IN_SHOP: 'badge-warning',
  RETIRED: 'badge-neutral',
  ON_LEAVE: 'badge-warning',
  SUSPENDED: 'badge-danger',
  SCHEDULED: 'badge-info',
  DISPATCHED: 'badge-warning',
  IN_PROGRESS: 'badge-primary',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  OPEN: 'badge-warning',
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-overlay">
        <XCircle size={40} color="var(--color-danger)" />
        <span>{error}</span>
      </div>
    );
  }

  const { vehicles, drivers, trips, maintenance, expenses, fuel, recentTrips, upcomingTrips, activeMaintenanceLogs, alerts } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your transport operations</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard
          icon={<Truck size={24} />}
          iconBg="rgba(99, 102, 241, 0.15)"
          iconColor="var(--color-primary-light)"
          label="Total Vehicles"
          value={vehicles.total}
          sub={`${vehicles.available} available · ${vehicles.onTrip} on trip`}
        />
        <StatCard
          icon={<Users size={24} />}
          iconBg="rgba(6, 182, 212, 0.15)"
          iconColor="var(--color-accent-light)"
          label="Total Drivers"
          value={drivers.total}
          sub={`${drivers.available} available · ${drivers.onTrip} on trip`}
        />
        <StatCard
          icon={<Route size={24} />}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="var(--color-success-light)"
          label="Active Trips"
          value={trips.activeTrips}
          sub={`${trips.recentCompleted} completed last 30d`}
        />
        <StatCard
          icon={<Wrench size={24} />}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="var(--color-warning-light)"
          label="Active Maintenance"
          value={maintenance.activeCount}
          sub={`₹${maintenance.activeCost.toLocaleString('en-IN')} pending cost`}
        />
        <StatCard
          icon={<Fuel size={24} />}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#a78bfa"
          label="Fuel (This Month)"
          value={`₹${fuel.currentMonthCost.toLocaleString('en-IN')}`}
          sub={`${fuel.currentMonthQuantity.toLocaleString()} L · ${fuel.currentMonthCount} logs`}
        />
        <StatCard
          icon={<Receipt size={24} />}
          iconBg="rgba(236, 72, 153, 0.15)"
          iconColor="#f472b6"
          label="Expenses (This Month)"
          value={`₹${expenses.currentMonthTotal.toLocaleString('en-IN')}`}
          sub={`${expenses.currentMonthCount} entries`}
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="var(--color-success-light)"
          label="Fleet Utilization"
          value={`${vehicles.utilizationRate}%`}
          sub={`${vehicles.onTrip} of ${vehicles.total - vehicles.retired} active`}
        />
        <StatCard
          icon={<MapPin size={24} />}
          iconBg="rgba(6, 182, 212, 0.15)"
          iconColor="var(--color-accent-light)"
          label="Distance (30 days)"
          value={`${trips.recentDistanceKm.toLocaleString()} km`}
          sub={`${trips.total} total trips`}
        />
      </div>

      {/* Alerts */}
      {(alerts.expiringLicenses.length > 0 || alerts.expiringInsurance.length > 0) && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={18} color="var(--color-warning)" />
            <h3 style={{ fontSize: '1rem' }}>Alerts</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {alerts.expiringLicenses.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8125rem', color: 'var(--color-warning-light)', marginBottom: '0.5rem' }}>
                  🪪 Licenses Expiring (30 days)
                </h4>
                {alerts.expiringLicenses.map((d) => (
                  <div key={d.id} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '0.25rem 0' }}>
                    {d.firstName} {d.lastName} — {new Date(d.licenseExpiry).toLocaleDateString('en-IN')}
                  </div>
                ))}
              </div>
            )}
            {alerts.expiringInsurance.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8125rem', color: 'var(--color-warning-light)', marginBottom: '0.5rem' }}>
                  🛡️ Insurance Expiring (30 days)
                </h4>
                {alerts.expiringInsurance.map((v) => (
                  <div key={v.id} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '0.25rem 0' }}>
                    {v.registrationNumber} — {new Date(v.insuranceExpiry).toLocaleDateString('en-IN')}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Trips */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Recent Trips</h3>
            <Clock size={16} color="var(--text-muted)" />
          </div>
          {recentTrips.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>No recent trips</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{trip.tripNumber}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {trip.originRegion?.code} → {trip.destinationRegion?.code} · {trip.vehicle?.registrationNumber}
                    </div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[trip.status] || 'badge-neutral'}`}>
                    {trip.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Trips */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Upcoming Trips</h3>
            <CheckCircle2 size={16} color="var(--text-muted)" />
          </div>
          {upcomingTrips.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>No upcoming trips</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{trip.tripNumber}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {trip.originRegion?.code} → {trip.destinationRegion?.code} · {new Date(trip.scheduledDeparture).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {trip.driver?.firstName} {trip.driver?.lastName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Maintenance */}
      {activeMaintenanceLogs.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Active Maintenance</h3>
            <Wrench size={16} color="var(--text-muted)" />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {activeMaintenanceLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 500 }}>{log.vehicle?.registrationNumber}</td>
                    <td><span className={`badge ${log.type === 'EMERGENCY' ? 'badge-danger' : log.type === 'CORRECTIVE' ? 'badge-warning' : 'badge-info'}`}>{log.type}</span></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.description}</td>
                    <td><span className={`badge ${STATUS_COLORS[log.status]}`}>{log.status}</span></td>
                    <td>₹{parseFloat(log.cost).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
