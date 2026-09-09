import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Building2, Heart, LayoutDashboard, Shield, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-blue-700 font-bold text-lg">
            <Building2 size={24} />
            <span className="hidden sm:block">Myanmar Property Portal</span>
            <span className="sm:hidden">MPP</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-700"
            >
              <Home size={16} />
              <span className="hidden sm:block">Home</span>
            </Link>
            <Link
              to="/properties"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-700"
            >
              <Building2 size={16} />
              <span className="hidden sm:block">Properties</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/saved"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-700"
              >
                <Heart size={16} />
                <span className="hidden sm:block">Saved</span>
              </Link>
            )}

            {(role === 'agent' || role === 'admin') && (
              <Link
                to="/agent/dashboard"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-700"
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
            )}

            {role === 'admin' && (
              <Link
                to="/admin/users"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-700"
              >
                <Shield size={16} />
                <span className="hidden sm:block">Admin</span>
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
              >
                <LogOut size={16} />
                <span className="hidden sm:block">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 text-sm bg-blue-700 text-white px-3 py-1.5 rounded-md hover:bg-blue-800"
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
