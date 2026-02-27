const Post = require('../models/Post');
const User = require('../models/User');
const https = require('https');

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

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
};

const getLeaderboard = async (req, res) => {
  try {
    const topDonors = await Post.aggregate([
      { $match: { status: 'Claimed' } }, 
      { $group: { _id: '$supplierId', totalDonated: { $sum: '$weight' } } },
      { $sort: { totalDonated: -1 } },
      { $limit: 5 }
    ]);

    const populated = await User.populate(topDonors, {
      path: '_id',
      select: 'supplierDetails.legalName supplierDetails.city'
    });

    const leaderboard = populated.map((donor, index) => ({
      rank: index + 1,
      id: donor._id?._id,
      name: donor._id?.supplierDetails?.legalName || 'Anonymous Hero',
      city: donor._id?.supplierDetails?.city || 'Global',
      totalDonated: donor.totalDonated
    })).filter(d => d.id); 

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  const { type, weight, packaging, pickupAddress, city, district, state, shelfLife, category, pickupDate, pickupTime, contactName, contactPhone, specialInstructions, scheduledDays } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    let finalLat = req.body.lat;
    let finalLng = req.body.lng;

    if (!finalLat || !finalLng || finalLat === 'null' || finalLng === 'null') {
      const coords = await geocodeLocation(pickupAddress, city, state);
      finalLat = coords.lat;
      finalLng = coords.lng;
    }

    const post = new Post({
      supplierId: req.user._id, type, weight, packaging, pickupAddress, city, district, state, 
      lat: finalLat, lng: finalLng, shelfLife, category, image, pickupDate, pickupTime, 
      contactName, contactPhone, specialInstructions, 
      scheduledDays: typeof scheduledDays === 'string' ? JSON.parse(scheduledDays) : (scheduledDays || [])
    });
    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getActivePosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find({ status: 'Active' }).populate('supplierId', 'supplierDetails.legalName').lean();

    // DYNAMIC FILTERING FOR SCHEDULED POSTS (Bug 1 Fix)
    const now = new Date();
    const currentDay = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' }).format(now);
    const currentTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);

    const validPosts = posts.filter(p => {
      if (p.type === 'OneTime') return true;
      if (p.type === 'Scheduled') {
         const todaySchedule = p.scheduledDays?.find(d => d.day === currentDay && d.isActive);
         if (!todaySchedule) return false;
         // It only shows up if the current time is between the release time and the deadline time
         if (currentTime >= todaySchedule.postTime && currentTime <= todaySchedule.deadlineTime) return true;
         return false;
      }
      return false;
    });

    const ngoLat = user.ngoDetails?.lat;
    const ngoLng = user.ngoDetails?.lng;
    const ngoState = user.ngoDetails?.state || '';
    const ngoDistrict = user.ngoDetails?.district || '';
    const ngoCity = user.ngoDetails?.city || '';

    const postsWithDistance = validPosts.map(p => {
      let distance = null;
      if (ngoLat && ngoLng && p.lat && p.lng) distance = getDistanceFromLatLonInKm(ngoLat, ngoLng, p.lat, p.lng);
      return { ...p, distance };
    });

    const sortedPosts = postsWithDistance.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      let scoreA = 0; let scoreB = 0;
      if (a.state === ngoState) scoreA += 1;
      if (a.district === ngoDistrict) scoreA += 10;
      if (a.city.toLowerCase() === ngoCity.toLowerCase()) scoreA += 100;
      if (b.state === ngoState) scoreB += 1;
      if (b.district === ngoDistrict) scoreB += 10;
      if (b.city.toLowerCase() === ngoCity.toLowerCase()) scoreB += 100;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(sortedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSupplierPosts = async (req, res) => {
  const posts = await Post.find({ supplierId: req.user._id }).sort({ createdAt: -1 });
  res.json(posts);
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('supplierId', 'supplierDetails.legalName').lean();
    if (post) {
      post.hasClaimed = post.claims?.some(c => c.ngoId.toString() === req.user._id.toString());
      res.json(post);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post && post.supplierId.toString() === req.user._id.toString()) {
      const updatableFields = ['weight', 'packaging', 'pickupAddress', 'city', 'district', 'state', 'shelfLife', 'category', 'pickupDate', 'pickupTime', 'contactName', 'contactPhone', 'specialInstructions'];
      let locationChanged = false;
      
      updatableFields.forEach(field => {
        if (req.body[field] !== undefined) {
          if ((field === 'city' || field === 'state' || field === 'pickupAddress') && req.body[field] !== post[field]) locationChanged = true;
          post[field] = req.body[field];
        }
      });

      // Handle parsing stringified array from FormData
      if (req.body.scheduledDays) {
         post.scheduledDays = typeof req.body.scheduledDays === 'string' ? JSON.parse(req.body.scheduledDays) : req.body.scheduledDays;
      }

      // Handle new image upload
      if (req.file) {
         post.image = `/uploads/${req.file.filename}`;
      }

      if (locationChanged) {
        const coords = await geocodeLocation(post.pickupAddress, post.city, post.state);
        post.lat = coords.lat; post.lng = coords.lng;
      }

      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePostStatus = async (req, res) => {
  const { status } = req.body;
  const post = await Post.findById(req.params.id);
  if (post && post.supplierId.toString() === req.user._id.toString()) {
    post.status = status;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } else res.status(404).json({ message: 'Resource not found' });
};

const claimPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyClaimed = post.claims.some(c => c.ngoId.toString() === req.user._id.toString());
    if (alreadyClaimed) return res.status(400).json({ message: 'You have already requested to claim this food.' });

    const ngo = await User.findById(req.user._id);
    post.claims.push({ ngoId: req.user._id, ngoName: ngo.ngoDetails.name, ngoPhone: ngo.ngoDetails.mobile });
    await post.save();
    
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const manageClaim = async (req, res) => {
  const { claimId, status } = req.body;
  const post = await Post.findById(req.params.id);
  if (post && post.supplierId.toString() === req.user._id.toString()) {
    const claim = post.claims.id(claimId);
    if (claim) {
      claim.status = status;
      if (status === 'Approved') post.status = 'Claimed';
      await post.save();
      res.json(post);
    } else res.status(404).json({ message: 'Claim not found' });
  } else res.status(403).json({ message: 'Unauthorized' });
};

const getSupplierDashboardMetrics = async (req, res) => {
  const posts = await Post.find({ supplierId: req.user._id, status: 'Claimed' });
  let totalWeight = 0;
  posts.forEach(p => totalWeight += p.weight);
  const mealsDonated = Math.floor((totalWeight * 1000) / 400);
  res.json({ totalWeight, mealsDonated });
};

const getNgoDashboardMetrics = async (req, res) => {
  try {
    const ngoId = req.user._id;
    const allNgoPosts = await Post.find({ "claims.ngoId": ngoId });
    let savedKgs = 0, activeClaims = 0;

    allNgoPosts.forEach(post => {
      const myClaim = post.claims.find(c => c.ngoId.toString() === ngoId.toString());
      if (myClaim) {
        if (myClaim.status === 'Approved') savedKgs += post.weight; 
        if ((myClaim.status === 'Pending' || myClaim.status === 'Approved') && post.status !== 'Expired') activeClaims++;
      }
    });

    const mealsProvided = Math.floor((savedKgs * 1000) / 400);

    const timeSince = (date) => {
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " days ago";
      interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + " hours ago";
      interval = seconds / 60; if (interval > 1) return Math.floor(interval) + " mins ago";
      return "Just now";
    };

    const interactionHistory = await Post.find({ "claims.ngoId": ngoId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('supplierId', 'supplierDetails.legalName');
    
    const feed = interactionHistory.map(post => {
      const myClaim = post.claims.find(c => c.ngoId.toString() === ngoId.toString());
      let actionText = "";
      if (myClaim.status === 'Pending') actionText = `Requested ${post.weight}kg of ${post.category}`;
      else if (myClaim.status === 'Approved') actionText = `Claim approved for ${post.weight}kg`;
      else if (myClaim.status === 'Rejected') actionText = `Request declined for ${post.category}`;

      return { 
        _id: post._id, 
        supplier: post.supplierId?.supplierDetails?.legalName || 'System', 
        action: actionText, 
        time: timeSince(new Date(post.updatedAt)),
        status: myClaim.status 
      };
    });

    res.json({ stats: { activeClaims, mealsProvided, savedKgs }, feed: feed.length > 0 ? feed : [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createPost, getActivePosts, getSupplierPosts, getPostById, updatePost, updatePostStatus, 
  claimPost, manageClaim, getSupplierDashboardMetrics, getNgoDashboardMetrics, getLeaderboard
};