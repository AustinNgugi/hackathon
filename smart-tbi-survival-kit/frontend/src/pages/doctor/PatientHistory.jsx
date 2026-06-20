import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VitalsChart from '../../components/VitalsChart';

const LED_STYLE = {
  SEAML: 'bg-success/15 text-success border-success/30',
  CAUTION: 'bg-warning/15 text-warning border-warning/30',
  DANGER: 'bg-danger/15 text-danger border-danger/30',
};

export default function DoctorPatientHistory() {
  const { id } = useParams();
  const { api } = useAuth();
  const [history, setHistory] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('table');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [histRes, patRes] = await Promise.all([
          api.get(`/doctor/history/${id}`),
          api.get(`/doctor/patient/${id}`),
        ]);
        setHistory(histRes.data.history || []);
        setPatient(patRes.data.patient);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const filtered = filter === 'all' ? history : history.filter((h) => h.ledStatus === filter);

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
        <div className="flex items-center gap-4">
          <Link to={`/doctor/patient/${id}`}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors text-sm">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {patient?.name ? `${patient.name}'s History` : 'Patient History'}
            </h1>
            <p className="text-white/50 text-sm mt-0.5">{history.length} total readings</p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex bg-card border border-white/10 rounded-xl overflow-hidden">
          {[['table', '📋 Table'], ['chart', '📊 Chart']].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${view === v ? 'bg-accent text-dark' : 'text-white/60 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg Heart Rate', value: `${Math.round(history.reduce((s, h) => s + (h.heartRate || 0), 0) / history.length)} BPM`, color: 'text-accent' },
            { label: 'Avg Oxygen', value: `${(history.reduce((s, h) => s + (h.oxygen || 0), 0) / history.length).toFixed(1)}%`, color: 'text-success' },
            { label: 'DANGER Events', value: history.filter((h) => h.ledStatus === 'DANGER').length, color: 'text-danger' },
            { label: 'CAUTION Events', value: history.filter((h) => h.ledStatus === 'CAUTION').length, color: 'text-warning' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-white/10 rounded-2xl p-4">
              <div className="text-white/50 text-xs mb-1">{label}</div>
              <div className={`text-xl font-black ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'SEAML', 'CAUTION', 'DANGER'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === f ? 'bg-accent text-dark border-accent' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
            }`}>
            {f === 'all' ? `All (${history.length})` : `${f} (${history.filter((h) => h.ledStatus === f).length})`}
          </button>
        ))}
      </div>

      {/* Chart view */}
      {view === 'chart' ? (
        <div className="bg-card border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Vitals Trend</h3>
          <VitalsChart data={filtered.slice(0, 50)} />
        </div>
      ) : (
        /* Table view */
        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/35">
              <div className="text-3xl mb-2">📭</div>
              <div>No records found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Timestamp', 'Heart Rate', 'Oxygen', 'Pressure', 'Movement', 'LED Status', 'Symptoms'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-white/45 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => (
                    <tr key={row._id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white/55 whitespace-nowrap">
                        {new Date(row.timestamp || row.createdAt).toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${row.heartRate > 100 ? 'text-warning' : 'text-success'}`}>
                        {row.heartRate} BPM
                      </td>
                      <td className={`px-4 py-3 font-semibold ${row.oxygen < 90 ? 'text-danger' : row.oxygen < 95 ? 'text-warning' : 'text-success'}`}>
                        {row.oxygen}%
                      </td>
                      <td className="px-4 py-3 text-white/60">{row.pressure} mmHg</td>
                      <td className="px-4 py-3 text-white/60 capitalize">{row.movement}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${LED_STYLE[row.ledStatus] || ''}`}>
                          {row.ledStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50 max-w-[200px] truncate">
                        {row.symptoms?.length > 0 ? row.symptoms.join(', ') : 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
