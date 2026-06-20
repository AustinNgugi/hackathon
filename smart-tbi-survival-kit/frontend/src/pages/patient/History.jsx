import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import VitalsChart from '../../components/VitalsChart';
import LEDStatus from '../../components/LEDStatus';

const LED_BADGE = {
  SEAML: 'bg-success/15 text-success border-success/30',
  CAUTION: 'bg-warning/15 text-warning border-warning/30',
  DANGER: 'bg-danger/15 text-danger border-danger/30',
};

export default function PatientHistory() {
  const { api } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | SEAML | CAUTION | DANGER
  const [view, setView] = useState('table'); // table | chart

  useEffect(() => {
    api.get('/patient/history')
      .then(({ data }) => setHistory(data.history || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        <div>
          <h1 className="text-2xl font-bold text-white">Vitals History</h1>
          <p className="text-white/50 text-sm mt-0.5">{history.length} total readings</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-card border border-white/10 rounded-xl overflow-hidden">
            {['table', 'chart'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  view === v ? 'bg-accent text-dark' : 'text-white/60 hover:text-white'
                }`}
              >
                {v === 'table' ? '📋 Table' : '📊 Chart'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {['all', 'SEAML', 'CAUTION', 'DANGER'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
              filter === f
                ? 'bg-accent text-dark border-accent'
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f === 'all' ? `All (${history.length})` : `${f} (${history.filter((h) => h.ledStatus === f).length})`}
          </button>
        ))}
      </div>

      {view === 'chart' ? (
        <div className="bg-card border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Vitals Trend Chart</h3>
          <VitalsChart data={filtered.slice(0, 30)} />
        </div>
      ) : (
        /* Table view */
        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/35">
              <div className="text-3xl mb-2">📭</div>
              <div>No readings match the selected filter</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Timestamp', 'Heart Rate', 'Oxygen', 'Pressure', 'Movement', 'Status', 'Symptoms'].map(
                      (h) => (
                        <th key={h} className="text-left px-4 py-3 text-white/50 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => (
                    <tr
                      key={row._id || idx}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                        {new Date(row.timestamp || row.createdAt).toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${row.heartRate > 100 ? 'text-warning' : 'text-success'}`}>
                        {row.heartRate} BPM
                      </td>
                      <td className={`px-4 py-3 font-semibold ${row.oxygen < 90 ? 'text-danger' : row.oxygen < 95 ? 'text-warning' : 'text-success'}`}>
                        {row.oxygen}%
                      </td>
                      <td className="px-4 py-3 text-white/70">{row.pressure} mmHg</td>
                      <td className="px-4 py-3 text-white/70 capitalize">{row.movement}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${LED_BADGE[row.ledStatus] || ''}`}>
                          {row.ledStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50 max-w-[180px] truncate">
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
