import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import '../appShell.css';

/* ── Icons ── */
const PlannerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const WeeklyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const ConsultantsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const VitaLogo = () => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
    <circle cx="15" cy="15" r="15" fill="rgba(59,130,246,0.18)"/>
    <path d="M15 6v18M9 10l6 3 6-3" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ✅ Nav config per role
const NAV_BY_ROLE = {
  user: [
    { to: '/planner',    icon: <PlannerIcon />,    label: 'Day Planner'  },
    { to: '/weekly',     icon: <WeeklyIcon />,     label: 'Weekly Plan'  },
    { to: '/consultants',icon: <ConsultantsIcon />,label: 'Consultants'  },
  ],
  consultant: [
    { to: '/consultant-dashboard', icon: <DashboardIcon />,  label: 'Dashboard'   },
    { to: '/consultants',          icon: <ConsultantsIcon />, label: 'Consultants' },
  ],
  dba: [
    { to: '/dba-dashboard',        icon: <DashboardIcon />,  label: 'Dashboard'   },
    { to: '/consultant-dashboard', icon: <UsersIcon />,      label: 'Manage Users'},
    { to: '/consultants',          icon: <ConsultantsIcon />, label: 'Consultants' },
  ],
};

export default function MainLayout() {
  const navigate = useNavigate();

  // ✅ Read role from localStorage user object (set at login)
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
  })();
  const role = user.role || 'user';

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('vita-profile')) || {}; } catch { return {}; }
  })();

  const initials = (profile.name || user.email || 'U')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // ✅ Role badge colors
  const ROLE_COLORS = { user: '#3B82F6', consultant: '#059669', dba: '#7C3AED' };
  const roleColor   = ROLE_COLORS[role] || '#3B82F6';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('vita-profile');
    localStorage.removeItem('vita-daily-log');
    navigate('/login');
  };

  const navLinks = NAV_BY_ROLE[role] || NAV_BY_ROLE.user;
  const navLinkClass = ({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <div className="app-shell">

      {/* ── Sidebar ── */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <VitaLogo />
          <span className="sidebar-logo-text">VITA-FLOW</span>
        </div>

        {/* ✅ Role badge in sidebar */}
        <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px',
            borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.06em',
            background: roleColor + '1a', color: roleColor, border: `1px solid ${roleColor}33`,
          }}>
            {role}
          </span>
        </div>

        <span className="sidebar-section-label">Menu</span>

        <nav className="sidebar-nav">
          {navLinks.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <div
            className="sidebar-user"
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
            title="View Profile"
          >
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{profile.name || user.email || 'Your Profile'}</div>
              {/* ✅ meal_preferences (correct field name) */}
              <div className="sidebar-user-sub">{profile.meal_preferences || 'Setup complete'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px' }}>
            <ThemeToggle />
            <span className="sidebar-link" style={{ flex: 1, height: 'auto', padding: 0, fontSize: 13 }}>
              Toggle theme
            </span>
          </div>

          <button className="sidebar-link" onClick={logout} style={{ color: 'rgba(248,113,113,0.7)' }}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* ── Page Content ── */}
      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}
