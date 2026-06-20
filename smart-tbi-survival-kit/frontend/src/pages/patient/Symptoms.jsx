import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LEDStatus from '../../components/LEDStatus';

// Available symptom options
const SYMPTOM_OPTIONS = [
  { id: 'headache', label: 'Headache', severity: 'caution', icon: '🤕' },
  { id: 'dizziness', label: 'Dizziness', severity: 'caution', icon: '😵' },
  { id: 'nausea', label: 'Nausea', severity: 'caution', icon: '🤢' },
  { id: 'blurred_vision', label: 'Blurred Vision', severity: 'caution', icon: '👁️' },
  { id: 'confusion', label: 'Confusion', severity: 'danger', icon: '😵‍💫' },
  { id: 'abnormal_movement', label: 'Abnormal Movement', severity: 'danger', icon: '🚨' },
  { id: 'loss_of_consciousness', label: 'Loss of Consciousness', severity: 'danger', icon: '⚠️' },
];

/** Determines LED status based on vitals and symptoms — mirrors backend logic */
function calculateLED({ oxygen, heartRate, symptoms }) {
  const s = symptoms.map((x) => x.toLowerCase());
  if (
    oxygen < 90 ||
    s.includes('confusion') ||
    s.includes('abnormal_movement') ||
    s.includes('loss_of_consciousness')
  ) return 'DANGER';
  if (
    (oxygen >= 90 && oxygen <= 95) ||
    (heartRate > 100 && heartRate <= 120) ||
    s.includes('headache') ||
    s.includes('dizziness') ||
    s.includes('nausea') ||
    s.includes('blurred_vision')
  ) return 'CAUTION';
  return 'SEAML';
}

export default function PatientSymptoms() {
  const { api } = useAuth();
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const [notes, setNotes] = useState('');
  const [heartRate, setHeartRate] = useState(75);
  const [oxygen, setOxygen] = useState(98);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const toggleSymptom = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const previewLED = calculateLED({ oxygen, heartRate, symptoms: selected });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/patient/symptoms', {
        symptoms: selected,
        notes,
        heartRate,
        oxygen,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/patient/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log symptoms');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Symptoms Logged</h2>
          <p className="text-white/50">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Log Symptoms</h1>
        <p className="text-white/50 text-sm mt-0.5">Report how you're feeling right now</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Vitals ────────────────────────────────────────────────────── */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold">Current Vitals</h2>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-white/60 text-sm">Heart Rate</label>
                <span className={`text-sm font-bold ${heartRate > 100 ? 'text-warning' : 'text-success'}`}>
                  {heartRate} BPM
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={180}
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-xs text-white/30 mt-0.5">
                <span>40</span><span>180</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-white/60 text-sm">Oxygen (SpO2)</label>
                <span className={`text-sm font-bold ${oxygen < 90 ? 'text-danger' : oxygen < 95 ? 'text-warning' : 'text-success'}`}>
                  {oxygen}%
                </span>
              </div>
              <input
                type="range"
                min={70}
                max={100}
                value={oxygen}
                onChange={(e) => setOxygen(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-xs text-white/30 mt-0.5">
                <span>70%</span><span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Symptom selection ──────────────────────────────────────────── */}
        <div className="bg-card border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Select Symptoms</h2>
          <div className="grid grid-cols-2 gap-2">
            {SYMPTOM_OPTIONS.map(({ id, label, severity, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleSymptom(id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  selected.includes(id)
                    ? severity === 'danger'
                      ? 'bg-danger/20 border-danger/50 text-danger'
                      : 'bg-warning/20 border-warning/50 text-warning'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
                {selected.includes(id) && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── LED preview ────────────────────────────────────────────────── */}
        <div>
          <div className="text-white/50 text-sm mb-2">Predicted Status</div>
          <LEDStatus status={previewLED} />
        </div>

        {/* ── Notes ─────────────────────────────────────────────────────── */}
        <div className="bg-card border border-white/10 rounded-2xl p-5">
          <label className="block text-white font-semibold mb-3">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Describe how you're feeling in detail…"
            className="w-full bg-dark border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors resize-none"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-danger/15 border border-danger/30 text-danger text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-accent text-dark font-bold rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-60"
        >
          {loading ? 'Logging…' : 'Submit Symptom Report'}
        </button>
      </form>
    </div>
  );
}
