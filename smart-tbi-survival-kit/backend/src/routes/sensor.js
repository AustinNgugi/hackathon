const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');

/**
 * Calculate LED status based on sensor vitals and reported symptoms.
 * SEAML  = Safe / normal
 * CAUTION = Warning signs present
 * DANGER  = Critical — immediate response required
 */
function calculateLEDStatus({ oxygen, heartRate, symptoms = [] }) {
  const s = symptoms.map((x) => x.toLowerCase());

  if (
    oxygen < 90 ||
    s.includes('confusion') ||
    s.includes('abnormal_movement') ||
    s.includes('loss_of_consciousness') ||
    s.includes('unconscious')
  ) {
    return 'DANGER';
  }

  if (
    (oxygen >= 90 && oxygen <= 95) ||
    (heartRate > 100 && heartRate <= 120) ||
    s.includes('headache') ||
    s.includes('dizziness') ||
    s.includes('nausea')
  ) {
    return 'CAUTION';
  }

  return 'SEAML';
}

/** Return preparation checklist items for a given alert severity */
function getChecklist(severity) {
  switch (severity) {
    case 'CRITICAL':
      return [
        'Prepare CT scanner',
        'Notify neurosurgeon',
        'Prepare IV fluids',
        'Prepare emergency medication',
        'Assemble trauma team',
      ];
    case 'URGENT':
      return ['Prepare oxygen support', 'Prepare trauma bed'];
    default:
      return ['Prepare examination room'];
  }
}

// POST /api/sensor/data — receive sensor data from device/simulator
router.post('/data', auth, async (req, res) => {
  try {
    const { heartRate, oxygen, pressure, movement, symptoms, location } = req.body;

    if (heartRate === undefined || oxygen === undefined) {
      return res.status(400).json({ message: 'heartRate and oxygen are required' });
    }

    const ledStatus = calculateLEDStatus({
      oxygen,
      heartRate,
      symptoms: symptoms || [],
    });

    const sensorData = await SensorData.create({
      patientId: req.user._id,
      heartRate,
      oxygen,
      pressure: pressure || 80,
      movement: movement || 'stable',
      ledStatus,
      symptoms: symptoms || [],
      location: location || { lat: -1.2921, lon: 36.8219 }, // Nairobi, Kenya
    });

    const io = req.app.get('io');

    // Emit to all connected clients (patients + doctors)
    io.emit('sensor:update', {
      ...sensorData.toObject(),
      patientName: req.user.name,
    });

    // Auto-create alert if condition is CAUTION or DANGER
    if (ledStatus === 'DANGER' || ledStatus === 'CAUTION') {
      const severity = ledStatus === 'DANGER' ? 'CRITICAL' : 'URGENT';
      const checklist = getChecklist(severity);

      const alert = await Alert.create({
        patientId: req.user._id,
        severity,
        status: 'active',
        checklist: checklist.map((item) => ({ item, checked: false })),
        location: sensorData.location,
      });

      io.emit('new:alert', {
        ...alert.toObject(),
        patientName: req.user.name,
      });
    }

    res.json({ success: true, sensorData, ledStatus });
  } catch (err) {
    console.error('Sensor data error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
