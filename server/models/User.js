const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['NGO', 'Supplier'], required: true },
  ngoDetails: {
    name: String, mission: String, website: String, mobile: String,
    address: String, city: String, district: String, state: String,
    lat: { type: Number, default: null }, // NEW: Geographic Latitude
    lng: { type: Number, default: null }  // NEW: Geographic Longitude
  },
  supplierDetails: {
    businessType: String, legalName: String, address: String,
    city: String, district: String, state: String, website: String, contactNumber: String,
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);