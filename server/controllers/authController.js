const User = require('../models/User');
const OTP = require('../models/OTP'); 
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const https = require('https'); // Used for both Nominatim and Brevo APIs

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

// --- UPDATED: SEND OTP VIA BREVO REST API ---
const sendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        // Generate 6 digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Remove any existing OTP for this email to prevent conflicts
        await OTP.deleteMany({ email });
        await OTP.create({ email, otp: otpCode });

        // Prepare the payload for Brevo API
        const payload = JSON.stringify({
            sender: { name: 'SurplusShare Security', email: 'yogeshsadgir05@gmail.com' },
            to: [{ email: email }],
            subject: 'Your Verification Code',
            htmlContent: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #0f172a; margin-bottom: 10px;">Verification Code</h2>
                <p style="color: #475569; font-size: 16px;">Please use the following 6-digit code to verify your action. This code expires in 10 minutes.</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">${otpCode}</span>
                </div>
                <p style="color: #64748b; font-size: 14px;">If you did not request this, please ignore this email.</p>
              </div>
            `
        });

        // Setup the HTTP request options for Brevo
        const options = {
            hostname: 'api.brevo.com',
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY, // Ensure this is set in Render Env Vars
                'content-type': 'application/json',
                'content-length': Buffer.byteLength(payload)
            }
        };

        // Make the API call
        const brevoReq = https.request(options, (brevoRes) => {
            let data = '';
            brevoRes.on('data', (chunk) => data += chunk);
            brevoRes.on('end', () => {
                if (brevoRes.statusCode >= 200 && brevoRes.statusCode < 300) {
                    res.status(200).json({ message: 'OTP sent successfully' });
                } else {
                    console.error("Brevo API Error:", data);
                    res.status(500).json({ message: 'Failed to send OTP via Brevo', details: data });
                }
            });
        });

        brevoReq.on('error', (error) => {
            console.error("Brevo Request Error:", error);
            res.status(500).json({ message: 'Failed to connect to email service', error: error.message });
        });

        brevoReq.write(payload);
        brevoReq.end();

    } catch (error) {
        console.error("OTP Generation Error:", error);
        res.status(500).json({ message: 'Internal server error generating OTP', error: error.message });
    }
};

const checkEmail = async (req, res) => {
  const { email } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'Email already exists. Please log in.' });
  }
  res.status(200).json({ message: 'Email available' });
};

const registerUser = async (req, res) => {
  const { email, password, role, details, otp } = req.body;
  
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });
  
  if (!otp) return res.status(400).json({ message: 'OTP is required for registration' });
  const validOtp = await OTP.findOne({ email, otp });
  if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP code' });
  await OTP.deleteMany({ email }); 

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
      _id: user._id, email: user.email, role: user.role, 
      supplierDetails: user.supplierDetails, ngoDetails: user.ngoDetails,
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
      _id: user._id, email: user.email, role: user.role, 
      supplierDetails: user.supplierDetails, ngoDetails: user.ngoDetails,
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
            _id: user._id, email: user.email, role: user.role, 
            supplierDetails: user.supplierDetails, ngoDetails: user.ngoDetails,
            token: generateToken(user._id) 
        });
    }
    if (!role) return res.status(404).json({ message: 'Account not found. Please sign up first.', email, name });

    let finalLat = details?.lat || null;
    let finalLng = details?.lng || null;
    if ((!finalLat || !finalLng) && details && details.city && details.state) {
      const coords = await geocodeLocation(details.address, details.city, details.state);
      finalLat = coords.lat; finalLng = coords.lng;
    }

    const generatedPassword = Math.random().toString(36).slice(-10) + 'A1!';
    const userData = { email, password: generatedPassword, role };
    if (role === 'NGO') userData.ngoDetails = { ...details, name: details.name || name, lat: finalLat, lng: finalLng };
    if (role === 'Supplier') userData.supplierDetails = { ...details, legalName: details.legalName || name, lat: finalLat, lng: finalLng };

    user = await User.create(userData);
    res.status(201).json({ 
        _id: user._id, email: user.email, role: user.role, 
        supplierDetails: user.supplierDetails, ngoDetails: user.ngoDetails,
        token: generateToken(user._id) 
    });
  } catch (error) {
    res.status(400).json({ message: 'Google authentication failed' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) res.json(user);
    else res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { details, password, email, otp } = req.body;
    
    const isSensitiveChange = password || (email && email !== user.email);

    if (isSensitiveChange) {
        if (!otp) return res.status(400).json({ message: 'OTP is required for sensitive changes', requiresOtp: true });
        
        const targetEmail = (email && email !== user.email) ? email : user.email;
        const validOtp = await OTP.findOne({ email: targetEmail, otp });
        
        if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP code' });
        await OTP.deleteMany({ email: targetEmail }); 

        if (email) user.email = email;
        if (password) user.password = password; 
    }

    let finalLat = details?.lat;
    let finalLng = details?.lng;

    if (!finalLat || !finalLng) {
      const oldDetails = user.role === 'NGO' ? user.ngoDetails : user.supplierDetails;
      if (details.address !== oldDetails.address || details.city !== oldDetails.city) {
         const coords = await geocodeLocation(details.address, details.city, details.state);
         finalLat = coords.lat;
         finalLng = coords.lng;
      }
    }

    if (user.role === 'NGO') {
        user.ngoDetails = { ...user.ngoDetails, ...details, lat: finalLat, lng: finalLng };
    } else if (user.role === 'Supplier') {
        user.supplierDetails = { ...user.supplierDetails, ...details, lat: finalLat, lng: finalLng };
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id, email: updatedUser.email, role: updatedUser.role,
      supplierDetails: updatedUser.supplierDetails, ngoDetails: updatedUser.ngoDetails,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, googleAuth, checkEmail, getUserProfile, updateUserProfile, sendOTP };