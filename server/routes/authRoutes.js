const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, checkEmail, getUserProfile, updateUserProfile, sendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/check-email', checkEmail); 
router.post('/send-otp', sendOTP); // NEW ROUTE

// Protected Profile/Settings routes
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);

module.exports = router;