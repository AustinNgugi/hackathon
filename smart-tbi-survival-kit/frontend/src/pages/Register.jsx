import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Lightfall from '../components/Lightfall';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: params.get('role') || 'patient',
    hospital: '',
    phone: '',
    deviceId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        hospital: form.hospital,
        phone: form.phone,
        deviceId: form.deviceId,
      });
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: '#0A29FF' }}>
      {/* Lightfall Background */}
      <div className="fixed inset-0 z-0">
        <Lightfall
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#0A29FF"
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction={true}
          mouseStrength={0.5}
          mouseRadius={1}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-3xl font-black text-accent">⚡ TBI KIT</div>
            <div className="text-white/40 text-sm mt-1">Smart TBI Survival Kit</div>
          </Link>
        </div>

        <div className="rounded-2xl p-8 shadow-2xl border border-white/10" style={{ background: 'rgba(10,14,35,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/50 text-sm mb-6">Join the TBI monitoring network</p>

          {/* Role selector */}
          <div className="flex gap-2 mb-6">
            {['patient', 'doctor'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: r }))}
                className={`flex-1 py-2.5 text-sm rounded-xl font-semibold border transition-all capitalize ${
                  form.role === r
                    ? r === 'doctor'
                      ? 'bg-blue-500/25 text-blue-300 border-blue-500/40'
                      : 'bg-success/20 text-success border-success/35'
                    : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                }`}
              >
                {r === 'doctor' ? '👨‍⚕️ Doctor' : '🧑‍💼 Patient'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger/15 border border-danger/30 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="John Martinez"
                  className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1.5">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 chars"
                  className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Confirm *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repeat password"
                  className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Hospital</label>
                <input
                  type="text"
                  name="hospital"
                  value={form.hospital}
                  onChange={handleChange}
                  placeholder="Metro General"
                  className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1-555-0100"
                  className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              {form.role === 'patient' && (
                <div className="col-span-2">
                  <label className="block text-sm text-white/60 mb-1.5">Device ID</label>
                  <input
                    type="text"
                    name="deviceId"
                    value={form.deviceId}
                    onChange={handleChange}
                    placeholder="TBI-DEVICE-001 (auto-generated if blank)"
                    className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-dark font-bold rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-yellow-400 transition-colors font-medium">
              Sign In
            </Link>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}