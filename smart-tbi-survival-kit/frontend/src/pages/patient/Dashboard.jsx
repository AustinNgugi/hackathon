import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../socket';
import LEDStatus from '../../components/LEDStatus';
import VitalsChart from '../../components/VitalsChart';

/** Vital sign card component */
const VitalCard = ({ icon, label, value, unit, color }) => (
  <div className="bg-card border border-white/10 rounded-2xl p-5 card-hover">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xl">{icon}</span>
      <span className="text-white/55 text-sm">{label}</span>
    </div>
    <div className={`text-3xl font-black ${color}`}>
      {value !== undefined && value !== null ? value : '—'}
      {unit && <span className="text-sm font-normal text-white/40 ml-1">{unit}</span>}
    </div>
  </div>
);

/** Single info row for device details */
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5">
    <span className="text-white/45 text-sm">{label}</span>
    <span className="text-white text-sm font-medium truncate max-w-[55%] text-right">{value || '—'}</span>
  </div>
);

export default function PatientDashboard() {
  const { user, api } = useAuth();
  const [vitals, setVitals] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data and connect to socket
  useEffect(() => {
    fetchDashboard();

    // Connect and listen for real-time sensor updates
    socket.connect();

    socket.on('sensor:update', (data) => {
      const isMine =
        data.patientId === user?._id ||
        String(data.patientId) === String(user?._id);
      if (isMine) {
        setVitals(data);
        setHistory((prev) => [data, ...prev].slice(0, 20));
      }
    });

    socket.on('alert:update', (alert) => {
      if (String(alert.patientId) === String(user?._id) || String(alert.patientId?._id) === String(user?._id)) {
        setActiveAlert(alert.status === 'active' ? alert : null);
      }
    });

    return () => {
      socket.off('sensor:update');
      socket.off('alert:update');
      socket.disconnect();
    };
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/patient/dashboard');
      setVitals(data.latest);
      setHistory(data.recent || []);
      setActiveAlert(data.activeAlert || null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" />
      </div>
    );
  }

  const ledStatus = vitals?.ledStatus || 'SEAML';

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Patient Dashboard</h1>
          <p className="text-white/50 text-sm mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <Link
          to="/patient/emergency"
          className="sos-btn flex items-center gap-2 px-6 py-3 bg-danger text-white font-bold rounded-xl hover:bg-red-500 transition-all shadow-lg"
          style={{ boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          SOS EMERGENCY
        </Link>
      </div>

      {/* ── Active alert banner ───────────────────────────────────────────── */}
      {activeAlert && (
        <div
          className={`flex items-center gap-4 p-4 rounded-xl border ${
            activeAlert.severity === 'CRITICAL'
              ? 'bg-danger/15 border-danger/40 text-danger'
              : 'bg-warning/15 border-warning/40 text-warning'
          }`}
        >
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <div className="font-bold">Active Alert: {activeAlert.severity}</div>
            <div className="text-sm opacity-70">Medical team has been notified — stay calm</div>
          </div>
          <div className="ml-auto text-xs opacity-60">{new Date(activeAlert.createdAt).toLocaleTimeString()}</div>
        </div>
      )}

      {/* ── LED Status ────────────────────────────────────────────────────── */}
      <LEDStatus status={ledStatus} />

      {/* ── Vital signs grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalCard
          icon="💓"
          label="Heart Rate"
          value={vitals?.heartRate}
          unit="BPM"
          color={
            !vitals?.heartRate
              ? 'text-white/50'
              : vitals.heartRate > 120
              ? 'text-danger'
              : vitals.heartRate > 100
              ? 'text-warning'
              : 'text-success'
          }
        />
        <VitalCard
          icon="🫧"
          label="Oxygen (SpO2)"
          value={vitals?.oxygen}
          unit="%"
          color={
            !vitals?.oxygen
              ? 'text-white/50'
              : vitals.oxygen < 90
              ? 'text-danger'
              : vitals.oxygen < 95
              ? 'text-warning'
              : 'text-success'
          }
        />
        <VitalCard
          icon="🔋"
          label="Pressure"
          value={vitals?.pressure}
          unit="mmHg"
          color="text-blue-400"
        />
        <VitalCard
          icon="📡"
          label="Movement"
          value={vitals?.movement ? vitals.movement.charAt(0).toUpperCase() + vitals.movement.slice(1) : null}
          unit=""
          color="text-purple-400"
        />
      </div>

      {/* ── Location + Device info ────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Map */}
        <div className="bg-card border border-white/10 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>📍</span> Patient Location
          </h3>
          {vitals?.location ? (
            <iframe
              title="Patient Location Map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${vitals.location.lon - 0.008},${vitals.location.lat - 0.008},${vitals.location.lon + 0.008},${vitals.location.lat + 0.008}&layer=mapnik&marker=${vitals.location.lat},${vitals.location.lon}`}
              className="w-full rounded-xl"
              style={{ height: '220px', border: 0 }}
            />
          ) : (
            <div className="h-52 bg-white/5 rounded-xl flex items-center justify-center text-white/35 text-sm">
              No location data — use Simulator to send data
            </div>
          )}
        </div>

        {/* Device info */}
        <div className="bg-card border border-white/10 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>📟</span> Device Info
          </h3>
          <div className="space-y-1">
            <InfoRow label="Device ID" value={user?.deviceId} />
            <InfoRow label="Hospital" value={user?.hospital} />
            <InfoRow
              label="Last Reading"
              value={vitals?.timestamp ? new Date(vitals.timestamp).toLocaleString() : null}
            />
            <InfoRow
              label="Symptoms"
              value={
                vitals?.symptoms?.length > 0
                  ? vitals.symptoms.join(', ')
                  : 'None reported'
              }
            />
            <InfoRow label="Notes" value={vitals?.notes || 'None'} />
          </div>
        </div>
      </div>

      {/* ── Vitals history chart ──────────────────────────────────────────── */}
      <div className="bg-card border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>📊</span> Vitals History (last {history.length} readings)
        </h3>
        <VitalsChart data={history} />
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/patient/simulator', label: 'Sensor Simulator', icon: '📡', cls: 'border-blue-500/25 hover:bg-blue-500/15' },
          { to: '/patient/symptoms', label: 'Log Symptoms', icon: '🩺', cls: 'border-success/25 hover:bg-success/15' },
          { to: '/patient/history', label: 'View History', icon: '📊', cls: 'border-purple-500/25 hover:bg-purple-500/15' },
          { to: '/patient/profile', label: 'Profile', icon: '👤', cls: 'border-accent/25 hover:bg-accent/15' },
        ].map(({ to, label, icon, cls }) => (
          <Link
            key={to}
            to={to}
            className={`p-4 rounded-2xl border text-center transition-all bg-white/5 ${cls} card-hover`}
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-white text-sm font-medium">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
