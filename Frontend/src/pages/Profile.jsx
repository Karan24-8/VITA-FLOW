import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── BMI helpers ── */
function calcBMI(height, weight) {
  const h = parseFloat(height) / 100;
  const w = parseFloat(weight);
  if (!h || !w || h <= 0) return null;
  return (w / (h * h)).toFixed(1);
}

function bmiMeta(bmi) {
  if (!bmi) return { label: '—', color: 'var(--text-muted)' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'var(--warning)' };
  if (bmi < 25)   return { label: 'Healthy', color: 'var(--success)' };
  if (bmi < 30)   return { label: 'Overweight', color: 'var(--warning)' };
  return           { label: 'Obese', color: 'var(--error)' };
}

function StatTile({ label, value, unit }) {
  return (
    <div style={{
      background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)', padding: '14px 16px', flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value ?? <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>—</span>}
        {value && unit && <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>
        {value || <em style={{ color: 'var(--text-muted)', fontStyle: 'normal', fontSize: 13 }}>Not set</em>}
      </span>
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
      background: color + '1a', color, border: `1px solid ${color}33`,
    }}>{text}</span>
  );
}

const ACTIVITY_EMOJI = { Light: '🚶', Moderate: '🏃', Heavy: '🏋️' };

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('vita-profile')) || {};
      setProfile(data);
    } catch { setProfile({}); }
  }, []);

  const bmi  = calcBMI(profile.height_cm, profile.weight_kg);
  const meta = bmiMeta(bmi);
  const bmiWidth = bmi ? Math.min(Math.max(((parseFloat(bmi) - 10) / 35) * 100, 2), 98) : 0;

  const initials = (profile.name || 'U')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const genderLabel = { M: 'Male', F: 'Female', T: 'Other' };

  return (
    <div style={{ maxWidth: 660, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Profile</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Your health data and preferences</p>
        </div>
      </div>

      {/* ── Identity Card ── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 0 }}>
          <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-heading)' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{profile.name || 'Your Name'}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {profile.meal_pref && <Badge text={profile.meal_pref === 'Veg' ? '🥦 Vegetarian' : '🍗 Non-Veg'} color="var(--accent)" />}
              {profile.activity_level && <Badge text={`${ACTIVITY_EMOJI[profile.activity_level] || ''} ${profile.activity_level}`} color="var(--text-secondary)" />}
              {profile.gender && <Badge text={genderLabel[profile.gender] || profile.gender} color="var(--text-muted)" />}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <InfoRow label="Phone" value={profile.phone} />
          <InfoRow label="Age" value={profile.age ? `${profile.age} years` : null} />
          {profile.allergies && <InfoRow label="Allergies" value={profile.allergies} />}
        </div>
      </div>

      {/* ── Body Metrics Card ── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Body Metrics</h3>

        <div style={{ display: 'flex', gap: 10, marginBottom: (profile.height_cm && profile.weight_kg) ? 16 : 0, flexWrap: 'wrap' }}>
          <StatTile label="Height" value={profile.height_cm} unit="cm" />
          <StatTile label="Weight" value={profile.weight_kg} unit="kg" />
          <StatTile label="Goal" value={profile.aim_kg} unit="kg" />
        </div>

        {/* BMI bar */}
        {profile.height_cm && profile.weight_kg && (
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>BMI Score</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: meta.color, lineHeight: 1 }}>{bmi}</span>
                <Badge text={meta.label} color={meta.color} />
              </div>
            </div>
            <div style={{ position: 'relative', height: 8, borderRadius: 99, background: 'linear-gradient(90deg, #60A5FA 0%, #34D399 28%, #FCD34D 60%, #F87171 100%)' }}>
              <div style={{
                position: 'absolute', top: '50%', left: `${bmiWidth}%`,
                transform: 'translate(-50%, -50%)',
                width: 16, height: 16, borderRadius: '50%',
                background: meta.color, border: '2px solid var(--bg-card)',
                boxShadow: `0 0 0 3px ${meta.color}55`,
                transition: 'left 0.4s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.03em' }}>
              <span>Underweight</span><span>Healthy</span><span>Overweight</span><span>Obese</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Preferences Card ── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Preferences</h3>
        <InfoRow label="Activity level" value={profile.activity_level ? `${ACTIVITY_EMOJI[profile.activity_level] || ''} ${profile.activity_level}` : null} />
        <InfoRow label="Diet" value={profile.meal_pref === 'Veg' ? '🥦 Vegetarian' : profile.meal_pref === 'Non-Veg' ? '🍗 Non-Veg' : null} />
        <InfoRow label="Goal deadline" value={profile.deadline ? new Date(profile.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
      </div>

    </div>
  );
}
