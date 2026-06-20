const express = require('express');
const router = express.Router();
const { auth, doctorOnly } = require('../middleware/auth');
const User = require('../models/User');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');

// GET /api/doctor/dashboard — active alerts + all patients with latest vitals
router.get('/dashboard', auth, doctorOnly, async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'active' })
      .populate('patientId', 'name email deviceId phone hospital')
      .sort({ createdAt: -1 });

    const patients = await User.find({ role: 'patient' }).select('-password');

    // Attach latest vitals to each patient
    const patientVitals = await Promise.all(
      patients.map(async (patient) => {
        const latest = await SensorData.findOne({ patientId: patient._id }).sort({ timestamp: -1 });
        return { patient, latest };
      })
    );

    res.json({ alerts, patients: patientVitals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/doctor/patients
router.get('/patients', auth, doctorOnly, async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/doctor/patient/:id — patient detail with latest vitals + active alerts
router.get('/patient/:id', auth, doctorOnly, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const latest = await SensorData.findOne({ patientId: patient._id }).sort({ timestamp: -1 });
    const recent = await SensorData.find({ patientId: patient._id })
      .sort({ timestamp: -1 })
      .limit(10);
    const activeAlerts = await Alert.find({ patientId: patient._id, status: 'active' }).sort({
      createdAt: -1,
    });

    res.json({ patient, latest, recent, activeAlerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/doctor/alert/:alertId — update alert status and checklist
router.put('/alert/:alertId', auth, doctorOnly, async (req, res) => {
  try {
    const { status, checklist, notes } = req.body;

    const alert = await Alert.findByIdAndUpdate(
      req.params.alertId,
      { $set: { status, checklist, notes } },
      { new: true }
    ).populate('patientId', 'name email');

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Broadcast update to all connected clients
    const io = req.app.get('io');
    io.emit('alert:update', alert);

    res.json({ alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/doctor/history/:id — patient vitals history (up to 500 records)
router.get('/history/:id', auth, doctorOnly, async (req, res) => {
  try {
    const history = await SensorData.find({ patientId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(500);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
