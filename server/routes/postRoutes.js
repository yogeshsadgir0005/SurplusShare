const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createPost, getActivePosts, getSupplierPosts, getPostById,
  updatePostStatus, updatePost, claimPost, manageClaim, 
  getSupplierDashboardMetrics, getNgoDashboardMetrics, getLeaderboard,
  getNgoClaims, markClaimCompleted, getNgoHistory, getNgoImpact , getLandingPageMetrics
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/leaderboard', getLeaderboard);
router.get('/landing-metrics', getLandingPageMetrics);

router.route('/')
  .post(protect, upload.single('image'), createPost)
  .get(protect, getActivePosts);

router.get('/supplier', protect, getSupplierPosts);
router.put('/:id', protect, upload.single('image'), updatePost);
router.put('/:id/status', protect, updatePostStatus);
router.post('/:id/claim', protect, claimPost);
router.put('/:id/claim/manage', protect, manageClaim);

// Dashboard routes
router.get('/metrics', protect, getSupplierDashboardMetrics);
router.get('/ngo/metrics', protect, getNgoDashboardMetrics);
// NEW NGO Sub-Pages Routes
router.get('/ngo/my-claims', protect, getNgoClaims);
router.put('/ngo/claims/:id/complete', protect, markClaimCompleted);
router.get('/ngo/history', protect, getNgoHistory);
router.get('/ngo/impact', protect, getNgoImpact);

router.get('/:id', protect, getPostById);

module.exports = router;