const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Create a report
// POST /api/reports
router.post('/', protect, async (req, res) => {
  try {
    const { type, title, description, latitude, longitude, locationName } = req.body;

    if (!type || !title || !description || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const report = await Report.create({
      userId: req.user._id,
      type,
      title,
      description,
      locationName: locationName || '',
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    });

    // Update user's last active
    await User.findByIdAndUpdate(req.user._id, {
      lastActive: Date.now()
    });

    res.status(201).json({
      success: true,
      report
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

//all reports - with filters
// route   GET /api/reports
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Report.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      reports
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get nearby reports
// @route   GET /api/reports/nearby
router.get('/nearby', protect, async (req, res) => {
  try {
    const { radius = 5000 } = req.query;

    const user = await User.findById(req.user._id);
    if (!user.location || user.location.coordinates[0] === 0) {
      return res.status(400).json({
        success: false,
        message: 'User location not set'
      });
    }

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: parseInt(radius)
        }
      },
      status: 'active'
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

//Get report by ID
// route   GET /api/reports/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('userId', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update report status
// route   PUT /api/reports/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // user owns the report check
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    report.status = status || report.status;
    await report.save();

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete report
// route   DELETE /api/reports/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user owns the report
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
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