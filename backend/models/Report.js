const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['road_blockage', 'animal_sighting', 'scam', 'accident', 'fire', 'emergency', 'other']
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  locationName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_report'],
    default: 'active'
  },
  media: [{
    type: String
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reportSchema.index({ location: '2dsphere' });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);