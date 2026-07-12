import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="main-header">
      <div>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {greeting()},{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {user?.firstName}
          </span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="search-input" style={{ width: 240 }}>
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Search..." />
        </div>

        <button
          className="btn btn-ghost btn-icon"
          title="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--color-danger)',
            }}
          />
        </button>
      </div>
    </header>
  );
}
