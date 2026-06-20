const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  checked: { type: Boolean, default: false },
});

const alertSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    severity: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'CRITICAL'],
      default: 'ROUTINE',
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
    },
    checklist: [checklistItemSchema],
    location: {
      lat: { type: Number, default: -1.2921 },  // Nairobi, Kenya
      lon: { type: Number, default: 36.8219 },
    },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for fast queries
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
