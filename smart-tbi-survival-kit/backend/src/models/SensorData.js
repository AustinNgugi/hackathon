const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    heartRate: { type: Number, default: 75 },
    oxygen: { type: Number, default: 98 },
    pressure: { type: Number, default: 80 },
    movement: { type: String, default: 'stable' },
    ledStatus: { type: String, enum: ['SEAML', 'CAUTION', 'DANGER'], default: 'SEAML' },
    symptoms: [{ type: String }],
    notes: { type: String },
    location: {
      lat: { type: Number, default: -1.2921 },  // Nairobi, Kenya
      lon: { type: Number, default: 36.8219 },
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for fast queries by patient and time
sensorDataSchema.index({ patientId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
