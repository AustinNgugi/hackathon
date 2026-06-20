import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function PatientProfile() {
  const { user, api } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', hospital: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '', hospital: user.hospital || '' });
    }
  }, [user]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put('/patient/profile', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-white/50 text-sm mt-0.5">Manage your account information</p>
      </div>

      {/* Avatar section */}
      <div className="flex items-center gap-4 p-5 bg-card border border-white/10 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-accent font-black text-2xl shrink-0">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="text-white font-bold text-lg">{user?.name}</div>
          <div className="text-white/50 text-sm">{user?.email}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success border border-success/30 capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Device ID card (read-only) */}
      <div className="p-5 bg-accent/10 border border-accent/25 rounded-2xl">
        <div className="text-accent text-sm font-semibold mb-1">📟 Assigned Device</div>
        <div className="text-white font-mono text-lg">{user?.deviceId || 'Not assigned'}</div>
        <div className="text-white/40 text-xs mt-1">Device ID is assigned at registration</div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
        <h2 className="text-white font-semibold">Edit Information</h2>

        <div>
          <label className="block text-sm text-white/60 mb-1.5">Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-1.5">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1-555-0100"
            className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-1.5">Hospital / Facility</label>
          <input
            type="text"
            name="hospital"
            value={form.hospital}
            onChange={handleChange}
            placeholder="Metro General Hospital"
            className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Read-only fields */}
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Email (read-only)</label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-danger/15 border border-danger/30 text-danger text-sm">{error}</div>
        )}

        {saved && (
          <div className="p-3 rounded-xl bg-success/15 border border-success/30 text-success text-sm">
            ✅ Profile updated successfully
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent text-dark font-bold rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
