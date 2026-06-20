import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Lightfall from '../components/Lightfall';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    email: params.get('role') === 'doctor' ? 'doctor@test.com' : 'patient@test.com',
    password: '123456',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'rgb(8,4,20)' }}>
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
        mouseInteraction
        mouseStrength={0.5}
        mouseRadius={1}
        color1="#A6C8FF"
        color2="#5227FF"
        color3="#FF9FFC"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-3xl font-black text-accent">⚡ TBI KIT</div>
            <div className="text-white/40 text-sm mt-1">Smart TBI Survival Kit</div>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl border border-white/10" style={{ background: 'rgba(10,14,35,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/50 text-sm mb-6">Sign in to your account</p>

          {/* Quick-fill demo buttons */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setForm({ email: 'patient@test.com', password: '123456' })}
              className="flex-1 py-2 text-xs rounded-lg bg-success/15 text-success border border-success/25 hover:bg-success/25 transition-colors font-medium"
            >
              Demo: Patient
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'doctor@test.com', password: '123456' })}
              className="flex-1 py-2 text-xs rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 transition-colors font-medium"
            >
              Demo: Doctor
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger/15 border border-danger/30 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Email</label>
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
              <label className="block text-sm text-white/60 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="……………………"
                className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-dark font-bold rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-yellow-400 transition-colors font-medium">
              Register
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-4">
          <Link to="/" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            … Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

