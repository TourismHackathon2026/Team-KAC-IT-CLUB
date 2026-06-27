const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// route   POST /api/location/update
// access  Private
router.post('/update', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        lastActive: Date.now(),
        isOnline: true
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// route   GET /api/location/nearby
router.get('/nearby', protect, async (req, res) => {//get nearby users
  try {
    const { radius = 5000 } = req.query; // Default 5km radius

    const user = await User.findById(req.user._id);
    if (!user.location || user.location.coordinates[0] === 0) {
      return res.status(400).json({
        success: false,
        message: 'User location not set'
      });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      isOnline: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).select('name location lastActive isOnline');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;