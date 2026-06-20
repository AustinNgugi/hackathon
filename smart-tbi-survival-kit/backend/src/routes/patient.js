const express = require('express');
const router = express.Router();
const { auth, patientOnly } = require('../middleware/auth');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const User = require('../models/User');

/** Helper: calculate LED status from vitals */
function calculateLEDStatus({ oxygen, heartRate, symptoms = [] }) {
  const s = symptoms.map((x) => x.toLowerCase());

  // DANGER — critical thresholds
  if (
    oxygen < 90 ||
    s.includes('confusion') ||
    s.includes('abnormal_movement') ||
    s.includes('loss_of_consciousness') ||
    s.includes('unconscious')
  ) {
    return 'DANGER';
  }

  // CAUTION — warning thresholds
  if (
    (oxygen >= 90 && oxygen <= 95) ||
    (heartRate > 100 && heartRate <= 120) ||
    s.includes('headache') ||
    s.includes('dizziness') ||
    s.includes('nausea') ||
    s.includes('blurred_vision')
  ) {
    return 'CAUTION';
  }

  return 'SEAML';
}

// GET /api/patient/dashboard
router.get('/dashboard', auth, patientOnly, async (req, res) => {
  try {
    const latest = await SensorData.findOne({ patientId: req.user._id }).sort({ timestamp: -1 });
    const recent = await SensorData.find({ patientId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10);
    const activeAlert = await Alert.findOne({ patientId: req.user._id, status: 'active' }).sort({
      createdAt: -1,
    });

    res.json({ latest, recent, activeAlert, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/patient/symptoms — log symptoms (creates a sensor data entry)
router.post('/symptoms', auth, patientOnly, async (req, res) => {
  try {
    const { symptoms, notes, heartRate, oxygen, pressure, movement } = req.body;

    const ledStatus = calculateLEDStatus({
      oxygen: oxygen || 98,
      heartRate: heartRate || 75,
      symptoms: symptoms || [],
    });

    const sensorData = await SensorData.create({
      patientId: req.user._id,
      heartRate: heartRate || 75,
      oxygen: oxygen || 98,
      pressure: pressure || 80,
      movement: movement || 'stable',
      symptoms: symptoms || [],
      notes: notes || '',
      ledStatus,
      location: { lat: -1.2921, lon: 36.8219 }, // Nairobi, Kenya default
    });

    const io = req.app.get('io');
    io.emit('sensor:update', { ...sensorData.toObject(), patientName: req.user.name });

    res.json({ success: true, sensorData, ledStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/patient/emergency — create emergency SOS alert
router.post('/emergency', auth, patientOnly, async (req, res) => {
  try {
    const { location } = req.body;

    const alert = await Alert.create({
      patientId: req.user._id,
      severity: 'CRITICAL',
      status: 'active',
      checklist: [
        { item: 'Prepare CT scanner', checked: false },
        { item: 'Notify neurosurgeon', checked: false },
        { item: 'Prepare IV fluids', checked: false },
        { item: 'Prepare emergency medication', checked: false },
        { item: 'Assemble trauma team', checked: false },
      ],
      location: location || { lat: -1.2921, lon: 36.8219 }, // Nairobi, Kenya
    });

    const io = req.app.get('io');
    io.emit('new:alert', {
      ...alert.toObject(),
      patientName: req.user.name,
      isEmergency: true,
    });

    res.json({ success: true, alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/patient/history
router.get('/history', auth, patientOnly, async (req, res) => {
  try {
    const history = await SensorData.find({ patientId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/patient/profile
router.get('/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/patient/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, hospital } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, phone, hospital } },
      { new: true, select: '-password' }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
