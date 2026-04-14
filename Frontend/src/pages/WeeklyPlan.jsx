import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateDiet, generateWorkout } from '../api/apiClient';

const normalizeLogged = (value) => {
  const v = value && typeof value === 'object' ? value : {};
  return { breakfast: !!v.breakfast, lunch: !!v.lunch, dinner: !!v.dinner };
};

const getDailyLog = () => {
  try {
    const now   = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const saved = JSON.parse(localStorage.getItem('vita-daily-log'));
    if (saved && saved.date === today) return normalizeLogged(saved.logged);
  } catch {}
  return normalizeLogged(null);
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const parseWeeklyDiet = (plan) => {
  const breakfasts = toArray(plan?.diet_plan_breakfast);
  const lunches    = toArray(plan?.diet_plan_lunch);
  const dinners    = toArray(plan?.diet_plan_dinner);
  const maxLen     = Math.max(breakfasts.length, lunches.length, dinners.length, 7);
  return Array.from({ length: maxLen }, (_, i) => ({
    breakfast: toArray(breakfasts[i]),
    lunch:     toArray(lunches[i]),
    dinner:    toArray(dinners[i]),
  }));
};

const getExerciseIcon = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('run') || n.includes('jog') || n.includes('treadmill')) return '🏃';
  if (n.includes('walk')) return '🚶';
  if (n.includes('cycle') || n.includes('bike')) return '🚴';
  if (n.includes('swim')) return '🏊';
  if (n.includes('yoga') || n.includes('stretch') || n.includes('warm')) return '🧘';
  if (n.includes('jump') || n.includes('skip') || n.includes('plyo') || n.includes('burp')) return '⚡';
  if (n.includes('squat') || n.includes('lunge') || n.includes('leg') || n.includes('calf')) return '🦵';
  if (n.includes('core') || n.includes('abs') || n.includes('plank') || n.includes('crunch')) return '🛡️';
  if (n.includes('push') || n.includes('pull') || n.includes('press') || n.includes('row') || n.includes('chest') || n.includes('back')) return '🏋️';
  return '💪';
};

const parseWeeklyWorkout = (plan) => {
  const week = Array.isArray(plan?.workout_plan) ? plan.workout_plan : [];
  return week.map((day) => ({
    dayName:   day?.day_name,
    focus:     day?.focus,
    exercises: Array.isArray(day?.exercises)
      ? day.exercises.map((ex) => {
          const label = ex?.exercise_name || ex?.name || 'Exercise';
          return { label, icon: getExerciseIcon(label) };
        })
      : [],
  }));
};

const generateWeekData = (profile, weeklyDiet, weeklyWorkout) => {
  const days       = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekDay    = new Date().getDay();
  const todayIndex = weekDay === 0 ? 6 : weekDay - 1;
  const todayLog   = getDailyLog();

  return days.map((day, i) => {
    let status    = 'upcoming';
    if (i < todayIndex) status = 'past';
    if (i === todayIndex) status = 'today';

    let mealsDone = { breakfast: false, lunch: false, dinner: false };
    if (status === 'today')     mealsDone = { breakfast: !!todayLog.breakfast, lunch: !!todayLog.lunch, dinner: !!todayLog.dinner };


    const mealsForDay   = weeklyDiet?.[i] || { breakfast: [], lunch: [], dinner: [] };
    const workoutForDay = weeklyWorkout?.find((w) => w.dayName === day) || weeklyWorkout?.[i];
    const exercises     = workoutForDay?.focus === 'Rest'
      ? [{ label: 'Rest Day', icon: '🛋️' }]
      : (workoutForDay?.exercises?.length ? workoutForDay.exercises : [{ label: 'No workout generated', icon: 'ℹ️' }]);

    return {
      id: i, day, status, mealsDone, meals: mealsForDay, exercises,
      date: new Date(Date.now() - (todayIndex - i) * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    };
  });
};

export default function WeeklyPlan() {
  const navigate = useNavigate();

  // ✅ Role guard
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; } })();
  useEffect(() => {
    if (user.role === 'consultant') navigate('/consultant-dashboard', { replace: true });
    if (user.role === 'dba')        navigate('/dba-dashboard',        { replace: true });
  }, [user.role]);

  // ✅ meal_preferences (not meal_pref)
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('vita-profile')) || {}; } catch { return {}; }
  })();

  const [weeklyDiet,    setWeeklyDiet]    = useState([]);
  const [weeklyWorkout, setWeeklyWorkout] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchPlans = async () => {
      try {
        const [dietRes, workoutRes] = await Promise.all([
          generateDiet({
            meal_preferences: profile.meal_preferences || 'Veg', // ✅ fixed field name
            allergies:        profile.allergies || '',
          }),
          generateWorkout({
            activity_level: profile.activity_level || 'Moderate',
          }),
        ]);
        if (isMounted) {
          setWeeklyDiet(parseWeeklyDiet(dietRes?.data?.plan));
          setWeeklyWorkout(parseWeeklyWorkout(workoutRes?.data?.plan));
        }
      } catch (err) {
        if (isMounted) setError(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load weekly planner data.'
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPlans();
    return () => { isMounted = false; };
  }, []);

  const weekData = useMemo(
    () => generateWeekData(profile, weeklyDiet, weeklyWorkout),
    [profile, weeklyDiet, weeklyWorkout]
  );

  const gradients = [
    'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
    'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
    'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
    'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="greeting" style={{ margin: 0 }}>Weekly Plan</h1>
          <div className="greeting-date">Your 7-day overview of meals and exercises</div>
        </div>
      </div>

      <div className="page-body">
        {loading && (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
            Loading your weekly plan...
          </div>
        )}
        {!!error && (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--error)' }}>{error}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {weekData.map((day, i) => (
            <div
              key={day.id}
              className="card"
              style={{
                padding: 0, overflow: 'hidden',
                border: day.status === 'today' ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                display: 'flex', flexDirection: 'column', height: '100%',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{
                height: 120,
                background: day.status === 'upcoming' ? 'var(--bg-subtle)' : gradients[i % gradients.length],
                display: 'flex', alignItems: 'flex-end', padding: '16px 20px', position: 'relative',
              }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: day.status === 'upcoming' ? 'var(--text-primary)' : '#fff' }}>{day.day}</div>
                  <div style={{ fontSize: 13, color: day.status === 'upcoming' ? 'var(--text-muted)' : 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                    {day.date.split(' ')[0]} • {day.status === 'past' ? 'Past' : day.status === 'today' ? 'Today' : 'Upcoming'}
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', display: 'flex', gap: 16, flex: 1 }}>
                {/* Meals */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Meals</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {['breakfast', 'lunch', 'dinner'].map(mealKey => {
                      const done     = day.mealsDone[mealKey];
                      const mealData = day.meals?.[mealKey] || [];
                      const title    = mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
                      return (
                        <div key={mealKey} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                            background: done ? 'var(--success-light)' : 'var(--bg-subtle)',
                            color: done ? 'var(--success)' : 'var(--border-default)',
                            border: `1px solid ${done ? 'transparent' : 'var(--border-default)'}`,
                            fontSize: 10, fontWeight: 'bold',
                          }}>
                            {done ? '✓' : ''}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
                            <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12 }}>
                              {(mealData.length ? mealData : ['No meal generated']).map((item, idx) => (
                                <li key={idx} style={{ lineHeight: 1.3 }}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Workouts */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Workouts</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {day.exercises.map((e, idx) => (
                      <div key={idx} style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{e.icon}</span>
                        <span style={{ fontWeight: 500 }}>{e.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
