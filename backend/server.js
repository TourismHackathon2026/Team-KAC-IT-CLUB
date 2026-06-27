const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const User = require('./models/User');
const Report = require('./models/Report');

connectDB();

const app = express();

// CORS 
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://10.124.136.108:5173', 'http://10.0.7.203:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/location', require('./routes/location'));
app.use('/api/reports', require('./routes/reports'));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hackathon API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      location: '/api/location',
      reports: '/api/reports'
    }
  });
});

// Create HTTP server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Register user with socket
  socket.on('register-user', (userId) => {
    if (!userId) {
      console.error('No userId provided for registration');
      return;
    }
    
    socket.userId = userId;
    socket.join(`user_${userId}`);
    console.log(`User ${userId} registered with socket ${socket.id}`);
    
    // Send confirmation back to client
    socket.emit('registration-confirmed', { 
      userId: userId,
      socketId: socket.id 
    });
  });

  // Handle SOS alert
  socket.on('sos-alert', async (data) => {
    try {
      const { userId, latitude, longitude, message, type = 'emergency' } = data;

      console.log(`SOS Alert from user ${userId}`);
      console.log('Data received:', data);

      // Validate userId
      if (!userId) {
        console.error('SOS Error: userId is required');
        socket.emit('sos-error', {
          message: 'User ID is required'
        });
        return;
      }

      // Check if user exists in database
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found:', userId);
        socket.emit('sos-error', {
          message: 'User not found'
        });
        return;
      }

      // Find nearby users within 2km
      const nearbyUsers = await User.find({
        _id: { $ne: userId },
        isOnline: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: 2000
          }
        }
      });

      console.log(`Found ${nearbyUsers.length} nearby users`);

      // Create emergency report
      const report = await Report.create({
        userId: userId,
        type: 'emergency',
        title: `🚨 EMERGENCY SOS: ${message || 'Help needed!'}`,
        description: message || 'Emergency SOS alert sent',
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        status: 'active'
      });

      // Send alert to each nearby user
      nearbyUsers.forEach((nearbyUser) => {
        console.log(`Sending SOS to user ${nearbyUser._id}`);
        io.to(`user_${nearbyUser._id}`).emit('sos-received', {
          from: userId,
          fromName: user.name,
          location: { latitude, longitude },
          message: message || 'Emergency help needed!',
          reportId: report._id,
          timestamp: new Date()
        });
      });

      io.to(`user_${userId}`).emit('sos-confirmation', {
        message: 'SOS alert sent successfully!',
        recipients: nearbyUsers.length,
        reportId: report._id
      });

    } catch (error) {
      console.error('SOS Error:', error);
      
      // Send error back to the sender
      const senderId = socket.userId || data.userId;
      if (senderId) {
        io.to(`user_${senderId}`).emit('sos-error', {
          message: error.message || 'Failed to send SOS alert'
        });
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      console.log(`User ${socket.userId} disconnected`);
      // Update user status after delay
      setTimeout(async () => {
        try {
          const user = await User.findById(socket.userId);
          if (user) {
            user.isOnline = false;
            await user.save();
          }
        } catch (error) {
          console.error('Error updating user status:', error);
        }
      }, 5000);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});