// Fix corrupted emoji icons in Landing.jsx and Register.jsx
// Anchors on clean title/label text to replace only the broken icon value
const fs = require('fs');

const LANDING = 'C:/Users/Administrator/Desktop/hackathon/smart-tbi-survival-kit/frontend/src/pages/Landing.jsx';
const REGISTER = 'C:/Users/Administrator/Desktop/hackathon/smart-tbi-survival-kit/frontend/src/pages/Register.jsx';

// ── Landing.jsx icon replacements keyed by clean title/label ─────────────────
const ICON_MAP = {
  // FEATURES
  "AI-Powered Detection":      "\uD83E\uDDE0",  // 🧠
  "Instant Emergency Alerts":  "\uD83D\uDEA8",  // 🚨
  "LED Status System":         "\uD83D\uDCA1",  // 💡
  "GPS Location Tracking":     "\uD83D\uDCCD",  // 📍
  "Doctor Dashboard":          "\uD83D\uDC68\u200D\u2695\uFE0F",  // 👨‍⚕️
  "Vitals History":            "\uD83D\uDCCA",  // 📊
  "Real-Time Sync":            "\uD83D\uDCE1",  // 📡
  "Secure & Private":          "\uD83D\uDD12",  // 🔒
  // DEVICE_SPECS
  "Heart Rate Monitor":        "\uD83D\uDC93",  // 💓
  "Oxygen (SpO2) Sensor":     "\uD83E\uDEB7",  // 🫧
  "Pressure Sensor":           "\uD83D\uDD0B",  // 🔋
  "Movement Detector":         "\uD83D\uDCE1",  // 📡
  "RGB LED Indicator":         "\uD83D\uDCA1",  // 💡
  "GPS Module":                "\uD83D\uDCCD",  // 📍
  // HOW_IT_WORKS
  "Wear Device":               "\uD83D\uDC55",  // 👕
  "Monitor Vitals":            "\uD83D\uDCE1",  // 📡
  "Detect Anomalies":          "\uD83D\uDD0D",  // 🔍
  "Alert Doctors":             "\uD83D\uDCF2",  // 📲
  "Prepared Response":         "\uD83C\uDFE5",  // 🏥
};

// Fix comment decorations too
const REAL_TIME_DESC_BAD = /Real-Time Sync['"]\s*,\s*desc:\s*'[^']*?—[^']*?'|both patient and doctor/;

let land = fs.readFileSync(LANDING, 'utf8');

// Replace each icon value: find `icon: '[any chars up to 20]', title: 'TITLE'`
// and replace the icon value with the correct emoji
for (const [title, emoji] of Object.entries(ICON_MAP)) {
  // Matches: icon: '<corrupted>', title: '<TITLE>'
  //      or: icon: '<corrupted>', label: '<LABEL>'
  const re = new RegExp(
    `icon:\\s*'[^']{0,30}',\\s*(?:title|label):\\s*'${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`,
    'u'
  );
  land = land.replace(re, `icon: '${emoji}', ${title.includes('Monitor') || title.includes('Sensor') || title.includes('Detector') || title.includes('Indicator') || title.includes('Module') ? 'label' : 'title'}: '${title}'`);
}

// Fix "— both patient" desc corruption
land = land.replace(
  /Socket\.io powered live updates[^']*?both patient and doctor dashboards sync instantly\./,
  "Socket.io powered live updates — both patient and doctor dashboards sync instantly."
);

fs.writeFileSync(LANDING, land, 'utf8');
console.log('Landing.jsx fixed');

// ── Register.jsx role button ─────────────────────────────────────────────────
let reg = fs.readFileSync(REGISTER, 'utf8');

// Fix role button text:  {r === 'doctor' ? '<corrupted> Doctor' : '<corrupted> Patient'}
reg = reg.replace(
  /\{r === 'doctor' \? '[^']*?Doctor' : '[^']*?Patient'\}/,
  "{r === 'doctor' ? '\uD83D\uDC68\u200D\u2695\uFE0F Doctor' : '\uD83E\uDDD1\u200D\uD83D\uDCBC Patient'}"
);

fs.writeFileSync(REGISTER, reg, 'utf8');
console.log('Register.jsx fixed');

// ── Quick sanity check ───────────────────────────────────────────────────────
for (const f of [LANDING, REGISTER]) {
  const t = fs.readFileSync(f, 'utf8');
  const still = [...t].filter(c => { const cp = c.codePointAt(0); return cp === 0xFFFD; }).length;
  console.log(f.split('/').pop() + ' – remaining U+FFFD: ' + still);
}
