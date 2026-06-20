import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LEDStatus from '../../components/LEDStatus';

const SYMPTOMS = [
  { id: 'headache', label: 'Headache', icon: '🤕' },
  { id: 'dizziness', label: 'Dizziness', icon: '😵' },
  { id: 'nausea', label: 'Nausea', icon: '🤢' },
  { id: 'confusion', label: 'Confusion', icon: '😵‍💫' },
  { id: 'blurred_vision', label: 'Blurred Vision', icon: '👁️' },
  { id: 'abnormal_movement', label: 'Abnormal Movement', icon: '🚨' },
];

const MOVEMENT_OPTIONS = ['stable', 'mild', 'moderate', 'severe'];

function calculateLED({ oxygen, heartRate, symptoms }) {
  const s = symptoms.map((x) => x.toLowerCase());
  if (oxygen < 90 || s.includes('confusion') || s.includes('abnormal_movement') || s.includes('loss_of_consciousness')) return 'DANGER';
  if ((oxygen >= 90 && oxygen <= 95) || (heartRate > 100 && heartRate <= 120) || s.includes('headache') || s.includes('dizziness') || s.includes('nausea')) return 'CAUTION';
  return 'SEAML';
}

export default function PatientSimulator() {
  const { api } = useAuth();
  const [heartRate, setHeartRate] = useState(75);
  const [oxygen, setOxygen] = useState(98);
  const [pressure, setPressure] = useState(80);
  const [movement, setMovement] = useState('stable');
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState('');
  const [recentLog, setRecentLog] = useState([]);

  const toggleSymptom = (id) =>
    setSymptoms((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const previewLED = calculateLED({ oxygen, heartRate, symptoms });

  const sendData = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/sensor/data', {
        heartRate,
        oxygen,
        pressure,
        movement,
        symptoms,
        location: { lat: -1.2921, lon: 36.8219 }, // Nairobi, Kenya
      });
      setLastResult(data);
      setRecentLog((prev) => [
        { heartRate, oxygen, pressure, movement, symptoms: [...symptoms], ledStatus: data.ledStatus, time: new Date() },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send sensor data');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    switch (preset) {
      case 'normal': setHeartRate(72); setOxygen(99); setPressure(80); setMovement('stable'); setSymptoms([]); break;
      case 'caution': setHeartRate(110); setOxygen(93); setPressure(90); setMovement('mild'); setSymptoms(['headache', 'dizziness']); break;
      case 'danger': setHeartRate(130); setOxygen(86); setPressure(110); setMovement('severe'); setSymptoms(['confusion', 'abnormal_movement']); break;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-lg">
      <div>
        <h1 className="text-2xl font-bold text-white">Sensor Simulator</h1>
        <p className="text-white/50 text-sm mt-0.5">Simulate device sensor data and see real-time dashboard updates</p>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-white/50 text-sm self-center mr-1">Quick presets:</span>
        <button onClick={() => loadPreset('normal')} className="px-3 py-1.5 text-xs rounded-lg bg-success/20 text-success border border-success/30 hover:bg-success/30 font-medium">✅ Normal</button>
        <button onClick={() => loadPreset('caution')} className="px-3 py-1.5 text-xs rounded-lg bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30 font-medium">⚠️ Caution</button>
        <button onClick={() => loadPreset('danger')} className="px-3 py-1.5 text-xs rounded-lg bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 font-medium">🚨 Danger</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Left: Controls ─────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Vitals sliders */}
          <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-5">
            <h2 className="text-white font-semibold">Sensor Values</h2>

            <Slider label="Heart Rate" value={heartRate} min={40} max={200} onChange={setHeartRate}
              unit="BPM" color={heartRate > 100 ? 'text-warning' : 'text-success'} />
            <Slider label="Oxygen (SpO2)" value={oxygen} min={70} max={100} onChange={setOxygen}
              unit="%" color={oxygen < 90 ? 'text-danger' : oxygen < 95 ? 'text-warning' : 'text-success'} />
            <Slider label="Pressure" value={pressure} min={60} max={140} onChange={setPressure}
              unit="mmHg" color="text-blue-400" />

            <div>
              <div className="text-white/60 text-sm mb-2">Movement Status</div>
              <div className="flex gap-2 flex-wrap">
                {MOVEMENT_OPTIONS.map((m) => (
                  <button key={m} onClick={() => setMovement(m)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize border transition-all ${movement === m ? 'bg-accent text-dark border-accent' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="bg-card border border-white/10 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-3">Symptoms</h2>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOMS.map(({ id, label, icon }) => (
                <button key={id} onClick={() => toggleSymptom(id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${symptoms.includes(id) ? 'bg-warning/20 border-warning/40 text-warning' : 'bg-white/5 border-white/10 text-white/55 hover:bg-white/10 hover:text-white'}`}>
                  <span>{icon}</span><span>{label}</span>
                  {symptoms.includes(id) && <span className="ml-auto text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Preview + Send ───────────────────────────────────────── */}
        <div className="space-y-5">
          {/* LED preview */}
          <div>
            <div className="text-white/50 text-sm mb-2">Predicted LED Status</div>
            <LEDStatus status={previewLED} />
          </div>

          {/* Summary card */}
          <div className="bg-card border border-white/10 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-3">Data Preview</h2>
            <div className="space-y-2 text-sm">
              {[
                ['Heart Rate', `${heartRate} BPM`],
                ['Oxygen', `${oxygen}%`],
                ['Pressure', `${pressure} mmHg`],
                ['Movement', movement],
                ['Symptoms', symptoms.length > 0 ? symptoms.join(', ') : 'None'],
                ['Location', '-1.2921, 36.8219 (Nairobi, Kenya)'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/45">{k}</span>
                  <span className="text-white capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success result */}
          {lastResult && (
            <div className="bg-success/10 border border-success/30 rounded-2xl p-4">
              <div className="text-success font-semibold text-sm mb-1">✅ Data Sent Successfully</div>
              <div className="text-white/55 text-xs">LED Status: <strong className="text-white">{lastResult.ledStatus}</strong></div>
              <div className="text-white/55 text-xs">Real-time dashboard updated via Socket.io</div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-danger/15 border border-danger/30 text-danger text-sm">{error}</div>
          )}

          {/* Send button */}
          <button onClick={sendData} disabled={loading}
            className="w-full py-4 bg-accent text-dark font-black text-lg rounded-2xl hover:bg-yellow-400 transition-all disabled:opacity-60 shadow-lg"
            style={{ boxShadow: '0 6px 24px rgba(245,183,0,0.3)' }}>
            {loading ? '📡 Sending…' : '📡 Send Sensor Data'}
          </button>
        </div>
      </div>

      {/* Recent sends log */}
      {recentLog.length > 0 && (
        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <h3 className="text-white font-semibold">Recent Transmissions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Time', 'HR', 'O2', 'Pressure', 'Movement', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-white/40 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLog.map((r, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2 text-white/50">{r.time.toLocaleTimeString()}</td>
                    <td className={`px-4 py-2 font-medium ${r.heartRate > 100 ? 'text-warning' : 'text-success'}`}>{r.heartRate}</td>
                    <td className={`px-4 py-2 font-medium ${r.oxygen < 90 ? 'text-danger' : r.oxygen < 95 ? 'text-warning' : 'text-success'}`}>{r.oxygen}%</td>
                    <td className="px-4 py-2 text-white/60">{r.pressure}</td>
                    <td className="px-4 py-2 text-white/60 capitalize">{r.movement}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${r.ledStatus === 'DANGER' ? 'bg-danger/15 text-danger border-danger/30' : r.ledStatus === 'CAUTION' ? 'bg-warning/15 text-warning border-warning/30' : 'bg-success/15 text-success border-success/30'}`}>
                        {r.ledStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const Slider = ({ label, value, min, max, onChange, unit, color }) => (
  <div>
    <div className="flex justify-between mb-1.5">
      <span className="text-white/60 text-sm">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value} {unit}</span>
    </div>
    <input type="range" min={min} max={max} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-accent h-2" />
    <div className="flex justify-between text-xs text-white/25 mt-0.5">
      <span>{min}</span><span>{max}</span>
    </div>
  </div>
);
