const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const https = require('https');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const geocodeLocation = (address, city, state) => {
  return new Promise((resolve) => {
    const query = encodeURIComponent(`${address}, ${city}, ${state}, India`);
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      path: `/search?q=${query}&format=json&limit=1`,
      method: 'GET',
      headers: { 'User-Agent': 'SurplusShareLogistics/1.0' }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.length > 0) resolve({ lat: parseFloat(parsed[0].lat), lng: parseFloat(parsed[0].lon) });
          else resolve({ lat: null, lng: null });
        } catch(e) { resolve({ lat: null, lng: null }); }
      });
    });
    req.on('error', () => resolve({ lat: null, lng: null }));
    req.end();
  });
};

// NEW: Quick endpoint to verify if an email is already registered
const checkEmail = async (req, res) => {
  const { email } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'Email already exists. Please log in.' });
  }
  res.status(200).json({ message: 'Email available' });
};

const registerUser = async (req, res) => {
  const { email, password, role, details } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });
  
  let finalLat = details.lat;
  let finalLng = details.lng;

  if (!finalLat || !finalLng) {
    const coords = await geocodeLocation(details.address, details.city, details.state);
    finalLat = coords.lat;
    finalLng = coords.lng;
  }

  const locationData = { ...details, lat: finalLat, lng: finalLng };

  const userData = { email, password, role };
  if (role === 'NGO') userData.ngoDetails = locationData;
  if (role === 'Supplier') userData.supplierDetails = locationData;
  
  const user = await User.create(userData);
  if (user) {
    res.status(201).json({ 
      _id: user._id, 
      email: user.email, 
      role: user.role, 
      supplierDetails: user.supplierDetails,
      ngoDetails: user.ngoDetails,
      token: generateToken(user._id) 
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({ 
      _id: user._id, 
      email: user.email, 
      role: user.role, 
      supplierDetails: user.supplierDetails,
      ngoDetails: user.ngoDetails,
      token: generateToken(user._id) 
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

const googleAuth = async (req, res) => {
  const { token, role, details } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const { email, name } = ticket.getPayload();
    let user = await User.findOne({ email });
  
    if (user) {
        return res.json({ 
            _id: user._id, 
            email: user.email, 
            role: user.role, 
            supplierDetails: user.supplierDetails,
            ngoDetails: user.ngoDetails,
            token: generateToken(user._id) 
        });
    }
    
    if (!role) return res.status(404).json({ message: 'Account not found. Please sign up first.', email, name });

    let finalLat = details?.lat || null;
    let finalLng = details?.lng || null;

    if ((!finalLat || !finalLng) && details && details.city && details.state) {
      const coords = await geocodeLocation(details.address, details.city, details.state);
      finalLat = coords.lat;
      finalLng = coords.lng;
    }

    const generatedPassword = Math.random().toString(36).slice(-10) + 'A1!';
    const userData = { email, password: generatedPassword, role };
    
    if (role === 'NGO') userData.ngoDetails = { ...details, name: details.name || name, lat: finalLat, lng: finalLng };
    if (role === 'Supplier') userData.supplierDetails = { ...details, legalName: details.legalName || name, lat: finalLat, lng: finalLng };

    user = await User.create(userData);
    
    res.status(201).json({ 
        _id: user._id, 
        email: user.email, 
        role: user.role, 
        supplierDetails: user.supplierDetails,
        ngoDetails: user.ngoDetails,
        token: generateToken(user._id) 
    });
  } catch (error) {
    res.status(400).json({ message: 'Google authentication failed' });
  }
};

module.exports = { registerUser, loginUser, googleAuth, checkEmail }; // Exported checkEmail