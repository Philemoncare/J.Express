import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setLoading } from '@/store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import RequestAccessPage from '@/pages/auth/RequestAccessPage';
import DashboardPage from '@/pages/DashboardPage';
import VehiclesPage from '@/pages/VehiclesPage';
import IncomePage from '@/pages/IncomePage';
import ExpensesPage from '@/pages/ExpensesPage';
import FuelPage from '@/pages/FuelPage';
import VehicleDetailsPage from '@/pages/VehicleDetailsPage';
import FinancialReportsPage from '@/pages/reports/FinancialReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import SecurityPage from '@/pages/SecurityPage';

// Layouts & Protected Routes
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const App = () => {
  const { fetchUser, isAuthenticated, isLoading, user } = useAuth();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Session initialization logic
    if (isAuthenticated && !user) {
      // We have a token but no user data (e.g., page refresh)
      fetchUser();
    } else {
      // Either no token or already have user, stop loading
      dispatch(setLoading(false));
    }
  }, [isAuthenticated, user, fetchUser, dispatch]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#020617',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 20px',
            fontWeight: '600',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
            letterSpacing: '-0.01em',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/request-access" element={<RequestAccessPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
            <Route path="/income" element={<IncomePage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/fuel" element={<FuelPage />} />
            <Route path="/reports" element={<FinancialReportsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all to login or dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default App;
