import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../socket';
import VitalsChart from '../../components/VitalsChart';
import LEDStatus from '../../components/LEDStatus';

const SEVERITY_ORDER = { CRITICAL: 0, URGENT: 1, ROUTINE: 2 };
const SEVERITY_STYLE = {
  CRITICAL: 'bg-danger/15 text-danger border-danger/35',
  URGENT: 'bg-warning/15 text-warning border-warning/35',
  ROUTINE: 'bg-success/15 text-success border-success/35',
};

/** Plays a short beep using the Web Audio API */
function playAlertBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    /* Audio not available */
  }
}

export default function DoctorDashboard() {
  const { api } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [updatingAlert, setUpdatingAlert] = useState(false);
  const prevAlertCount = useRef(0);

  useEffect(() => {
    fetchDashboard();

    socket.connect();

    socket.on('new:alert', (alert) => {
      setAlerts((prev) => {
        const updated = [alert, ...prev].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
        return updated;
      });
      // Play sound for critical alerts
      if (alert.severity === 'CRITICAL') playAlertBeep();
    });

    socket.on('sensor:update', (data) => {
      setPatients((prev) =>
        prev.map((p) =>
          String(p.patient._id) === String(data.patientId)
            ? { ...p, latest: data }
            : p
        )
      );
    });

    socket.on('new:patient', (newPatient) => {
      // Add newly registered patient to the patients list immediately
      setPatients((prev) => {
        const exists = prev.some((p) => String(p.patient._id) === String(newPatient._id));
        if (exists) return prev;
        return [...prev, { patient: newPatient, latest: null }];
      });
    });

    socket.on('alert:update', (updated) => {
      setAlerts((prev) =>
        updated.status !== 'active'
          ? prev.filter((a) => String(a._id) !== String(updated._id))
          : prev.map((a) => (String(a._id) === String(updated._id) ? updated : a))
      );
    });

    return () => {
      socket.off('new:alert');
      socket.off('new:patient');
      socket.off('sensor:update');
      socket.off('alert:update');
      socket.disconnect();
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/doctor/dashboard');
      const sorted = (data.alerts || []).sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      );
      setAlerts(sorted);
      setPatients(data.patients || []);
      prevAlertCount.current = sorted.length;
    } catch (err) {
      console.error('Doctor dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (alertId, status, checklist) => {
    setUpdatingAlert(true);
    try {
      await api.put(`/doctor/alert/${alertId}`, { status, checklist });
      if (status !== 'active') {
        setAlerts((prev) => prev.filter((a) => String(a._id) !== String(alertId)));
        setSelectedAlert(null);
      } else {
        setAlerts((prev) =>
          prev.map((a) => (String(a._id) === String(alertId) ? { ...a, checklist } : a))
        );
        setSelectedAlert((prev) => (prev ? { ...prev, checklist } : prev));
      }
    } catch (err) {
      console.error('Update alert error:', err);
    } finally {
      setUpdatingAlert(false);
    }
  };

  const toggleChecklistItem = (alert, itemIndex) => {
    const updated = alert.checklist.map((c, i) =>
      i === itemIndex ? { ...c, checked: !c.checked } : c
    );
    updateAlert(alert._id, alert.status, updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Doctor Dashboard</h1>
          <p className="text-white/50 text-sm mt-0.5">
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''} · {patients.length} patient{patients.length !== 1 ? 's' : ''} monitored
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm rounded-xl border border-white/10 transition-all"
            title="Refresh patient list and alerts"
          >
            🔄 Refresh
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-success text-sm font-medium">Live Monitoring</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Alerts', value: alerts.length, color: alerts.length > 0 ? 'text-danger' : 'text-success' },
          { label: 'Critical', value: alerts.filter((a) => a.severity === 'CRITICAL').length, color: 'text-danger' },
          { label: 'Urgent', value: alerts.filter((a) => a.severity === 'URGENT').length, color: 'text-warning' },
          { label: 'Patients', value: patients.length, color: 'text-accent' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-white/10 rounded-2xl p-4">
            <div className="text-white/50 text-sm mb-1">{label}</div>
            <div className={`text-3xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Active Alerts ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold text-lg">Active Alerts</h2>
          {alerts.length === 0 ? (
            <div className="bg-card border border-white/10 rounded-2xl p-8 text-center text-white/35">
              <div className="text-4xl mb-3">✅</div>
              <div>No active alerts — all patients stable</div>
            </div>
          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert._id}
                alert={alert}
                selected={selectedAlert?._id === alert._id}
                onSelect={() => setSelectedAlert(alert._id === selectedAlert?._id ? null : alert)}
                onAcknowledge={() => updateAlert(alert._id, 'acknowledged', alert.checklist)}
                onResolve={() => updateAlert(alert._id, 'resolved', alert.checklist)}
                onToggleItem={(idx) => toggleChecklistItem(alert, idx)}
                updating={updatingAlert}
              />
            ))
          )}
        </div>

        {/* ── Patients list ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold text-lg">Monitored Patients</h2>
          {patients.length === 0 ? (
            <div className="bg-card border border-white/10 rounded-2xl p-8 text-center text-white/35">
              <div className="text-4xl mb-3">👥</div>
              <div>No patients registered yet</div>
            </div>
          ) : (
            patients.map(({ patient, latest }) => (
              <Link
                key={patient._id}
                to={`/doctor/patient/${patient._id}`}
                className="block bg-card border border-white/10 rounded-2xl p-4 hover:border-accent/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold shrink-0">
                      {patient.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{patient.name}</div>
                      <div className="text-white/40 text-xs">{patient.deviceId || 'No device'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {latest ? (
                      <>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${latest.heartRate > 100 ? 'text-warning' : 'text-success'}`}>
                            {latest.heartRate} BPM
                          </div>
                          <div className={`text-xs ${latest.oxygen < 90 ? 'text-danger' : 'text-success'}`}>
                            {latest.oxygen}% O2
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                          latest.ledStatus === 'DANGER' ? 'bg-danger/15 text-danger border-danger/30' :
                          latest.ledStatus === 'CAUTION' ? 'bg-warning/15 text-warning border-warning/30' :
                          'bg-success/15 text-success border-success/30'
                        }`}>
                          {latest.ledStatus}
                        </span>
                      </>
                    ) : (
                      <span className="text-white/30 text-xs">No data</span>
                    )}
                    <span className="text-white/30 text-sm">→</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Alert card with inline checklist ─────────────────────────────────────────
const AlertCard = ({ alert, selected, onSelect, onAcknowledge, onResolve, onToggleItem, updating }) => {
  const patientName = alert.patientId?.name || alert.patientName || 'Unknown Patient';
  const createdAt = new Date(alert.createdAt).toLocaleTimeString();

  return (
    <div className={`bg-card border rounded-2xl overflow-hidden transition-all ${SEVERITY_STYLE[alert.severity]}`}>
      {/* Alert header */}
      <button onClick={onSelect} className="w-full p-4 text-left hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full shrink-0 ${
              alert.severity === 'CRITICAL' ? 'bg-danger led-danger' :
              alert.severity === 'URGENT' ? 'bg-warning led-caution' : 'bg-success'
            }`} />
            <div>
              <div className="text-white font-semibold">{patientName}</div>
              <div className="text-white/45 text-xs">{alert.isEmergency ? '🆘 SOS Emergency' : '⚠ Auto-detected'} · {createdAt}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${SEVERITY_STYLE[alert.severity]}`}>
              {alert.severity}
            </span>
            <span className="text-white/30 text-sm">{selected ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {/* Expanded checklist */}
      {selected && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/10">
          <div className="pt-3">
            <div className="text-white/60 text-sm font-semibold mb-2">Preparation Checklist</div>
            <div className="space-y-2">
              {alert.checklist?.map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => onToggleItem(idx)}
                    className="w-4 h-4 accent-accent rounded"
                    disabled={updating}
                  />
                  <span className={`text-sm transition-colors ${item.checked ? 'text-white/35 line-through' : 'text-white/80 group-hover:text-white'}`}>
                    {item.item}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          {alert.location && (
            <div>
              <div className="text-white/60 text-xs mb-1">📍 Patient Location</div>
              <iframe
                title="Alert Location"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${alert.location.lon - 0.008},${alert.location.lat - 0.008},${alert.location.lon + 0.008},${alert.location.lat + 0.008}&layer=mapnik&marker=${alert.location.lat},${alert.location.lon}`}
                className="w-full rounded-xl"
                style={{ height: '160px', border: 0 }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={onAcknowledge} disabled={updating}
              className="flex-1 py-2 text-sm rounded-xl bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30 transition-colors font-medium disabled:opacity-50">
              Acknowledge
            </button>
            <button onClick={onResolve} disabled={updating}
              className="flex-1 py-2 text-sm rounded-xl bg-success/20 text-success border border-success/30 hover:bg-success/30 transition-colors font-medium disabled:opacity-50">
              Mark Resolved
            </button>
            <Link to={`/doctor/patient/${alert.patientId?._id || alert.patientId}`}
              className="flex-1 py-2 text-sm rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors font-medium text-center">
              View Patient
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
