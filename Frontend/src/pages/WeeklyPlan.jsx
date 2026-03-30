import React from 'react';
import { MOCK_WORKOUTS, VEG_MEALS, NONVEG_MEALS } from '../mockData';

const getDailyLog = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const saved = JSON.parse(localStorage.getItem('vita-daily-log'));
    if (saved && saved.date === today) return saved.logged;
  } catch {}
  return { breakfast: false, lunch: false, dinner: false };
};

const generateWeekData = (profile) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayIndex = 3; 
  const todayLog = getDailyLog();
  
  const activity = profile.activity_level || 'Moderate';
  const workouts = MOCK_WORKOUTS[activity] || MOCK_WORKOUTS.Moderate;

  return days.map((day, i) => {
    let status = 'upcoming';
    if (i < todayIndex) status = 'completed';
    if (i === todayIndex) status = 'today';

    const isRestDay = (i === 6);

    let mealsDone = { breakfast: false, lunch: false, dinner: false };
    if (status === 'completed') { mealsDone = { breakfast: true, lunch: true, dinner: true }; }
    if (status === 'today') { mealsDone = { breakfast: !!todayLog.breakfast, lunch: !!todayLog.lunch, dinner: !!todayLog.dinner }; }

    return {
      id: i,
      day,
      date: new Date(Date.now() - (todayIndex - i) * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      status,
      mealsDone,
      exercises: isRestDay ? [{ label: 'Rest Day', icon: '🛋️' }] : workouts,
    };
  });
};

export default function WeeklyPlan() {
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('vita-profile')) || {}; } catch { return {}; }
  })();

  const weekData = generateWeekData(profile);
  const baseMeals = profile.meal_pref === 'Non-Veg' ? NONVEG_MEALS : VEG_MEALS;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="greeting" style={{ margin: 0 }}>Weekly Plan</h1>
          <div className="greeting-date">Your 7-day overview of meals and exercises</div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {weekData.map((day, i) => {
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
              <div 
                key={day.id} 
                className="card" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  border: day.status === 'today' ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  display: 'flex', flexDirection: 'column', height: '100%',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}
              >
                {/* Colored Banner matched to LMS vibe */}
                <div style={{ 
                  height: 120, 
                  background: day.status === 'upcoming' ? 'var(--bg-subtle)' : gradients[i % gradients.length],
                  display: 'flex', alignItems: 'flex-end', padding: '16px 20px',
                  position: 'relative'
                }}>
                  {/* Faux pattern overlay */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: day.status === 'upcoming' ? 'var(--text-primary)' : '#fff' }}>
                      {day.day}
                    </div>
                    <div style={{ fontSize: 13, color: day.status === 'upcoming' ? 'var(--text-muted)' : 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                      {day.date.split(' ')[0]} • {day.status === 'completed' ? 'Past' : day.status === 'today' ? 'Today' : 'Upcoming'}
                    </div>
                  </div>
                </div>

                {/* Bottom Body Split Container */}
                <div style={{ padding: '20px', display: 'flex', gap: 16, flex: 1 }}>
                  
                  {/* Left: Meals */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                      Meals
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {['breakfast', 'lunch', 'dinner'].map(mealKey => {
                        const done = day.mealsDone[mealKey];
                        const mealData = baseMeals[mealKey];
                        const title = mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
                        return (
                          <div key={mealKey} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            <span style={{ 
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                              background: done ? 'var(--success-light)' : 'var(--bg-subtle)',
                              color: done ? 'var(--success)' : 'var(--border-default)',
                              border: `1px solid ${done ? 'transparent' : 'var(--border-default)'}`,
                              fontSize: 10, fontWeight: 'bold'
                            }}>
                              {done ? '✓' : ''}
                            </span>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                {title}
                              </div>
                              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12 }}>
                                {mealData.items.map((item, idx) => (
                                  <li key={idx} style={{ lineHeight: 1.3 }}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right: Workouts */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                      Workouts
                    </div>
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
            );
          })}
        </div>
      </div>
    </>
  );
}
