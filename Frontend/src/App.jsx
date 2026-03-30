import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/Login';
import SetupProfile from './pages/SetupProfile';
import DayPlanner from './pages/DayPlanner';
import WeeklyPlan from './pages/WeeklyPlan';
import Consultants from './pages/Consultants';
import Profile from './pages/Profile';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>

        {/* AUTH */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* PROFILE SETUP */}
        <Route path="/setup" element={
          <ProtectedRoute>
            <SetupProfile />
          </ProtectedRoute>
        } />

        {/* MAIN APP */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/planner" element={<DayPlanner />} />
          <Route path="/weekly" element={<WeeklyPlan />} />
          <Route path="/consultants" element={<Consultants />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/register" />} />

      </Routes>
    </Router>
  );
}

export default App;