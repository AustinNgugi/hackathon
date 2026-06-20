import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Kenya emergency & ambulance contacts
const KENYA_EMERGENCY_CONTACTS = [
  { name: 'National Emergency', number: '999', icon: '🚨', available: '24/7', color: 'text-danger' },
  { name: 'Alternate Emergency', number: '112', icon: '📞', available: '24/7', color: 'text-danger' },
  { name: 'Kenya Red Cross Ambulance', number: '0722 207 767', icon: '🚑', available: '24/7', color: 'text-success' },
  { name: 'St. John Ambulance Kenya', number: '0722 206 005', icon: '🏥', available: '24/7', color: 'text-blue-400' },
  { name: 'AMREF Flying Doctors', number: '0703 037 000', icon: '✈️', available: '24/7', color: 'text-purple-400' },
  { name: 'Nairobi County Ambulance', number: '0800 720 245', icon: '🏙️', available: '24/7', color: 'text-accent', note: 'Toll-free' },
];

// Default fallback: Nairobi, Kenya
const NAIROBI = { lat: -1.2921, lon: 36.8219 };

export default function PatientEmergency() {
  const { api, user } = useAuth();
  const [step, setStep] = useState('confirm'); // confirm | locating | sending | done | error
  const [alert, setAlert] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  // Pulse countdown for dramatic effect
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (step === 'locating') {
      // Try to get GPS location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            sendEmergency({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          },
          () => {
            // Fallback to Nairobi, Kenya if GPS is denied
            setLocation(NAIROBI);
            sendEmergency(NAIROBI);
          },
          { timeout: 5000 }
        );
      } else {
        setLocation(NAIROBI);
        sendEmergency(NAIROBI);
      }
    }
  }, [step]);

  const sendEmergency = async (loc) => {
    setStep('sending');
    try {
      const { data } = await api.post('/patient/emergency', { location: loc });
      setAlert(data.alert);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send emergency alert');
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">

        {/* ── Confirm step ─────────────────────────────────────────────── */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-black text-white mb-2">Emergency SOS</h1>
              <p className="text-white/55">This will immediately alert the medical team with your location.</p>
            </div>

            {/* Big SOS button */}
            <div className="flex justify-center py-2">
              <button
                onClick={() => setStep('locating')}
                className="relative w-44 h-44 rounded-full bg-danger font-black text-white text-4xl transition-all hover:scale-105 active:scale-95"
                style={{
                  boxShadow: '0 0 0 0 rgba(239,68,68,0.4), 0 8px 40px rgba(239,68,68,0.5)',
                  animation: 'sosPulse 2s ease-in-out infinite',
                }}
              >
                <div className="absolute inset-2 rounded-full border-4 border-white/30" />
                SOS
              </button>
            </div>

            <div className="bg-danger/10 border border-danger/25 rounded-2xl p-4 text-left">
              <div className="text-danger font-semibold mb-2">⚠ What happens when you press SOS:</div>
              <ul className="space-y-1.5 text-white/65 text-sm">
                <li>• Your GPS location is captured and sent</li>
                <li>• A CRITICAL alert is created immediately</li>
                <li>• On-call medical team is notified in real-time</li>
                <li>• Emergency preparation checklist is activated</li>
              </ul>
            </div>

            {/* Kenya Emergency Contacts */}
            <div className="bg-card border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🇰🇪</span>
                <h2 className="text-white font-bold">Kenya Emergency Contacts</h2>
              </div>
              <div className="space-y-2">
                {KENYA_EMERGENCY_CONTACTS.map(({ name, number, icon, available, color, note }) => (
                  <a
                    key={number}
                    href={`tel:${number.replace(/\s/g, '')}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <div className="text-white text-sm font-medium">{name}</div>
                        <div className="text-white/40 text-xs">{available}{note ? ` · ${note}` : ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-base tracking-wider ${color}`}>{number}</span>
                      <span className="text-white/30 text-xs group-hover:text-accent transition-colors">📞</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <Link to="/patient/dashboard" className="block text-center text-white/40 hover:text-white/70 text-sm transition-colors">
              ← Cancel — Back to dashboard
            </Link>
          </div>
        )}

        {/* ── Locating step ─────────────────────────────────────────────── */}
        {(step === 'locating' || step === 'sending') && (
          <div className="text-center space-y-6">
            <div className="relative flex justify-center">
              <div className="w-28 h-28 rounded-full bg-danger/20 border-2 border-danger animate-ping absolute" />
              <div className="w-28 h-28 rounded-full bg-danger/30 border-2 border-danger flex items-center justify-center relative">
                <span className="text-4xl">{step === 'locating' ? '📍' : '📡'}</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {step === 'locating' ? 'Getting your location…' : 'Sending alert…'}
              </h2>
              <p className="text-white/50 mt-2">
                {step === 'locating'
                  ? 'Acquiring GPS coordinates'
                  : 'Notifying the medical team in real-time'}
              </p>
            </div>
          </div>
        )}

        {/* ── Done step ─────────────────────────────────────────────────── */}
        {step === 'done' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Alert Sent!</h2>
              <p className="text-white/55">Medical team has been notified. Help is on the way.</p>
            </div>

            {/* Alert details */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-semibold">Alert Details</h3>
              <div className="space-y-2">
                <Row label="Alert ID" value={alert?._id?.slice(-8)?.toUpperCase() || 'N/A'} />
                <Row label="Severity" value="CRITICAL" valueClass="text-danger font-bold" />
                <Row label="Status" value="Active — Response En Route" valueClass="text-warning" />
                <Row
                  label="Location"
                  value={location ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}` : 'Unavailable'}
                />
                <Row label="Sent at" value={new Date().toLocaleTimeString()} />
              </div>
            </div>

            {/* Map */}
            {location && (
              <div className="bg-card border border-white/10 rounded-2xl p-4">
                <div className="text-white/60 text-sm mb-2">📍 Your location has been shared</div>
                <iframe
                  title="Emergency Location"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lon - 0.008},${location.lat - 0.008},${location.lon + 0.008},${location.lat + 0.008}&layer=mapnik&marker=${location.lat},${location.lon}`}
                  className="w-full rounded-xl"
                  style={{ height: '200px', border: 0 }}
                />
              </div>
            )}

            <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 text-warning text-sm">
              <div className="font-semibold mb-1">⚠ Stay Calm — Medical Team is Responding</div>
              <div className="text-white/55">Do not move unless necessary. Keep your device on and visible.</div>
            </div>

            <Link
              to="/patient/dashboard"
              className="block w-full py-3 text-center bg-card border border-white/15 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              ← Return to Dashboard
            </Link>
          </div>
        )}

        {/* ── Error step ────────────────────────────────────────────────── */}
        {step === 'error' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-white">Alert Failed</h2>
            <p className="text-danger">{error}</p>
            <button
              onClick={() => { setStep('locating'); setError(''); }}
              className="px-8 py-3 bg-danger text-white font-bold rounded-xl hover:bg-red-500 transition-colors"
            >
              Retry
            </button>
            <div>
              <Link to="/patient/dashboard" className="text-white/40 text-sm hover:text-white/70 transition-colors">
                Cancel
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Row = ({ label, value, valueClass = 'text-white' }) => (
  <div className="flex justify-between items-center py-1 border-b border-white/5">
    <span className="text-white/45 text-sm">{label}</span>
    <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
  </div>
);
