// Targeted text-level fix for corrupted special characters
const fs = require('fs');
const path = require('path');

const root = 'C:/Users/Administrator/Desktop/hackathon/smart-tbi-survival-kit/frontend/src';

// Map every known corrupted sequence → correct character
// Uses codepoints to avoid any editor/terminal re-encoding
const FIXES = [
  // Ellipsis  (U+2026) – shows as various junk
  ['\u00e2\u0080\u00a6', '\u2026'],   // UTF-8 bytes of … mis-decoded as Latin-1 then re-encoded
  ['\ufffd?\ufffd', '\u2026'],
  ['\ufffd\u003f\ufffd', '\u2026'],

  // ⚡ lightning (U+26A1)
  ['\u00e2\u009a\u00a1', '\u26a1'],
  ['\ufffd\u0073\ufffd', '\u26a1'],   // terminal renders š as s
  ['\ufffd\u015b\ufffd', '\u26a1'],

  // ← left arrow (U+2190)
  ['\u00e2\u0086\u0090', '\u2190'],
  ['\ufffd\u0086\ufffd', '\u2190'],

  // • bullet (U+2022)
  ['\u00e2\u0080\u00a2', '\u2022'],
  ['\ufffd\ufffd', '\u2022'],         // double replacement → bullet

  // — em-dash (U+2014)
  ['\u00e2\u0080\u0094', '\u2014'],

  // ' right single quote (U+2019)
  ['\u00e2\u0080\u0099', '\u2019'],

  // " left/right double quotes
  ['\u00e2\u0080\u009c', '\u201c'],
  ['\u00e2\u0080\u009d', '\u201d'],

  // 👨‍⚕️ doctor emoji  (U+1F468 ZWJ U+2695 FE0F)
  ['\u00f0\u009f\u0091\u00a8\u00e2\u0080\u008d\u00e2\u009a\u0095\u00ef\u00b8\u008f', '\u{1f468}\u200d\u2695\ufe0f'],

  // 🧑‍💼 office worker (U+1F9D1 ZWJ U+1F4BC)
  ['\u00f0\u009f\u00a7\u0091\u00e2\u0080\u008d\u00f0\u009f\u0092\u00bc', '\u{1f9d1}\u200d\u{1f4bc}'],

  // 🏥 hospital  (U+1F3E5)
  ['\u00f0\u009f\u008f\u00a5', '\u{1f3e5}'],

  // 🧠 brain (U+1F9E0)
  ['\u00f0\u009f\u00a7\u0080', '\u{1f9e0}'],

  // 📍 pin (U+1F4CD)
  ['\u00f0\u009f\u0093\u008d', '\u{1f4cd}'],

  // 📡 satellite (U+1F4E1)
  ['\u00f0\u009f\u0093\u00a1', '\u{1f4e1}'],

  // 🚨 siren (U+1F6A8)
  ['\u00f0\u009f\u009a\u00a8', '\u{1f6a8}'],

  // 💡 bulb (U+1F4A1)
  ['\u00f0\u009f\u0092\u00a1', '\u{1f4a1}'],

  // 🔒 lock (U+1F512)
  ['\u00f0\u009f\u0094\u0092', '\u{1f512}'],

  // 📊 chart (U+1F4CA)
  ['\u00f0\u009f\u0093\u008a', '\u{1f4ca}'],

  // 👨‍⚕️ variations – just ⚕ sign (U+2695)
  ['\u00e2\u009a\u0095', '\u2695'],

  // ─ box-drawing (U+2500) – used in comments
  ['\u00e2\u0094\u0080', '\u2500'],

  // ═ double box-drawing (U+2550)
  ['\u00e2\u0095\u0090', '\u2550'],

  // Stray BOM or leading ? on first line
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(jsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

let totalFixed = 0;
for (const file of walk(root)) {
  let text = fs.readFileSync(file, 'utf8');

  // Strip leading BOM / replacement char before 'import' on line 1
  text = text.replace(/^[\ufffd\u003f]+(?=import)/, '');

  let changed = false;
  for (const [bad, good] of FIXES) {
    if (text.includes(bad)) {
      text = text.split(bad).join(good);
      changed = true;
    }
  }

  // Also replace any remaining lone U+FFFD before known text patterns
  // e.g. "\ufffd Back to home" → "← Back to home"
  text = text.replace(/\ufffd+\s*Back to home/g, '\u2190 Back to home');
  // "\ufffd TBI KIT" → "⚡ TBI KIT"
  text = text.replace(/\ufffd[a-z]?\ufffd\s*TBI KIT/gi, '\u26a1 TBI KIT');
  // "Signing in\ufffd" or "Creating account\ufffd"
  text = text.replace(/(Signing in|Creating account)\ufffd+[^\'""]*/g, '$1\u2026');
  // placeholder with repeated \ufffd (was bullet dots)
  text = text.replace(/placeholder=["']\ufffd+["']/g, 'placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"');
  // Doctor/Patient role buttons
  text = text.replace(/\ufffd+\s*Doctor/g, '\u{1f468}\u200d\u2695\ufe0f Doctor');
  text = text.replace(/\ufffd+\s*Patient/g, '\u{1f9d1}\u200d\u{1f4bc} Patient');

  if (changed || text !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('Fixed: ' + path.relative(root, file));
    totalFixed++;
  }
}
console.log('\nTotal files patched: ' + totalFixed);
