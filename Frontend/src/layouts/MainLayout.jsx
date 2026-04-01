import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import '../appShell.css';

/* ── Nav Icons ── */
const PlannerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/>
    <line x1="16" y1="14" x2="16.01" y2="14"/>
  </svg>
);

const WeeklyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const ConsultantsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const VitaLogo = () => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
    <circle cx="15" cy="15" r="15" fill="rgba(59,130,246,0.18)"/>
    <path d="M15 6v18M9 10l6 3 6-3" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MainLayout() {
  const navigate = useNavigate();

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('vita-profile')) || {}; } catch { return {}; }
  })();

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('vita-profile');
    localStorage.removeItem('vita-daily-log');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <div className="app-shell">

      {/* ── Sidebar ── */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <VitaLogo />
          <span className="sidebar-logo-text">VITA-FLOW</span>
        </div>

        <span className="sidebar-section-label">Menu</span>

        <nav className="sidebar-nav">
          <NavLink to="/planner" className={navLinkClass}>
            <PlannerIcon />
            <span>Day Planner</span>
          </NavLink>
          <NavLink to="/weekly" className={navLinkClass}>
            <WeeklyIcon />
            <span>Weekly Plan</span>
          </NavLink>
          <NavLink to="/consultants" className={navLinkClass}>
            <ConsultantsIcon />
            <span>Consultants</span>
          </NavLink>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          {/* User info — click to go to profile */}
          <div className="sidebar-user" onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
            title="View Profile">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{profile.name || 'Your Profile'}</div>
              <div className="sidebar-user-sub">{profile.meal_pref || 'Setup complete'}</div>
            </div>
          </div>

          {/* Theme Toggle row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px' }}>
            <ThemeToggle />
            <span className="sidebar-link" style={{ flex: 1, height: 'auto', padding: 0, fontSize: 13 }}>
              Toggle theme
            </span>
          </div>

          {/* Logout */}
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