// Fixes double-encoded UTF-8 (mojibake) across all JSX source files.
// Pattern: PowerShell read UTF-8 as Windows-1252, then wrote back as UTF-8.
// Fix: decode current UTF-8 text → re-encode as Latin-1 bytes → decode as UTF-8.
const fs   = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
const latin1 = 'latin1'; // Node alias for ISO-8859-1 / Windows-1252 (byte pass-through)

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js') || entry.name.endsWith('.css')) results.push(full);
  }
  return results;
}

// Detect mojibake: these byte sequences appear when UTF-8 multi-byte chars are
// mis-read as Latin-1 and then re-encoded as UTF-8.
const MOJIBAKE = /\u00e2|\u00c3|\u00f0|\u00c2|\u00c5/;

let fixed = 0, clean = 0;
for (const file of walk(srcDir)) {
  const raw  = fs.readFileSync(file, 'utf8');
  if (!MOJIBAKE.test(raw)) { clean++; continue; }

  // Reverse: encode the mojibake string as Latin-1 bytes → decode as UTF-8
  const bytes   = Buffer.from(raw, latin1);   // each char → its code-point byte
  const correct = bytes.toString('utf8');

  // Sanity: the corrected version should not gain more mojibake
  if (MOJIBAKE.test(correct)) {
    console.log(`SKIP (ambiguous): ${path.relative(srcDir, file)}`);
    continue;
  }

  fs.writeFileSync(file, correct, 'utf8');
  console.log(`Fixed: ${path.relative(srcDir, file)}`);
  fixed++;
}
console.log(`\nDone — fixed ${fixed}, already clean ${clean}.`);
