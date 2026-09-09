import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from './components/auth/PrivateRoute';

import HomePage from './pages/HomePage';
import PropertyListPage from './pages/PropertyListPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SavedListingsPage from './pages/SavedListingsPage';
import AgentDashboardPage from './pages/agent/AgentDashboardPage';
import CreateListingPage from './pages/agent/CreateListingPage';
import EditListingPage from './pages/agent/EditListingPage';
import AgentEnquiriesPage from './pages/agent/AgentEnquiriesPage';
import AdminListingsPage from './pages/admin/AdminListingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/properties', element: <PropertyListPage /> },
  { path: '/properties/:id', element: <PropertyDetailPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/saved',
    element: (
      <PrivateRoute>
        <SavedListingsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/agent/dashboard',
    element: (
      <PrivateRoute roles={['agent', 'admin']}>
        <AgentDashboardPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/agent/listings/new',
    element: (
      <PrivateRoute roles={['agent', 'admin']}>
        <CreateListingPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/agent/listings/:id/edit',
    element: (
      <PrivateRoute roles={['agent', 'admin']}>
        <EditListingPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/agent/listings/:id/enquiries',
    element: (
      <PrivateRoute roles={['agent', 'admin']}>
        <AgentEnquiriesPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/listings',
    element: (
      <PrivateRoute roles={['admin']}>
        <AdminListingsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <PrivateRoute roles={['admin']}>
        <AdminUsersPage />
      </PrivateRoute>
    ),
  },
]);

export default router;
