import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  Receipt,
  BarChart3,
  MapPin,
  Shield,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    section: 'Operations',
    items: [
      { label: 'Vehicles', icon: Truck, path: '/vehicles' },
      { label: 'Drivers', icon: Users, path: '/drivers' },
      { label: 'Trips', icon: Route, path: '/trips' },
      { label: 'Regions', icon: MapPin, path: '/regions' },
    ],
  },
  {
    section: 'Management',
    items: [
      { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
      { label: 'Fuel Logs', icon: Fuel, path: '/fuel-logs' },
      { label: 'Expenses', icon: Receipt, path: '/expenses' },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    section: 'Administration',
    roles: ['ADMIN'],
    items: [
      { label: 'User Management', icon: Shield, path: '/users', roles: ['ADMIN'] },
    ],
  },
];

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavItem = (item) => {
    if (item.roles && !hasRole(...item.roles)) return null;

    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="nav-icon" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="sidebar-overlay"
        style={{ display: 'none' }}
        onClick={() => setCollapsed(true)}
      />

      <aside
        className="sidebar"
        style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : undefined }}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">TO</div>
          {!collapsed && (
            <div>
              <div className="sidebar-brand-text">TransitOps</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Transport Platform
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((group, idx) => {
            // Top-level link (Dashboard)
            if (group.path) return renderNavItem(group);

            // Section with items
            if (group.roles && !hasRole(...group.roles)) return null;

            const visibleItems = group.items.filter(
              (item) => !item.roles || hasRole(...item.roles)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.section || idx}>
                {!collapsed && (
                  <div className="sidebar-section-title">{group.section}</div>
                )}
                {visibleItems.map(renderNavItem)}
              </div>
            );
          })}
        </nav>

        {/* User info & logout */}
        <div
          style={{
            padding: collapsed ? '0.75rem' : '0.75rem 1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.8125rem',
              flexShrink: 0,
            }}
          >
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {user?.role?.name}
              </div>
            </div>
          )}
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={handleLogout}
            title="Logout"
            style={{ flexShrink: 0 }}
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '-12px',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            zIndex: 10,
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
