import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Register            from './pages/Register';
import Login               from './pages/Login';
import SetupProfile        from './pages/SetupProfile';
import DayPlanner          from './pages/DayPlanner';
import WeeklyPlan          from './pages/WeeklyPlan';
import Consultants         from './pages/Consultants';
import Profile             from './pages/Profile';
import ConsultantDashboard from './pages/ConsultantDashboard';
import DBADashboard        from './pages/DBADashboard';
import MainLayout          from './layouts/MainLayout';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public ── */}
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />

        {/* ── Profile setup (user only, after registration) ── */}
        <Route path="/setup" element={
          <RoleRoute allowedRoles={['user']}>
            <SetupProfile />
          </RoleRoute>
        } />

        {/* ── Main app shell (all authenticated roles) ── */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>

          {/* User-only routes */}
          <Route path="/planner" element={
            <RoleRoute allowedRoles={['user']}>
              <DayPlanner />
            </RoleRoute>
          } />
          <Route path="/weekly" element={
            <RoleRoute allowedRoles={['user']}>
              <WeeklyPlan />
            </RoleRoute>
          } />

          {/* All authenticated roles */}
          <Route path="/consultants" element={<Consultants />} />
          <Route path="/profile"     element={<Profile />} />

          {/* Consultant + DBA */}
          <Route path="/consultant-dashboard" element={
            <RoleRoute allowedRoles={['consultant', 'dba']}>
              <ConsultantDashboard />
            </RoleRoute>
          } />

          {/* DBA only */}
          <Route path="/dba-dashboard" element={
            <RoleRoute allowedRoles={['dba']}>
              <DBADashboard />
            </RoleRoute>
          } />

        </Route>

        {/* ── Default redirect ── */}
        <Route path="/" element={<Navigate to="/register" />} />

      </Routes>
    </Router>
  );
}

export default App;
