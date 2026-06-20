const fs = require('fs');
const path = require('path');

const landingPath = path.join(__dirname, 'frontend/src/pages/Landing.jsx');
let src = fs.readFileSync(landingPath, 'utf8');

const cleanData = `const FEATURES = [
  { icon: '🧠', title: 'AI-Powered Detection', desc: 'Real-time TBI pattern recognition using sensor fusion and threshold algorithms.', color: 'text-blue-400' },
  { icon: '🚨', title: 'Instant Emergency Alerts', desc: 'Sub-2-second emergency notifications to medical teams via real-time socket events.', color: 'text-danger' },
  { icon: '💡', title: 'LED Status System', desc: 'SEAML / CAUTION / DANGER visual indicators with dynamic condition-based color changes.', color: 'text-accent' },
  { icon: '📍', title: 'GPS Location Tracking', desc: 'Precise patient GPS coordinates sent with every alert for rapid emergency dispatch.', color: 'text-success' },
  { icon: '👨‍⚕️', title: 'Doctor Dashboard', desc: 'Professional medical interface with severity-sorted alerts and preparation checklists.', color: 'text-purple-400' },
  { icon: '📊', title: 'Vitals History', desc: 'Continuous logging of heart rate, oxygen, pressure, and movement with visual charts.', color: 'text-cyan-400' },
  { icon: '📡', title: 'Real-Time Sync', desc: 'Socket.io powered live updates - both patient and doctor dashboards sync instantly.', color: 'text-green-400' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication, role-based access, and encrypted data storage for full compliance.', color: 'text-orange-400' },
];

const DEVICE_SPECS = [
  { icon: '💓', label: 'Heart Rate Monitor', desc: 'Continuous BPM via optical sensor' },
  { icon: '🫧', label: 'Oxygen (SpO2) Sensor', desc: 'Pulse oximetry monitoring' },
  { icon: '🔋', label: 'Pressure Sensor', desc: 'Intracranial pressure detection' },
  { icon: '📡', label: 'Movement Detector', desc: '3-axis accelerometer for motion alerts' },
  { icon: '💡', label: 'RGB LED Indicator', desc: 'Green / Yellow / Red status display' },
  { icon: '📍', label: 'GPS Module', desc: 'Real-time location broadcasting' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '👕', title: 'Wear Device', desc: 'Patient wears the smart headband with integrated sensors' },
  { step: '02', icon: '📡', title: 'Monitor Vitals', desc: 'Device streams heart rate, oxygen, pressure, and movement data' },
  { step: '03', icon: '🔍', title: 'Detect Anomalies', desc: 'System analyzes patterns and calculates LED status in real-time' },
  { step: '04', icon: '📲', title: 'Alert Doctors', desc: 'Instant Socket.io notification with GPS location to medical team' },
  { step: '05', icon: '🏥', title: 'Prepared Response', desc: 'Doctor receives checklist and prepares the right equipment in advance' },
];`;

// Replace from 'const FEATURES = [' all the way through 'const HOW_IT_WORKS = [' closing '];'
const blockRe = /const FEATURES\s*=\s*\[[\s\S]*?\];[\s\S]*?const HOW_IT_WORKS\s*=\s*\[[\s\S]*?\];/;
if (blockRe.test(src)) {
  src = src.replace(blockRe, cleanData);
  fs.writeFileSync(landingPath, src, 'utf8');
  console.log('Landing.jsx data arrays replaced successfully.');
} else {
  console.log('Pattern not found — trying fallback...');
  // Fallback: replace line by line via known corrupted markers
  const lines = src.split('\n');
  const startIdx = lines.findIndex(l => l.includes('const FEATURES'));
  const endIdx = lines.findIndex(l => l.includes('const HOW_IT_WORKS')) + 
    lines.slice(lines.findIndex(l => l.includes('const HOW_IT_WORKS'))).findIndex(l => l.trim() === '];') + 1;
  if (startIdx !== -1 && endIdx > startIdx) {
    lines.splice(startIdx, endIdx - startIdx, ...cleanData.split('\n'));
    fs.writeFileSync(landingPath, lines.join('\n'), 'utf8');
    console.log('Landing.jsx patched via line replacement.');
  } else {
    console.error('Could not locate data blocks in Landing.jsx');
    process.exit(1);
  }
}
