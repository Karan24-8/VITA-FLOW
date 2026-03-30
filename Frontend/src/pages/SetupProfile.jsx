import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

/* ── Reusable Pill Selector ── */
function PillGroup({ options, value, onChange }) {
  return (
    <div className="pill-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`pill-btn${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon && <span style={{ fontSize: 16 }}>{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Step Indicator ── */
function StepTrack({ current, steps }) {
  return (
    <div className="step-track">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="step-item">
            <div className={`step-circle ${i < current ? 'done' : i === current ? 'active' : ''}`}>
              {i < current ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`step-label ${i < current ? 'done' : i === current ? 'active' : ''}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-connector${i < current ? ' done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── BMI Badge ── */
function BMIBadge({ height, weight }) {
  if (!height || !weight) return null;
  const h = parseFloat(height) / 100;
  const w = parseFloat(weight);
  if (!h || !w || h <= 0) return null;
  const bmi = (w / (h * h)).toFixed(1);
  let status = '', cls = '';
  if (bmi < 18.5)  { status = 'Underweight'; cls = 'under'; }
  else if (bmi < 25) { status = 'Healthy weight'; cls = 'healthy'; }
  else if (bmi < 30) { status = 'Overweight'; cls = 'over'; }
  else               { status = 'Obese'; cls = 'obese'; }

  return (
    <div className="bmi-badge">
      <div>
        <div className="bmi-label">Your BMI</div>
        <div className="bmi-value">{bmi}</div>
      </div>
      <div style={{ width: 1, height: 36, background: 'var(--border-subtle)' }} />
      <div>
        <div className="bmi-label">Status</div>
        <div className={`bmi-status ${cls}`}>{status}</div>
      </div>
      <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', maxWidth: 140, textAlign: 'right', lineHeight: 1.5 }}>
        BMI is a general estimate. Your plan uses more precise metrics.
      </div>
    </div>
  );
}

/* ── Constants ── */
const GENDER_OPTIONS = [
  { label: 'Male',   value: 'M', icon: '♂' },
  { label: 'Female', value: 'F', icon: '♀' },
  { label: 'Other',  value: 'T' },
];

const ACTIVITY_OPTIONS = [
  { label: 'Light',    value: 'Light',    icon: '🚶' },
  { label: 'Moderate', value: 'Moderate', icon: '🏃' },
  { label: 'Heavy',    value: 'Heavy',    icon: '🏋️' },
];

const MEAL_OPTIONS = [
  { label: 'Vegetarian', value: 'Veg',     icon: '🥦' },
  { label: 'Non-Veg',   value: 'Non-Veg', icon: '🍗' },
];

const STEPS = ['Basic Info', 'Body Metrics', 'Preferences'];

/* ── Field helper — defined OUTSIDE to prevent remounting on each render ── */
function Field({ id, label, hint, errors = {}, children }) {
  return (
    <div className="form-field">
      {label && <label htmlFor={id}>{label}</label>}
      {children}
      {hint && !errors[id] && <span className="field-hint">{hint}</span>}
      {errors[id] && <span style={{ fontSize: 12, color: 'var(--error)', marginTop: 2 }}>{errors[id]}</span>}
    </div>
  );
}

/* ── Main Component ── */
export default function SetupProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});

  const getMinDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    // Step 1 — Basic Info
    name:       '',
    phone:      '',
    age:        '',
    // Step 2 — Body Metrics
    height_cm:  '',
    weight_kg:  '',
    aim_kg:     '',
    deadline:   '',
    // Step 3 — Preferences
    gender:          '',
    activity_level:  '',
    meal_pref:       '',
    allergies:       '',
  });

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
  const setPill = (field) => (val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  /* ── Validation per step ── */
  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = 'Name is required';
      if (!form.phone || !/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit phone number';
      if (!form.age || form.age < 18 || form.age > 100) e.age = 'Enter a valid age (18-100)';
    }
    if (s === 1) {
      if (!form.height_cm || form.height_cm < 50 || form.height_cm > 250) e.height_cm = 'Enter height in cm';
      if (!form.weight_kg || form.weight_kg < 20 || form.weight_kg > 300)  e.weight_kg = 'Enter weight in kg';
      if (!form.aim_kg || form.aim_kg < 20 || form.aim_kg > 300) e.aim_kg = 'Enter a valid goal weight';
      if (!form.deadline) {
        e.deadline = 'Target date is required';
      } else if (form.deadline < getMinDeadline()) {
        e.deadline = 'Target date must be at least 2 weeks from today';
      }
    }
    if (s === 2) {
      if (!form.gender)         e.gender = 'Please select a gender';
      if (!form.activity_level) e.activity_level = 'Please select an activity level';
      if (!form.meal_pref)      e.meal_pref = 'Please select a meal preference';
    }
    return e;
  };

  const nextStep = () => {
    const errs = validate(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(2);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    localStorage.setItem('vita-profile', JSON.stringify(form));
    navigate('/planner');
  };



  return (
    <div className="setup-page">

      <div className="setup-page-top">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="setup-logo">
        <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="15" fill="var(--accent-light)"/>
          <path d="M15 6v18M9 10l6 3 6-3" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>VITA-FLOW</span>
      </div>

      <div className="setup-card">
        <StepTrack current={step} steps={STEPS} />

        <form onSubmit={handleSubmit}>

          {/* ── STEP 0: Basic Info ── */}
          {step === 0 && (
            <>
              <div className="step-header">
                <h2 className="step-title">Tell us about yourself</h2>
                <p className="step-sub">Basic information to personalise your experience.</p>
              </div>
              <div className="setup-form-stack">
                <Field id="name" label="Full name" errors={errors}>
                  <input id="name" className={`form-input${errors.name ? ' error' : ''}`}
                    type="text" placeholder="Jane Doe" autoComplete="name"
                    maxLength={60}
                    value={form.name} onChange={set('name')} />
                </Field>

                <div className="form-grid-2">
                  <Field id="phone" label="Phone number" hint="For appointment reminders" errors={errors}>
                    <input id="phone" className={`form-input${errors.phone ? ' error' : ''}`}
                      type="tel" placeholder="9876543210" autoComplete="tel"
                      maxLength={10}
                      value={form.phone} onChange={set('phone')} />
                  </Field>
                  <Field id="age" label="Age" errors={errors}>
                    <input id="age" className={`form-input${errors.age ? ' error' : ''}`}
                      type="number" placeholder="25" min="18" max="100"
                      value={form.age} onChange={set('age')} />
                  </Field>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 1: Body Metrics ── */}
          {step === 1 && (
            <>
              <div className="step-header">
                <h2 className="step-title">Body metrics</h2>
                <p className="step-sub">Used to calculate your calorie targets and personalise your plan.</p>
              </div>
              <div className="setup-form-stack">
                <BMIBadge height={form.height_cm} weight={form.weight_kg} />

                <div className="form-grid-2">
                  <Field id="height_cm" label="Height" hint="In centimetres" errors={errors}>
                    <input id="height_cm" className={`form-input${errors.height_cm ? ' error' : ''}`}
                      type="number" placeholder="168" min="50" max="250"
                      value={form.height_cm} onChange={set('height_cm')} />
                  </Field>
                  <Field id="weight_kg" label="Current weight" hint="In kilograms" errors={errors}>
                    <input id="weight_kg" className={`form-input${errors.weight_kg ? ' error' : ''}`}
                      type="number" placeholder="65" min="20" max="300"
                      value={form.weight_kg} onChange={set('weight_kg')} />
                  </Field>
                </div>

                <div className="form-grid-2">
                  <Field id="aim_kg" label="Goal weight" hint="Target in kg" errors={errors}>
                    <input id="aim_kg" className={`form-input${errors.aim_kg ? ' error' : ''}`}
                      type="number" placeholder="58" min="20" max="300"
                      value={form.aim_kg} onChange={set('aim_kg')} />
                  </Field>
                  <Field id="deadline" label="Target date" hint="When to reach your goal" errors={errors}>
                    <input id="deadline" className={`form-input${errors.deadline ? ' error' : ''}`}
                      type="date" min={getMinDeadline()}
                      value={form.deadline} onChange={set('deadline')} />
                  </Field>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 2: Preferences ── */}
          {step === 2 && (
            <>
              <div className="step-header">
                <h2 className="step-title">Your preferences</h2>
                <p className="step-sub">Help us tailor your diet and workout plan.</p>
              </div>
              <div className="setup-form-stack">

                <Field id="gender" label="Gender" errors={errors}>
                  <PillGroup options={GENDER_OPTIONS} value={form.gender} onChange={setPill('gender')} />
                </Field>

                <Field id="activity_level" label="Activity level"
                  hint="Light = desk job / minimal exercise · Moderate = 3–4 workouts/week · Heavy = athlete / daily intense training"
                  errors={errors}>
                  <PillGroup options={ACTIVITY_OPTIONS} value={form.activity_level} onChange={setPill('activity_level')} />
                </Field>

                <Field id="meal_pref" label="Meal preference" errors={errors}>
                  <PillGroup options={MEAL_OPTIONS} value={form.meal_pref} onChange={setPill('meal_pref')} />
                </Field>

                <Field id="allergies" label="Allergies or food restrictions" hint="Optional — e.g. nuts, gluten, dairy, shellfish" errors={errors}>
                  <input id="allergies" className="form-input" type="text"
                    placeholder="e.g. Lactose intolerant, tree nuts"
                    maxLength={120}
                    value={form.allergies} onChange={set('allergies')} />
                </Field>

              </div>
            </>
          )}

          {/* ── Navigation ── */}
          <div className="step-nav">
            {step > 0 && (
              <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={prevStep}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back
              </button>
            )}

            {step < 2 ? (
              <button type="button" className="btn-primary" style={{ flex: 2 }} onClick={nextStep}>
                Continue
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            ) : (
              <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                Generate my plan
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            )}
          </div>

          {/* Step count */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
            Step {step + 1} of {STEPS.length}
          </p>

        </form>
      </div>
    </div>
  );
}
