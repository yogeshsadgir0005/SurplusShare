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

    const now = new Date();
    const currentDay = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' }).format(now);
    const currentTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);

    const validPosts = posts.filter(p => {
      if (p.type === 'OneTime') return true;
      if (p.type === 'Scheduled') {
         const todaySchedule = p.scheduledDays?.find(d => d.day === currentDay && d.isActive);
         if (!todaySchedule) return false;
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

      if (req.body.scheduledDays) {
         post.scheduledDays = typeof req.body.scheduledDays === 'string' ? JSON.parse(req.body.scheduledDays) : req.body.scheduledDays;
      }

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

    // 1. Fetch only posts the NGO has actually claimed (for Personal Stats, Charts, and Goals)
    const allNgoPosts = await Post.find({ "claims.ngoId": ngoId }).populate('supplierId', 'supplierDetails.legalName');
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let savedKgs = 0, activeClaimsCount = 0;
    let currentMonthKgs = 0, prevMonthKgs = 0;
    let currentMonthClaims = 0, prevMonthClaims = 0;
    let currentMonthPartners = new Set(), prevMonthPartners = new Set();
    let uniquePartners = new Set();
    
    let totalApprovedClaims = 0;
    let totalRejectedClaims = 0;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthlyData = Array.from({ length: 12 }, (_, i) => ({ name: monthNames[i], meals: 0, weight: 0 }));
    
    // Process NGO's Personal Stats
    allNgoPosts.forEach(post => {
      const myClaim = post.claims.find(c => c.ngoId.toString() === ngoId.toString());
      if (myClaim) {
        
        const postDate = new Date(post.updatedAt);
        const isCurrentMonth = postDate.getMonth() === currentMonth && postDate.getFullYear() === currentYear;
        const isPrevMonth = postDate.getMonth() === prevMonth && postDate.getFullYear() === prevYear;

        if (post.supplierId?._id) {
            uniquePartners.add(post.supplierId._id.toString());
        }
        
        const isSuccess = myClaim.status === 'Approved' || myClaim.status === 'Completed';

        if (isSuccess) totalApprovedClaims++;
        if (myClaim.status === 'Rejected') totalRejectedClaims++;

        if (isSuccess) {
          savedKgs += post.weight; 
          
          if (isCurrentMonth) currentMonthKgs += post.weight;
          if (isPrevMonth) prevMonthKgs += post.weight;

          if (postDate.getFullYear() === currentYear) {
            const mIndex = postDate.getMonth();
            monthlyData[mIndex].weight += post.weight;
            monthlyData[mIndex].meals += Math.floor((post.weight * 1000) / 400);
          }
        }
        
        if ((myClaim.status === 'Pending' || myClaim.status === 'Approved') && post.status !== 'Expired') {
          activeClaimsCount++;
        }

        if (isCurrentMonth) {
            currentMonthClaims++;
            if (post.supplierId?._id) currentMonthPartners.add(post.supplierId._id.toString());
        }
        if (isPrevMonth) {
            prevMonthClaims++;
            if (post.supplierId?._id) prevMonthPartners.add(post.supplierId._id.toString());
        }
      }
    });

    // 2. Fetch network Active posts AND our active claims (for the "Upcoming Pickups" Radar feed)
    const activeNetworkPosts = await Post.find({
        $or: [
            { status: 'Active' },
            { "claims.ngoId": ngoId, "claims.status": { $in: ['Pending', 'Approved'] } }
        ]
    }).populate('supplierId', 'supplierDetails.legalName');

    let upcomingPickupsRaw = [];
    const currentDayNum = now.getDay();
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };

    activeNetworkPosts.forEach(post => {
      const myClaim = post.claims.find(c => c.ngoId.toString() === ngoId.toString());

      // Hide if the NGO already completed or got rejected for it
      if (myClaim && (myClaim.status === 'Completed' || myClaim.status === 'Rejected')) return;
      // Hide if expired, UNLESS we hold an approved claim on it
      if (post.status === 'Expired' && (!myClaim || myClaim.status !== 'Approved')) return;

      const isUrgent = post.shelfLife && post.shelfLife.toLowerCase().includes('hour');
      let formattedTime = 'Schedule Pending';
      let targetDayNum = -1;
      let nextTimeStr = '23:59';

      if (post.type === 'Scheduled' && post.scheduledDays && post.scheduledDays.length > 0) {
        let minDaysDiff = 7;
        post.scheduledDays.forEach(d => {
            if (d.isActive) {
                const dNum = dayMap[d.day];
                if (dNum !== undefined) {
                    let diff = (dNum - currentDayNum + 7) % 7;
                    if (diff === 0 && d.deadlineTime && d.deadlineTime < currentTimeStr) diff = 7;
                    
                    if (diff < minDaysDiff) {
                        minDaysDiff = diff;
                        targetDayNum = dNum;
                        nextTimeStr = d.deadlineTime || '23:59';
                    }
                }
            }
        });
        
        const activeDays = post.scheduledDays.filter(d => d.isActive).map(d => d.day.substring(0,3)).join(', ');
        formattedTime = activeDays ? `${activeDays} ${nextTimeStr}`.trim() : 'Schedule Pending';
        if (targetDayNum === -1) targetDayNum = new Date(post.updatedAt).getDay();

      } else if (post.pickupDate) {
        const dateObj = new Date(post.pickupDate);
        if (!isNaN(dateObj.getTime())) {
            targetDayNum = dateObj.getDay();
            nextTimeStr = post.pickupTime || '23:59';
            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            formattedTime = `${dayOfWeek} ${post.pickupTime || ''}`.trim();
        } else {
            targetDayNum = new Date(post.updatedAt).getDay();
            formattedTime = `${post.pickupDate} ${post.pickupTime || ''}`.trim();
        }
      } else {
        targetDayNum = new Date(post.updatedAt).getDay();
      }

      const daysFromToday = (targetDayNum - currentDayNum + 7) % 7;
      const sortDate = new Date(now.getTime());
      sortDate.setDate(now.getDate() + daysFromToday);
      const [hh, mm] = nextTimeStr.split(':');
      sortDate.setHours(parseInt(hh||23), parseInt(mm||59), 0, 0);

      upcomingPickupsRaw.push({
        id: post._id,
        title: post.supplierId?.supplierDetails?.legalName || 'Unknown Supplier',
        address: post.pickupAddress || `${post.city}, ${post.state}`,
        time: formattedTime, 
        amount: `${post.weight} kg ${post.category}`,
        urgent: isUrgent,
        isRed: isUrgent || (myClaim && myClaim.status === 'Pending'),
        rawDate: sortDate.getTime()
      });
    });

    // --- 3. FINAL CALCULATIONS ---
    const mealsProvided = Math.floor((savedKgs * 1000) / 400);
    const currentMonthMeals = Math.floor((currentMonthKgs * 1000) / 400);
    const prevMonthMeals = Math.floor((prevMonthKgs * 1000) / 400);

    const calcTrend = (curr, prev) => {
        if (prev === 0) return curr > 0 ? '+100%' : '+0%';
        const pct = Math.round(((curr - prev) / prev) * 100);
        return pct >= 0 ? `+${pct}%` : `${pct}%`;
    };

    const finalStats = {
        activeClaims: { value: activeClaimsCount, label: 'shipments', trend: `${calcTrend(currentMonthClaims, prevMonthClaims)} this month` },
        mealsProvided: { value: mealsProvided, label: 'meals', trend: `${calcTrend(currentMonthMeals, prevMonthMeals)} this month` },
        foodRescued: { value: savedKgs, label: 'kg', trend: `${calcTrend(currentMonthKgs, prevMonthKgs)} this month` },
        networkGrowth: { value: uniquePartners.size, label: 'partners', trend: `${calcTrend(currentMonthPartners.size, prevMonthPartners.size)} this month` }
    };

    const totalHandledClaims = totalApprovedClaims + totalRejectedClaims;
    const zeroWasteScore = totalHandledClaims > 0 
        ? Math.round((totalApprovedClaims / totalHandledClaims) * 100) 
        : 0;

    const dynamicGoals = {
        monthlyRescue: {
            current: currentMonthMeals,
            percent: Math.min(100, Math.round((currentMonthMeals / 2000) * 100))
        },
        networkPartners: {
            current: uniquePartners.size,
            percent: Math.min(100, Math.round((uniquePartners.size / 50) * 100))
        },
        zeroWaste: {
            current: zeroWasteScore,
            percent: zeroWasteScore
        },
        communityImpact: {
            current: mealsProvided, // 1 meal = 1 person impacted
            percent: Math.min(100, Math.round((mealsProvided / 5000) * 100))
        }
    };

    const chartData = monthlyData.slice(0, currentMonth + 1).map(data => ({ name: data.name, meals: data.meals, weight: data.weight }));

    upcomingPickupsRaw.sort((a, b) => a.rawDate - b.rawDate);
    const upcomingPickups = upcomingPickupsRaw.slice(0, 3).map(u => {
        const { rawDate, ...rest } = u; 
        return rest;
    });

    const timeSince = (date) => {
      const seconds = Math.floor((now - date) / 1000);
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
      else if (myClaim.status === 'Completed') actionText = `Successfully picked up ${post.weight}kg`;

      return { 
        id: post._id, 
        supplier: post.supplierId?.supplierDetails?.legalName || 'System', 
        action: actionText, 
        time: timeSince(new Date(post.updatedAt)),
        status: myClaim.status 
      };
    });

    res.json({ 
      stats: finalStats, 
      goals: dynamicGoals, 
      feed: feed.length > 0 ? feed : [],
      chartData: chartData,
      upcomingPickups: upcomingPickups
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNgoClaims = async (req, res) => {
  try {
    const ngoId = req.user._id;
    // FETCH ALL CLAIMS: Removed the status filter so Completed and Rejected flow to the frontend
    const posts = await Post.find({ 
        "claims.ngoId": ngoId
    }).populate('supplierId', 'supplierDetails.legalName').sort({ updatedAt: -1 });

    const claims = posts.map(post => {
      const myClaim = post.claims.find(c => c.ngoId.toString() === ngoId.toString());
      
      let formattedTime = 'Schedule Pending';
      if (post.type === 'Scheduled' && post.scheduledDays?.length > 0) {
          const activeDays = post.scheduledDays.filter(d => d.isActive).map(d => d.day.substring(0,3)).join(', ');
          const time = post.scheduledDays.find(d => d.isActive)?.deadlineTime || '';
          formattedTime = activeDays ? `${activeDays} ${time}`.trim() : 'Schedule Pending';
      } else if (post.pickupDate) {
          const dateObj = new Date(post.pickupDate);
          if (!isNaN(dateObj.getTime())) {
              const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
              formattedTime = `${dayOfWeek} ${post.pickupTime || ''}`.trim();
          } else {
              formattedTime = `${post.pickupDate} ${post.pickupTime || ''}`.trim();
          }
      }

      return {
        id: post._id,
        supplier: post.supplierId?.supplierDetails?.legalName || 'Unknown Supplier',
        category: post.category,
        weight: post.weight,
        status: myClaim.status,
        date: formattedTime,
        address: post.pickupAddress || `${post.city}, ${post.state}`
      };
    });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markClaimCompleted = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const claim = post.claims.find(c => c.ngoId.toString() === req.user._id.toString());
    if (claim && claim.status === 'Approved') {
        claim.status = 'Completed';
        await post.save();
        res.json({ success: true, message: 'Pickup marked as completed' });
    } else {
        res.status(400).json({ message: 'Claim cannot be completed. It may not be approved yet.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNgoHistory = async (req, res) => {
  try {
    const ngoId = req.user._id;
    const posts = await Post.find({ 
        "claims.ngoId": ngoId,
        "claims.status": { $in: ['Completed', 'Rejected'] }
    }).populate('supplierId', 'supplierDetails.legalName').sort({ updatedAt: -1 });

    const history = posts.map(post => {
      const myClaim = post.claims.find(c => c.ngoId.toString() === ngoId.toString());
      const dateObj = new Date(post.updatedAt);
      
      return {
        id: post._id.toString().slice(-6).toUpperCase(),
        rawId: post._id,
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        supplier: post.supplierId?.supplierDetails?.legalName || 'Unknown Supplier',
        items: post.category,
        weight: `${post.weight} kg`,
        status: myClaim.status
      };
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNgoImpact = async (req, res) => {
  try {
    const ngoId = req.user._id;
    const posts = await Post.find({ "claims.ngoId": ngoId, "claims.status": { $in: ['Approved', 'Completed'] } });

    let totalWeight = 0;
    let categoryMap = {};
    
    const currentYear = new Date().getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthlyDataArray = Array.from({ length: 12 }, (_, i) => ({ name: monthNames[i], co2: 0, water: 0, _rawWeight: 0 }));

    posts.forEach(post => {
        totalWeight += post.weight;
        
        categoryMap[post.category] = (categoryMap[post.category] || 0) + post.weight;

        const d = new Date(post.updatedAt);
        if (d.getFullYear() === currentYear) {
            monthlyDataArray[d.getMonth()]._rawWeight += post.weight;
        }
    });

    const totals = {
        co2: (totalWeight * 2.5).toLocaleString(),
        water: (totalWeight * 1000).toLocaleString(),
        meals: Math.floor(totalWeight * 2.5).toLocaleString(),
        financial: "$" + (totalWeight * 5).toLocaleString()
    };

    const currentMonth = new Date().getMonth();
    const monthlyData = monthlyDataArray.slice(0, currentMonth + 1).map(m => ({
        name: m.name,
        co2: Math.round(m._rawWeight * 2.5),
        water: Math.round(m._rawWeight * 1000)
    }));

    const categoryData = Object.keys(categoryMap).map(key => ({
        name: key,
        amount: categoryMap[key]
    })).sort((a, b) => b.amount - a.amount);

    res.json({ totals, monthlyData, categoryData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this function inside postController.js

const getLandingPageMetrics = async (req, res) => {
  try {
    // 1. Calculate Kilos Saved (Total weight of 'Claimed' posts)
    const weightAggregation = await Post.aggregate([
      { $match: { status: 'Claimed' } },
      { $group: { _id: null, totalWeight: { $sum: '$weight' } } }
    ]);
    const kilosSaved = weightAggregation.length > 0 ? weightAggregation[0].totalWeight : 0;

    // 2. Calculate Meals Redirected (Standardized logic: 400g per meal)
    const mealsRedirected = Math.floor((kilosSaved * 1000) / 400);

    // 3. Count Verified Donors & NGO Partners
    const donorsCount = await User.countDocuments({ role: 'Supplier' });
    const ngosCount = await User.countDocuments({ role: 'NGO' });

    res.json({
      kilosSaved,
      mealsRedirected,
      donorsCount,
      ngosCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update your module.exports at the bottom to include the new function
module.exports = { 
  createPost, getActivePosts, getSupplierPosts, getPostById, updatePost, updatePostStatus, 
  claimPost, manageClaim, getSupplierDashboardMetrics, getNgoDashboardMetrics, getLeaderboard,
  getNgoClaims, markClaimCompleted, getNgoHistory, getNgoImpact, 
  getLandingPageMetrics // <-- ADDED THIS
};