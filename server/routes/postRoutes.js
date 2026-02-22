const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createPost, getActivePosts, getSupplierPosts, getPostById,
  updatePostStatus, updatePost, claimPost, manageClaim, 
  getSupplierDashboardMetrics, getNgoDashboardMetrics, getLeaderboard
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Public Unprotected Routes
router.get('/leaderboard', getLeaderboard);

// Protected Routes
router.route('/')
  .post(protect, upload.single('image'), createPost)
  .get(protect, getActivePosts);

router.get('/supplier', protect, getSupplierPosts);
router.put('/:id', protect, updatePost);
router.put('/:id/status', protect, updatePostStatus);
router.post('/:id/claim', protect, claimPost);
router.put('/:id/claim/manage', protect, manageClaim);
router.get('/metrics', protect, getSupplierDashboardMetrics);
router.get('/ngo/metrics', protect, getNgoDashboardMetrics);
router.get('/:id', protect, getPostById);

module.exports = router;