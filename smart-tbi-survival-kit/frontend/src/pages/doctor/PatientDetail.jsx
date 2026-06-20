import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../socket';
import LEDStatus from '../../components/LEDStatus';
import VitalsChart from '../../components/VitalsChart';

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-white/5">
    <span className="text-white/45 text-sm">{label}</span>
    <span className="text-white text-sm font-medium">{value || '—'}</span>
  </div>
);

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatient();

    socket.connect();
    socket.on('sensor:update', (update) => {
      if (String(update.patientId) === String(id)) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                latest: update,
                recent: [update, ...(prev.recent || [])].slice(0, 10),
              }
            : prev
        );
      }
    });

    return () => {
      socket.off('sensor:update');
      socket.disconnect();
    };
  }, [id]);

  const fetchPatient = async () => {
    try {
      const { data: d } = await api.get(`/doctor/patient/${id}`);
      setData(d);
    } catch (err) {
      setError('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await api.put(`/doctor/alert/${alertId}`, { status: 'resolved', checklist: [] });
      setData((prev) => ({
        ...prev,
        activeAlerts: prev.activeAlerts.filter((a) => a._id !== alertId),
      }));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-4xl">❌</div>
        <div className="text-white">{error || 'Patient not found'}</div>
        <Link to="/doctor/dashboard" className="text-accent hover:text-yellow-400 transition-colors">← Back to dashboard</Link>
      </div>
    );
  }

  const { patient, latest, recent, activeAlerts } = data;
  const ledStatus = latest?.ledStatus || 'SEAML';

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/doctor/dashboard" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors text-sm">←</Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
            <p className="text-white/50 text-sm">{patient.email} · {patient.deviceId || 'No device'}</p>
          </div>
        </div>
        <Link to={`/doctor/history/${patient._id}`}
          className="px-4 py-2 bg-accent/20 text-accent border border-accent/30 rounded-xl text-sm font-medium hover:bg-accent/30 transition-colors">
          📊 View Full History
        </Link>
      </div>

      {/* Active alerts */}
      {activeAlerts?.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div key={alert._id} className={`flex items-center justify-between p-4 rounded-xl border ${
              alert.severity === 'CRITICAL' ? 'bg-danger/15 border-danger/35 text-danger' : 'bg-warning/15 border-warning/35 text-warning'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-danger led-danger' : 'bg-warning led-caution'}`} />
                <div>
                  <div className="font-bold">{alert.severity} Alert Active</div>
                  <div className="text-xs opacity-70">{new Date(alert.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <button onClick={() => resolveAlert(alert._id)}
                className="px-3 py-1 text-sm bg-success/20 text-success border border-success/30 rounded-lg hover:bg-success/30 transition-colors">
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}

      {/* LED Status */}
      <LEDStatus status={ledStatus} />

      {/* Vitals grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '💓', label: 'Heart Rate', value: latest?.heartRate, unit: 'BPM', color: latest?.heartRate > 100 ? 'text-warning' : 'text-success' },
          { icon: '🫧', label: 'Oxygen', value: latest?.oxygen, unit: '%', color: latest?.oxygen < 90 ? 'text-danger' : latest?.oxygen < 95 ? 'text-warning' : 'text-success' },
          { icon: '🔋', label: 'Pressure', value: latest?.pressure, unit: 'mmHg', color: 'text-blue-400' },
          { icon: '📡', label: 'Movement', value: latest?.movement, unit: '', color: 'text-purple-400' },
        ].map(({ icon, label, value, unit, color }) => (
          <div key={label} className="bg-card border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>{icon}</span><span className="text-white/55 text-sm">{label}</span>
            </div>
            <div className={`text-2xl font-black ${color} capitalize`}>
              {value !== undefined ? value : '—'}
              {unit && <span className="text-sm font-normal text-white/40 ml-1">{unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Map + Patient info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-white/10 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">📍 Patient Location</h3>
          {latest?.location ? (
            <iframe
              title="Patient Location"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${latest.location.lon - 0.008},${latest.location.lat - 0.008},${latest.location.lon + 0.008},${latest.location.lat + 0.008}&layer=mapnik&marker=${latest.location.lat},${latest.location.lon}`}
              className="w-full rounded-xl"
              style={{ height: '220px', border: 0 }}
            />
          ) : (
            <div className="h-52 bg-white/5 rounded-xl flex items-center justify-center text-white/30 text-sm">No location data</div>
          )}
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">👤 Patient Information</h3>
          <div className="space-y-1">
            <InfoRow label="Full Name" value={patient.name} />
            <InfoRow label="Email" value={patient.email} />
            <InfoRow label="Phone" value={patient.phone} />
            <InfoRow label="Hospital" value={patient.hospital} />
            <InfoRow label="Device ID" value={patient.deviceId} />
            <InfoRow label="Last Reading" value={latest ? new Date(latest.timestamp || latest.createdAt).toLocaleString() : null} />
            <InfoRow label="Symptoms" value={latest?.symptoms?.length > 0 ? latest.symptoms.join(', ') : 'None'} />
          </div>
        </div>
      </div>

      {/* Vitals chart */}
      {recent?.length > 0 && (
        <div className="bg-card border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">📊 Recent Vitals Trend</h3>
          <VitalsChart data={recent} />
        </div>
      )}
    </div>
  );
}
