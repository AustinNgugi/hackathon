import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PATIENT_LINKS = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/patient/simulator', label: 'Sensor Simulator', icon: '📡' },
  { to: '/patient/symptoms', label: 'Log Symptoms', icon: '🩺' },
  { to: '/patient/emergency', label: 'Emergency SOS', icon: '🚨', danger: true },
  { to: '/patient/history', label: 'Vitals History', icon: '📊' },
  { to: '/patient/profile', label: 'Profile', icon: '👤' },
];

const DOCTOR_LINKS = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: '🏥' },
];

/**
 * Sidebar navigation for patient and doctor dashboards.
 */
const Sidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'patient' ? PATIENT_LINKS : DOCTOR_LINKS;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`bg-card border-r border-white/10 flex flex-col transition-all duration-300 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{ minHeight: '100vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div>
            <div className="text-accent font-black text-lg leading-none">⚡ TBI KIT</div>
            <div className="text-white/40 text-xs mt-0.5 capitalize">{role} portal</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-white/40 text-xs truncate">{user?.email}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            title={collapsed ? link.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? link.danger
                    ? 'bg-danger/20 text-danger border border-danger/30'
                    : 'bg-accent/20 text-accent border border-accent/20'
                  : link.danger
                  ? 'text-danger/70 hover:bg-danger/10 hover:text-danger'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="text-base shrink-0">{link.icon}</span>
            {!collapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="text-base shrink-0">🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
