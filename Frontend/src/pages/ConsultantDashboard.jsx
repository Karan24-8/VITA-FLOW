import React, { useState, useEffect } from 'react';
import { getConsultantUsers, updateUserPlan } from '../api/apiClient';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ── User row in the table ──
function UserRow({ user, onSelect, selected }) {
  const initials = (user.name || user.email || 'U')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const hasPlan =
    (Array.isArray(user.diet_plan_breakfast) && user.diet_plan_breakfast.length > 0) ||
    (Array.isArray(user.workout_plan) && user.workout_plan.length > 0);

  return (
    <tr
      onClick={() => onSelect(user)}
      style={{
        cursor: 'pointer',
        background: selected ? 'var(--accent-light)' : 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 150ms',
      }}
    >
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name || '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{user.age ? `${user.age} yrs` : '—'}</td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{user.weight_kg ? `${user.weight_kg} kg` : '—'}</td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{user.activity_level || '—'}</td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{user.meal_preferences || '—'}</td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
          background: hasPlan ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
          color: hasPlan ? '#059669' : '#DC2626',
          border: `1px solid ${hasPlan ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          {hasPlan ? 'Plan Active' : 'No Plan'}
        </span>
      </td>
    </tr>
  );
}

// ── Plan editor panel ──
function PlanEditor({ user, onClose, onSaved }) {
  // Diet: 7 days × 3 meals — each day is an array of food strings
  const parseDietDay = (plan, mealKey) => {
    const rows = Array.isArray(plan?.[mealKey]) ? plan[mealKey] : [];
    return DAYS.map((_, i) => (Array.isArray(rows[i]) ? rows[i].join(', ') : ''));
  };

  const [breakfast, setBreakfast] = useState(() => parseDietDay(user, 'diet_plan_breakfast'));
  const [lunch,     setLunch]     = useState(() => parseDietDay(user, 'diet_plan_lunch'));
  const [dinner,    setDinner]    = useState(() => parseDietDay(user, 'diet_plan_dinner'));

  // Workout: 7-day array from workout_plan
  const parseWorkout = (plan) => {
    const wp = Array.isArray(plan?.workout_plan) ? plan.workout_plan : [];
    return DAYS.map((day, i) => {
      const existing = wp.find(d => d.day_name === day) || wp[i];
      return {
        focus:     existing?.focus || '',
        exercises: Array.isArray(existing?.exercises)
          ? existing.exercises.map(e => e.name || e.exercise_name || '').join(', ')
          : '',
      };
    });
  };

  const [workout, setWorkout] = useState(() => parseWorkout(user));

  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState('');
  const [success,setSuccess]  = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      // Convert text strings back to arrays that match DB schema
      // diet_plan_breakfast: TEXT[][] → each day is an array of food strings
      const toMealArray = (dayStrings) =>
        dayStrings.map(s => s.split(',').map(x => x.trim()).filter(Boolean));

      // workout_plan: JSONB array matching generate_weekly_workout_plan output shape
      const workoutPlan = DAYS.map((day, i) => ({
        day:       i + 1,
        day_name:  day,
        focus:     workout[i].focus || 'Rest',
        exercises: workout[i].exercises
          ? workout[i].exercises.split(',').map((name, idx) => ({
              name:     name.trim(),
              sets:     3,
              reps:     12,
              duration_min: null,
            })).filter(e => e.name)
          : [],
      }));

      await updateUserPlan(user.user_id, {
        diet_plan_breakfast: toMealArray(breakfast),
        diet_plan_lunch:     toMealArray(lunch),
        diet_plan_dinner:    toMealArray(dinner),
        workout_plan:        workoutPlan,
      });

      setSuccess(true);
      onSaved();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to save plan.'
      );
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '7px 10px',
    borderRadius: 8, border: '1.5px solid var(--border-default)',
    background: 'var(--bg-input)', color: 'var(--text-primary)',
    fontSize: 13, fontFamily: 'var(--font-body)',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-card" style={{
        padding: 0, width: '100%', maxWidth: 760, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Edit Plan — {user.name || user.email}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {user.meal_preferences || '—'} · {user.activity_level || '—'} · {user.weight_kg ? `${user.weight_kg}kg` : '—'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>

          {/* Diet section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              🥗 Diet Plan (7 days)
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Enter food items separated by commas for each day and meal.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: 6, marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}></div>
              {['Breakfast', 'Lunch', 'Dinner'].map(m => (
                <div key={m} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m}</div>
              ))}
            </div>
            {DAYS.map((day, i) => (
              <div key={day} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{day.slice(0, 3)}</div>
                <input style={inputStyle} placeholder="e.g. Oats, Banana" value={breakfast[i]} onChange={e => setBreakfast(prev => prev.map((v, j) => j === i ? e.target.value : v))} />
                <input style={inputStyle} placeholder="e.g. Roti, Dal" value={lunch[i]} onChange={e => setLunch(prev => prev.map((v, j) => j === i ? e.target.value : v))} />
                <input style={inputStyle} placeholder="e.g. Rice, Chicken" value={dinner[i]} onChange={e => setDinner(prev => prev.map((v, j) => j === i ? e.target.value : v))} />
              </div>
            ))}
          </div>

          {/* Workout section */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              💪 Workout Plan (7 days)
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Enter focus area and exercises separated by commas. Leave exercises empty for Rest days.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 160px 1fr', gap: 6, marginBottom: 6 }}>
              <div />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Focus</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exercises (comma-separated)</div>
            </div>
            {DAYS.map((day, i) => (
              <div key={day} style={{ display: 'grid', gridTemplateColumns: '80px 160px 1fr', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{day.slice(0, 3)}</div>
                <input
                  style={inputStyle}
                  placeholder="e.g. Cardio"
                  value={workout[i].focus}
                  onChange={e => setWorkout(prev => prev.map((v, j) => j === i ? { ...v, focus: e.target.value } : v))}
                />
                <input
                  style={inputStyle}
                  placeholder="e.g. Running, Jump rope"
                  value={workout[i].exercises}
                  onChange={e => setWorkout(prev => prev.map((v, j) => j === i ? { ...v, exercises: e.target.value } : v))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10, alignItems: 'center' }}>
          {error   && <span style={{ fontSize: 13, color: 'var(--error)', flex: 1 }}>{error}</span>}
          {success && <span style={{ fontSize: 13, color: 'var(--success)', flex: 1 }}>✓ Plan saved successfully!</span>}
          {!error && !success && <div style={{ flex: 1 }} />}
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function ConsultantDashboard() {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editing,      setEditing]      = useState(false);
  const [search,       setSearch]       = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getConsultantUsers();
      // Filter to only show users (not other consultants or DBAs)
      const onlyUsers = Array.isArray(res.data)
        ? res.data.filter(u => u.role === 'user')
        : [];
      setUsers(onlyUsers);
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

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q ||
      (u.name  || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);
  });

  const handleSaved = () => {
    fetchUsers(); // Refresh list after plan update
  };

  return (
    <div style={{ padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Consultant Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            View your users and update their diet & workout plans
          </p>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border-subtle)' }}>
          {filtered.length} user{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users',     value: users.length },
          { label: 'With Active Plan', value: users.filter(u => Array.isArray(u.diet_plan_breakfast) && u.diet_plan_breakfast.length > 0).length },
          { label: 'Need Plan',       value: users.filter(u => !u.diet_plan_breakfast || !u.diet_plan_breakfast.length).length },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading users...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--error)' }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                {['User', 'Age', 'Weight', 'Activity', 'Diet Pref', 'Plan Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <UserRow
                  key={u.user_id}
                  user={u}
                  selected={selectedUser?.user_id === u.user_id}
                  onSelect={(u) => { setSelectedUser(u); setEditing(true); }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected user detail card */}
      {selectedUser && !editing && (
        <div className="card" style={{ marginTop: 24, border: '1.5px solid var(--accent-border)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedUser.name || selectedUser.email}
            </div>
            <button className="btn-primary" onClick={() => setEditing(true)}>
              ✏️ Edit Plan
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, fontSize: 13 }}>
            {[
              { label: 'Email',     value: selectedUser.email },
              { label: 'Age',       value: selectedUser.age ? `${selectedUser.age} yrs` : '—' },
              { label: 'Height',    value: selectedUser.height_cm ? `${selectedUser.height_cm} cm` : '—' },
              { label: 'Weight',    value: selectedUser.weight_kg ? `${selectedUser.weight_kg} kg` : '—' },
              { label: 'Goal',      value: selectedUser.aim_kg ? `${selectedUser.aim_kg} kg` : '—' },
              { label: 'Deadline',  value: selectedUser.deadline ? new Date(selectedUser.deadline).toLocaleDateString('en-IN') : '—' },
              { label: 'Activity',  value: selectedUser.activity_level || '—' },
              { label: 'Diet Pref', value: selectedUser.meal_preferences || '—' },
              { label: 'Allergies', value: Array.isArray(selectedUser.allergies) ? selectedUser.allergies.join(', ') || 'None' : selectedUser.allergies || 'None' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan editor modal */}
      {editing && selectedUser && (
        <PlanEditor
          user={selectedUser}
          onClose={() => { setEditing(false); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
