import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/**
 * VitalsChart — Line chart displaying heart rate and oxygen levels over time.
 * Accepts an array of sensor reading objects (newest first or oldest first).
 */
const VitalsChart = ({ data = [] }) => {
  // Reverse so oldest reading is on the left
  const sorted = [...data].reverse();

  const labels = sorted.map((d) => {
    const date = new Date(d.timestamp || d.createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: sorted.map((d) => d.heartRate),
        borderColor: '#F5B700',
        backgroundColor: 'rgba(245, 183, 0, 0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#F5B700',
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Oxygen (%)',
        data: sorted.map((d) => d.oxygen),
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#22C55E',
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255,255,255,0.7)',
          font: { size: 12 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.7)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        type: 'linear',
        position: 'left',
        ticks: { color: '#F5B700', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
        title: { display: true, text: 'BPM', color: '#F5B700', font: { size: 11 } },
      },
      y1: {
        type: 'linear',
        position: 'right',
        min: 80,
        max: 100,
        ticks: { color: '#22C55E', font: { size: 11 } },
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'SpO2 %', color: '#22C55E', font: { size: 11 } },
      },
    },
  };

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-white/40 text-sm">
        No vitals data available yet
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
};

export default VitalsChart;
