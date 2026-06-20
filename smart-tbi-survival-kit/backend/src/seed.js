/**
 * Database Seeder
 * Creates test doctor + patient accounts with sample sensor data and alerts.
 * Run manually:  npm run seed
 * Auto-runs on first startup when DB is empty.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const SensorData = require('./models/SensorData');
const Alert = require('./models/Alert');

async function run() {
  const shouldConnect = mongoose.connection.readyState === 0;

  if (shouldConnect) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-tbi');
    console.log('[Seed] Connected to MongoDB');
  }

  // Clear existing data
  await Promise.all([User.deleteMany({}), SensorData.deleteMany({}), Alert.deleteMany({})]);

  const hashedPassword = await bcrypt.hash('123456', 10);

  // ── Create Doctor ──────────────────────────────────────────────────────────
  const doctor = await User.create({
    name: 'Dr. Sarah Chen',
    email: 'doctor@test.com',
    password: hashedPassword,
    role: 'doctor',
    hospital: 'Nairobi General Hospital',
    phone: '+254 722 207 767',
  });

  // ── Create 4 Demo Patients with different statuses ─────────────────────────
  const patientsConfig = [
    {
      name: 'John Martinez',
      email: 'patient@test.com',
      hospital: 'Nairobi General Hospital',
      deviceId: 'TBI-DEVICE-001',
      phone: '+254 711 000 001',
      baseHR: 76, baseO2: 97,   // SEAML
    },
    {
      name: 'Amina Odhiambo',
      email: 'amina@test.com',
      hospital: 'Kenyatta National Hospital',
      deviceId: 'TBI-DEVICE-002',
      phone: '+254 711 000 002',
      baseHR: 106, baseO2: 92,  // CAUTION
    },
    {
      name: 'David Kipchoge',
      email: 'david@test.com',
      hospital: 'Aga Khan University Hospital',
      deviceId: 'TBI-DEVICE-003',
      phone: '+254 711 000 003',
      baseHR: 88, baseO2: 96,   // SEAML (recovering)
    },
    {
      name: 'Grace Wanjiru',
      email: 'grace@test.com',
      hospital: 'Nairobi General Hospital',
      deviceId: 'TBI-DEVICE-004',
      phone: '+254 711 000 004',
      baseHR: 118, baseO2: 86,  // DANGER
    },
  ];

  const patients = [];
  for (const cfg of patientsConfig) {
    const p = await User.create({
      name: cfg.name,
      email: cfg.email,
      password: hashedPassword,
      role: 'patient',
      hospital: cfg.hospital,
      deviceId: cfg.deviceId,
      phone: cfg.phone,
    });
    patients.push({ user: p, cfg });
  }

  // ── Sensor readings: 20 readings per patient, every 8 minutes ─────────────
  const allReadings = [];
  for (const { user: p, cfg } of patients) {
    for (let i = 20; i >= 0; i--) {
      const ts = new Date(Date.now() - i * 8 * 60 * 1000);
      const jitter = (n) => Math.floor(Math.random() * n * 2) - n;
      const hr = Math.max(50, Math.min(160, cfg.baseHR + jitter(7)));
      const o2 = Math.max(75, Math.min(100, cfg.baseO2 + jitter(2)));
      let led = 'SEAML';
      if (o2 < 90) led = 'DANGER';
      else if (o2 < 95 || hr > 100) led = 'CAUTION';
      allReadings.push({
        patientId: p._id,
        heartRate: hr,
        oxygen: o2,
        pressure: 78 + jitter(5),
        movement: hr > 110 ? 'moderate' : 'stable',
        ledStatus: led,
        symptoms: led === 'DANGER' ? ['confusion'] : led === 'CAUTION' ? ['headache'] : [],
        location: {
          lat: -1.2921 + Math.random() * 0.01,
          lon: 36.8219 + Math.random() * 0.01,
        },
        timestamp: ts,
      });
    }
  }
  await SensorData.insertMany(allReadings);

  // ── Active alerts: CRITICAL for Grace, URGENT for Amina ──────────────────
  const grace = patients.find((p) => p.user.email === 'grace@test.com').user;
  const amina = patients.find((p) => p.user.email === 'amina@test.com').user;
  const john  = patients.find((p) => p.user.email === 'patient@test.com').user;

  await Alert.create({
    patientId: grace._id,
    hospitalId: doctor._id,
    severity: 'CRITICAL',
    status: 'active',
    checklist: [
      { item: 'Prepare CT scanner', checked: true },
      { item: 'Notify neurosurgeon', checked: false },
      { item: 'Prepare IV fluids', checked: false },
      { item: 'Prepare emergency medication', checked: false },
      { item: 'Assemble trauma team', checked: false },
    ],
    location: { lat: -1.2921, lon: 36.8219 },
  });

  await Alert.create({
    patientId: amina._id,
    hospitalId: doctor._id,
    severity: 'URGENT',
    status: 'active',
    checklist: [
      { item: 'Prepare oxygen support', checked: false },
      { item: 'Prepare trauma bed', checked: false },
    ],
    location: { lat: -1.295, lon: 36.825 },
  });

  await Alert.create({
    patientId: john._id,
    hospitalId: doctor._id,
    severity: 'ROUTINE',
    status: 'resolved',
    checklist: [{ item: 'Prepare examination room', checked: true }],
    location: { lat: -1.2921, lon: 36.8219 }, // Nairobi, Kenya
  });

  console.log('[Seed] ✓ Completed successfully');
  console.log('[Seed]   Doctor  → doctor@test.com  / 123456');
  console.log('[Seed]   Patient → patient@test.com / 123456');
  console.log('[Seed]   Patient → amina@test.com   / 123456  (CAUTION)');
  console.log('[Seed]   Patient → david@test.com   / 123456  (SEAML)');
  console.log('[Seed]   Patient → grace@test.com   / 123456  (DANGER)');

  if (shouldConnect) {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Allow running as a standalone script
if (require.main === module) {
  run().catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  });
}

module.exports = { run };
