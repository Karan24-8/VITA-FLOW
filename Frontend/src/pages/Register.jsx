import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { signUpUser, loginUser } from '../api/apiClient';

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthMeta = [
  { label: '', color: 'transparent' },
  { label: 'Weak',   color: '#DC2626' },
  { label: 'Fair',   color: '#D97706' },
  { label: 'Good',   color: '#059669' },
  { label: 'Strong', color: '#1D4ED8' },
];

// Roles available at signup — dba is intentionally excluded (set via DB)
const ROLE_OPTIONS = [
  { value: 'user',       label: 'User',       desc: 'Get personalised diet & workout plans', icon: '🏃' },
  { value: 'consultant', label: 'Consultant',  desc: 'Manage and guide users on their plans',  icon: '🩺' },
  { value: 'dba',        label: 'DBA',         desc: 'Full system access and administration',  icon: '🛠️' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = getStrength(form.password);
  const meta = strengthMeta[strength];

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.role) e.role = 'Please select a role';
    return e;
  };

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (errors.form)   setErrors(prev => ({ ...prev, form: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // Step 1: Create account — role is sent to backend
      await signUpUser({
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
      });

      // Step 2: Auto-login to get token
      const loginRes = await loginUser({ email: form.email, password: form.password });
      const { token, user } = loginRes.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // { email, id, role }

      // Step 3: Pre-fill name for SetupProfile
      localStorage.setItem('register-name', form.name);

      // Step 4: Route based on role
      // Consultants & DBAs skip the health setup — go straight to their dashboard
      if (form.role === 'consultant') {
        navigate('/consultant-dashboard');
      } else if (form.role === 'dba') {
        navigate('/dba-dashboard');
      } else {
        navigate('/setup');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        (typeof err?.response?.data?.error === 'string' ? err.response.data.error : null) ||
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-brand">
        <div className="brand-logo-mark">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="15" fill="rgba(59,130,246,0.18)"/>
            <path d="M15 6v18M9 10l6 3 6-3" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="brand-logo-text">VITA-FLOW</span>
        </div>
        <div className="brand-body">
          <h1 className="brand-headline">Your health,<br /><em>precisely planned.</em></h1>
          <p className="brand-sub">Diet plans and personalised fitness goals tailored to your biology.</p>
          <div className="brand-features">
            {[
              'Calorie & macro tracking built around you',
              'Personalised diet plan: Breakfast, Lunch & Dinner',
              'Adaptive workout scheduling',
              'Expert consultants available on-demand',
            ].map((f) => (
              <div className="brand-feature" key={f}>
                <div className="brand-feature-dot" />
                <span className="brand-feature-text">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-side-top"><ThemeToggle /></div>
        <div className="auth-form-inner">
          <h2 className="auth-form-title">Create your account</h2>
          <p className="auth-form-subtitle">Start your health journey today — it's free.</p>

          <form onSubmit={handleSubmit} className="auth-form-stack" noValidate>

            {errors.form && (
              <div style={{
                color: 'var(--error)', background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 13, textAlign: 'center',
              }}>
                {errors.form}
              </div>
            )}

            {/* Full name */}
            <div className="form-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                className={`form-input${errors.name ? ' error' : ''}`}
                type="text" placeholder="Jane Doe" autoComplete="name"
                value={form.name} onChange={set('name')}
              />
              {errors.name && <span style={{ fontSize: 12, color: 'var(--error)' }}>{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                type="email" placeholder="jane@example.com" autoComplete="email"
                value={form.email} onChange={set('email')}
              />
              {errors.email && <span style={{ fontSize: 12, color: 'var(--error)' }}>{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  className={`form-input${errors.password ? ' error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters" autoComplete="new-password"
                  value={form.password} onChange={set('password')}
                />
                <span className="input-icon-right" onClick={() => setShowPass(p => !p)}>
                  <EyeIcon open={showPass} />
                </span>
              </div>
              {form.password.length > 0 && (
                <div>
                  <div className="strength-bar">
                    <div className="strength-fill" style={{ width: `${(strength / 4) * 100}%`, background: meta.color }} />
                  </div>
                  <span style={{ fontSize: 11, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                </div>
              )}
              {errors.password && <span style={{ fontSize: 12, color: 'var(--error)' }}>{errors.password}</span>}
            </div>

            {/* ✅ Role selector */}
            <div className="form-field">
              <label>I am joining as</label>
              {errors.role && <span style={{ fontSize: 12, color: 'var(--error)' }}>{errors.role}</span>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {ROLE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${form.role === opt.value ? 'var(--accent)' : 'var(--border-default)'}`,
                      background: form.role === opt.value ? 'var(--accent-light)' : 'var(--bg-input)',
                      transition: 'all 150ms',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={form.role === opt.value}
                      onChange={set('role')}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: 20 }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </div>
                    {form.role === opt.value && (
                      <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
          </form>

          <p className="auth-form-footer" style={{ marginTop: 28 }}>
            Already have an account? <Link to="/login" className="link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
