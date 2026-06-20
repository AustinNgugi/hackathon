const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, hospital, phone, deviceId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ message: 'Role must be patient or doctor' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      hospital: hospital || '',
      phone: phone || '',
      deviceId: deviceId || (role === 'patient' ? `TBI-${Date.now()}` : ''),
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'tbi_survival_kit_secret_2025',
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;

    // Notify all connected doctors when a new patient registers
    if (role === 'patient') {
      const io = req.app.get('io');
      if (io) io.emit('new:patient', userObj);
    }

    res.status(201).json({ token, user: userObj });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'tbi_survival_kit_secret_2025',
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me — returns the currently authenticated user
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
