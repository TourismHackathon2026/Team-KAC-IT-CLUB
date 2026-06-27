import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, MapPin, Calendar, Clock, Flag, 
  AlertTriangle, User, ThumbsUp, Share2
} from 'lucide-react';

const ReportDetailModal = ({ report, onClose, darkMode }) => {
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

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-600' : status === 'resolved' ? 'text-blue-600' : 'text-gray-600';
  };

  if (!report) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`rounded-2xl max-w-lg w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getReportIcon(report.type)}</span>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.title}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.description}</p>
          </div>

          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} space-y-2`}>
            <div className="flex items-center justify-between text-sm">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                {report.type?.replace('_', ' ') || 'Other'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</span>
              <span className={`font-medium ${getStatusColor(report.status)} capitalize`}>
                {report.status || 'Active'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Reported by</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-1`}>
                <User className="w-3 h-3" />
                {report.userId?.name || 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-1`}>
                <MapPin className="w-3 h-3" />
                {report.locationName || 'Nepal'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Reported</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-1`}>
                <Calendar className="w-3 h-3" />
                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Time</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-1`}>
                <Clock className="w-3 h-3" />
                {report.createdAt ? new Date(report.createdAt).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className={`flex items-center justify-center gap-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <button className={`flex items-center gap-1 px-4 py-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">Helpful</span>
            </button>
            <button className={`flex items-center gap-1 px-4 py-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReportDetailModal;