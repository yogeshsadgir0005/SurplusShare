const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, checkEmail } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/check-email', checkEmail); // NEW ROUTE

module.exports = router;