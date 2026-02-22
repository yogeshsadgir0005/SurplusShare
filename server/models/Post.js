const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ngoName: { type: String },
  ngoPhone: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
});

const scheduledDaySchema = new mongoose.Schema({
  day: { type: String }, postTime: { type: String }, deadlineTime: { type: String }, isActive: { type: Boolean, default: false }
});
 
const postSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['OneTime', 'Scheduled'], required: true },
  weight: { type: Number, required: true },
  packaging: { type: Boolean, required: true },
  pickupAddress: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  shelfLife: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String },
  pickupDate: { type: String }, // NEW: Separated Date
  pickupTime: { type: String }, // NEW: Separated Time
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  specialInstructions: { type: String },
  status: { type: String, enum: ['Active', 'Claimed', 'Expired'], default: 'Active' },
  scheduledDays: [scheduledDaySchema],
  claims: [claimSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);