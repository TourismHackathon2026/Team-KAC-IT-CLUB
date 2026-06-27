import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReportDetailModal from './ReportDetailModal';
import { 
  MapPin, Users, AlertTriangle, Shield, LogOut, 
  Plus, RefreshCw, Navigation, Bell, Eye, EyeOff,
  Mountain, Flag, Heart, Star, Compass, Camera,
  TrendingUp, Clock, Award, Globe, Wifi, Battery,
  Home, Phone, HelpCircle, Info, CheckCircle,
  User, Mail, Calendar, MessageCircle, Share2,
  ThumbsUp, ThumbsDown, Filter, Search, X,
  ExternalLink, Download, Printer, Sun, Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ReportForm from './ReportForm';
import UserProfileModal from './UserProfileModal';

// Fix Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Nepal Themed Marker
const NepalMarker = ({ report, onMarkerClick }) => {
  const colors = {
    road_blockage: '#DC143C',
    animal_sighting: '#FF9933',
    scam: '#0033A0',
    accident: '#DC143C',
    fire: '#DC143C',
    emergency: '#DC143C',
    other: '#64748b'
  };

  const icons = {
    road_blockage: '🚧',
    animal_sighting: '🐾',
    scam: '⚠️',
    accident: '🚗',
    fire: '🔥',
    emergency: '🚨',
    other: '📌'
  };

  return (
    <Marker
      position={[report.location.coordinates[1], report.location.coordinates[0]]}
      icon={L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: ${colors[report.type] || '#64748b'}; width: 42px; height: 42px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; transition: all 0.3s;">${icons[report.type] || '📌'}</div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      })}
      eventHandlers={{
        click: () => onMarkerClick && onMarkerClick(report)
      }}
    >
      <Popup>
        <div className="p-3 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{icons[report.type] || '📌'}</span>
            <h3 className="font-bold text-gray-900">{report.title}</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-nepal-red/10 text-nepal-red rounded-full capitalize">
              {report.type.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(report.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1">
            <Flag className="w-3 h-3" />
            <span>Reported from Nepal</span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const socketRef = useRef(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    activeUsers: 0,
    resolved: 0,
    emergency: 0,
    roadBlockage: 0,
    animalSighting: 0,
    scam: 0,
    accident: 0,
    fire: 0
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const userId = user.id || user._id;
    if (!userId) { toast.error('User ID not found'); return; }

    // Socket Connection
    socketRef.current = io('http://localhost:5000');
    socketRef.current.on('connect', () => {
      socketRef.current.emit('register-user', userId);
    });

    socketRef.current.on('sos-received', (data) => {
      const notification = {
        id: Date.now(),
        type: 'sos',
        message: `${data.fromName || 'A traveler'} needs emergency help!`,
        data: data,
        read: false,
        timestamp: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="bg-red-50 border-l-4 border-nepal-red p-5 rounded-xl shadow-2xl max-w-md"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-nepal-red rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-nepal-red">🚨 SOS Emergency!</p>
              <p className="text-sm text-gray-700 font-medium">
                {data.fromName || 'A traveler'} needs help!
              </p>
              <p className="text-xs text-gray-500 mt-1">{data.message}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <Flag className="w-3 h-3" />
                <span>Nepal Safety Alert</span>
              </div>
            </div>
          </div>
        </motion.div>
      ), { duration: 10000 });
    });

    // Location Tracking
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          try {
            await axios.post('http://localhost:5000/api/location/update', { latitude, longitude });
            fetchAllData(latitude, longitude);
          } catch (error) {
            console.error('Location update error:', error);
          }
        },
        () => toast.error('Enable GPS for safety features'),
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
      return () => {
        navigator.geolocation.clearWatch(watchId);
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [user, navigate]);

  const fetchAllData = async (latitude, longitude) => {
    try {
      setLoading(true);
      const [reportsRes, usersRes, allReportsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/reports/nearby?radius=5000'),
        axios.get('http://localhost:5000/api/location/nearby?radius=5000'),
        axios.get('http://localhost:5000/api/reports?limit=100')
      ]);
      
      const reports = reportsRes.data.reports || [];
      const users = usersRes.data.users || [];
      const all = allReportsRes.data.reports || [];
      
      setNearbyReports(reports);
      setNearbyUsers(users);
      setAllReports(all);
      
      // Update stats
      setStats({
        totalReports: all.length,
        activeUsers: users.length,
        resolved: all.filter(r => r.status === 'resolved').length,
        emergency: all.filter(r => r.type === 'emergency').length,
        roadBlockage: all.filter(r => r.type === 'road_blockage').length,
        animalSighting: all.filter(r => r.type === 'animal_sighting').length,
        scam: all.filter(r => r.type === 'scam').length,
        accident: all.filter(r => r.type === 'accident').length,
        fire: all.filter(r => r.type === 'fire').length
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('See you soon! 🏔️');
  };

  const handleSOS = () => {
    const userId = user?.id || user?._id;
    if (!userId) { toast.error('Not authenticated'); return; }
    if (!location) { toast.error('Location not available'); return; }
    if (!socketRef.current?.connected) { toast.error('Connection lost'); return; }

    const message = prompt('Enter emergency message (optional):');
    if (message !== null) {
      setSosLoading(true);
      socketRef.current.emit('sos-alert', {
        userId,
        latitude: location.latitude,
        longitude: location.longitude,
        message: message || 'Emergency help needed!'
      });
      
      socketRef.current.once('sos-confirmation', (data) => {
        toast.success(`SOS sent to ${data.recipients || 0} nearby travelers! 🚨`);
        setSosLoading(false);
      });
      socketRef.current.once('sos-error', () => {
        toast.error('Failed to send SOS');
        setSosLoading(false);
      });
      setTimeout(() => setSosLoading(false), 10000);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleMarkerClick = (report) => {
    setSelectedReport(report);
    // Scroll to report details or show modal
    toast.info(`📍 ${report.title} - Click for details`);
  };

  const getReportIcon = (type) => {
    const icons = {
      road_blockage: '🚧',
      animal_sighting: '🐾',
      scam: '⚠️',
      accident: '🚗',
      fire: '🔥',
      emergency: '🚨',
      other: '📌'
    };
    return icons[type] || '📌';
  };

  const getReportColor = (type) => {
    const colors = {
      road_blockage: 'border-nepal-red',
      animal_sighting: 'border-orange-400',
      scam: 'border-blue-600',
      accident: 'border-red-600',
      fire: 'border-red-700',
      emergency: 'border-red-800',
      other: 'border-gray-400'
    };
    return colors[type] || 'border-gray-400';
  };

  const filteredReports = allReports.filter(report => {
    if (filterType !== 'all' && report.type !== filterType) return false;
    if (searchQuery && !report.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !report.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getUserReports = (userId) => {
    return allReports.filter(report => report.userId?._id === userId || report.userId === userId);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const exportReports = () => {
    const data = JSON.stringify(allReports, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nepal-safety-reports-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reports exported successfully!');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-red-50'}`}>
      {/* Nepal Flag Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-nepal-red via-nepal-blue to-nepal-red" />
      
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 border-b transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-lg border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-nepal-red to-nepal-crimson rounded-xl flex items-center justify-center shadow-lg shadow-nepal-red/30"
              >
                <Flag className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Nepal Safety Network
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-nepal-red" />
                  Safe Travel · Explore Nepal
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-all duration-300 ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-xl transition-all duration-300 relative ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-nepal-red text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifications}
                    </span>
                  )}
                </motion.button>
                
                {/* Notification Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl overflow-hidden z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'}`}
                    >
                      <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-3 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer transition ${!notification.read ? 'bg-red-50' : ''}`}
                              onClick={() => markNotificationRead(notification.id)}
                            >
                              <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden sm:flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">Online</span>
              </div>
              <span className={`text-sm hidden md:block font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                👋 {user?.name}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className={`p-2 rounded-xl transition-all duration-300 ${darkMode ? 'text-gray-300 hover:text-nepal-red hover:bg-red-900/30' : 'text-gray-500 hover:text-nepal-red hover:bg-red-50'}`}
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-nepal-red to-nepal-crimson rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 opacity-10">
            <Mountain className="w-48 h-48" />
          </div>
          <div className="absolute left-0 bottom-0 opacity-10">
            <Flag className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Welcome to Nepal, {user?.name}! 🏔️</h2>
            </div>
            <p className="text-white/90 max-w-2xl">
              Stay safe while exploring the beautiful mountains of Nepal. 
              Report issues, get help, and connect with fellow travelers.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Flag className="w-4 h-4" /> Nepal
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" /> Safe Travel
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" /> Trusted Community
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {stats.activeUsers} Travelers Online
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl shadow-md p-5 border transition-all duration-300 hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-nepal-red/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-nepal-red" />
              </div>
              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Reports</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalReports}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl shadow-md p-5 border transition-all duration-300 hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Travelers Near</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl shadow-md p-5 border transition-all duration-300 hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Resolved</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.resolved}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-2xl shadow-md p-5 border transition-all duration-300 hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Emergency</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.emergency}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-2xl shadow-md p-5 border transition-all duration-300 hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Safety Score</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalReports > 0 ? Math.round((stats.resolved / stats.totalReports) * 100) : 100}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowReportForm(true)}
            className="btn-nepal flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Report Issue
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSOS}
            disabled={sosLoading}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl 
                     hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]
                     flex items-center gap-2 font-semibold shadow-lg shadow-red-500/30
                     disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-slow"
          >
            <AlertTriangle className="w-5 h-5" />
            {sosLoading ? 'Sending SOS...' : '🚨 SOS Emergency'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchAllData(location?.latitude, location?.longitude)}
            className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </motion.button>

          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {showMap ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>

          <button
            onClick={exportReports}
            className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            >
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'road_blockage', 'animal_sighting', 'scam', 'accident', 'fire', 'emergency', 'other'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        filterType === type 
                          ? 'bg-nepal-red text-white' 
                          : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'all' ? 'All' : type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setFilterType('all'); setSearchQuery(''); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map and Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className={`lg:col-span-2 transition-all duration-500 ${!showMap && 'hidden'}`}>
            <div className={`rounded-2xl shadow-lg overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <Compass className="w-5 h-5 text-nepal-red" />
                  Live Map of Nepal
                </h2>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                    <MapPin className="w-3 h-3" />
                    {nearbyReports.length} markers
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                  </span>
                </div>
              </div>
              <div className="h-[500px] w-full">
                {location ? (
                  <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='© OpenStreetMap contributors'
                    />
                    <Circle
                      center={[location.latitude, location.longitude]}
                      radius={500}
                      pathOptions={{ 
                        color: '#DC143C', 
                        fillColor: '#DC143C', 
                        fillOpacity: 0.1 
                      }}
                    />
                    <Marker
                      position={[location.latitude, location.longitude]}
                      icon={L.divIcon({
                        className: 'custom-marker',
                        html: `<div style="background: #DC143C; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 15px rgba(220,20,60,0.4); display: flex; align-items: center; justify-content: center; font-size: 16px; color: white; font-weight: bold;">📍</div>`,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18],
                      })}
                    >
                      <Popup>You are here 🏔️</Popup>
                    </Marker>
                    {nearbyReports.map((report) => (
                      <NepalMarker 
                        key={report._id} 
                        report={report} 
                        onMarkerClick={handleMarkerClick}
                      />
                    ))}
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Navigation className="w-12 h-12 mx-auto mb-2 text-gray-300 animate-pulse" />
                      <p>Getting your location...</p>
                      <p className="text-xs text-gray-400 mt-1">Enable GPS for safety features</p>
                    </div>
                  </div>
                )}
              </div>
              <div className={`p-3 border-t ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} flex items-center justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Nepal Safety Map
                </span>
                <span>{nearbyReports.length} active reports</span>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-lg overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <Bell className="w-5 h-5 text-nepal-red" />
                  Nearby Reports
                </h2>
                <span className="text-xs bg-nepal-red/10 text-nepal-red px-2 py-1 rounded-full">
                  {nearbyReports.length} new
                </span>
              </div>
              <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="loader mx-auto mb-3" />
                    Loading reports...
                  </div>
                ) : nearbyReports.length === 0 ? (
                  <div className="p-8 text-center">
                    <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No reports nearby</p>
                    <p className="text-sm text-gray-400 mt-1">Your area is safe! 🏔️</p>
                  </div>
                ) : (
                  nearbyReports.map((report) => (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 hover:bg-red-50 transition cursor-pointer border-l-4 ${getReportColor(report.type)} ${darkMode ? 'hover:bg-gray-700' : ''}`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getReportIcon(report.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.title}</h3>
                            <span className="text-xs px-2 py-0.5 bg-nepal-red/10 text-nepal-red rounded-full capitalize whitespace-nowrap">
                              {report.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{report.description}</p>
                          <div className={`flex items-center gap-3 mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {report.userId?.name || 'Anonymous'}
                            </span>
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {report.status === 'active' && (
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Users with Click to View Reports */}
        <div className="mt-6">
          <div className={`rounded-2xl shadow-lg overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Users className="w-5 h-5 text-nepal-red" />
                Travelers Near You
                <span className="text-sm font-normal text-gray-500 ml-2">({nearbyUsers.length} nearby)</span>
              </h2>
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                {nearbyUsers.filter(u => u.isOnline).length} online
              </span>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center text-gray-500 py-4">Loading travelers...</div>
              ) : nearbyUsers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No travelers nearby</p>
                  <p className="text-xs text-gray-400 mt-1">You're exploring solo! 🏔️</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {nearbyUsers.map((nearbyUser) => (
                    <motion.div
                      key={nearbyUser._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      onClick={() => handleUserClick(nearbyUser)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-red-50'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nepal-red to-nepal-crimson flex items-center justify-center text-white font-semibold shadow-md">
                          {nearbyUser.name?.charAt(0).toUpperCase()}
                        </div>
                        {nearbyUser.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {nearbyUser.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs ${nearbyUser.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                            {nearbyUser.isOnline ? '🟢 Online' : '⚪ Offline'}
                          </span>
                          {getUserReports(nearbyUser._id).length > 0 && (
                            <span className="text-xs bg-nepal-red/10 text-nepal-red px-1.5 py-0.5 rounded-full">
                              {getUserReports(nearbyUser._id).length} reports
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Reports Section with Filters */}
        <div className="mt-6">
          <div className={`rounded-2xl shadow-lg overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Filter className="w-5 h-5 text-nepal-red" />
                All Reports
                <span className="text-sm font-normal text-gray-500 ml-2">({filteredReports.length} total)</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                  {filterType !== 'all' ? `Filter: ${filterType.replace('_', ' ')}` : 'All types'}
                </span>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading all reports...</div>
              ) : filteredReports.length === 0 ? (
                <div className="p-8 text-center">
                  <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No reports found</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to report an issue</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 hover:bg-red-50 transition cursor-pointer border-l-4 ${getReportColor(report.type)} ${darkMode ? 'hover:bg-gray-700' : ''}`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getReportIcon(report.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.title}</h3>
                          <span className="text-xs px-2 py-0.5 bg-nepal-red/10 text-nepal-red rounded-full capitalize whitespace-nowrap">
                            {report.type.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            report.status === 'active' ? 'bg-green-100 text-green-700' : 
                            report.status === 'resolved' ? 'bg-blue-100 text-blue-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{report.description}</p>
                        <div className={`flex items-center gap-3 mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          <span className="flex items-center gap-1 cursor-pointer hover:text-nepal-red" 
                                onClick={(e) => { e.stopPropagation(); handleUserClick(report.userId); }}>
                            <Users className="w-3 h-3" />
                            {report.userId?.name || 'Anonymous'}
                          </span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          <span>{new Date(report.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-nepal-red" />
              <span>Made with ❤️ for Nepal</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-nepal-red" />
              <span>Safe Travels</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-nepal-blue" />
              <span>Nepal Safety Network</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{stats.activeUsers} Travelers Online</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{stats.totalReports} Reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Form Modal */}
      <AnimatePresence>
        {showReportForm && (
          <ReportForm 
            onClose={() => setShowReportForm(false)}
            location={location}
            userId={user?.id || user?._id}
            onSuccess={() => {
              setShowReportForm(false);
              fetchAllData(location?.latitude, location?.longitude);
            }}
          />
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showUserProfile && selectedUser && (
          <UserProfileModal 
            user={selectedUser}
            reports={getUserReports(selectedUser._id)}
            onClose={() => setShowUserProfile(false)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <ReportDetailModal 
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;