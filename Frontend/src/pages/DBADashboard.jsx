import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../api/apiClient';

const ROLE_META = {
  user:       { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)'  },
  consultant: { color: '#059669', bg: 'rgba(5,150,105,0.10)'   },
  dba:        { color: '#7C3AED', bg: 'rgba(124,58,237,0.10)'  },
};

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)', padding: '18px 20px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

export default function DBADashboard() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllUsers();
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Failed to load users.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !q ||
      (u.name  || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const counts = {
    total:      users.length,
    users:      users.filter(u => u.role === 'user').length,
    consultants:users.filter(u => u.role === 'consultant').length,
    dbas:       users.filter(u => u.role === 'dba').length,
  };

  return (
    <div style={{ padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          DBA Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Full system overview — all accounts across all roles
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Accounts"  value={counts.total}       />
        <StatCard label="Users"           value={counts.users}       color="#3B82F6" />
        <StatCard label="Consultants"     value={counts.consultants} color="#059669" />
        <StatCard label="DBAs"            value={counts.dbas}        color="#7C3AED" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'user', 'consultant', 'dba'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: '1.5px solid',
                borderColor: roleFilter === r ? 'var(--accent)' : 'var(--border-default)',
                background:  roleFilter === r ? 'var(--accent)' : 'transparent',
                color:       roleFilter === r ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 150ms',
                fontFamily: 'var(--font-body)', textTransform: 'capitalize',
              }}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
          {filtered.length} account{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading users...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--error)' }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No accounts found.</div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                {['User', 'Role', 'Age', 'Weight', 'Goal', 'Activity', 'Diet Pref', 'Deadline'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const initials = (u.name || u.email || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const rm = ROLE_META[u.role] || ROLE_META.user;
                return (
                  <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.name || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: rm.bg, color: rm.color, textTransform: 'capitalize' }}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.age || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.weight_kg ? `${u.weight_kg}kg` : '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.aim_kg ? `${u.aim_kg}kg` : '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.activity_level || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.meal_preferences || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {u.deadline ? new Date(u.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
