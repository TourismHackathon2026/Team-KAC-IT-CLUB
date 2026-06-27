import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, Flag, AlertTriangle, Shield, Users
} from 'lucide-react';

const UserProfileModal = ({ user, reports, onClose, darkMode }) => {
  const reportCount = reports?.length || 0;
  const activeReports = reports?.filter(r => r.status === 'active').length || 0;
  const resolvedReports = reports?.filter(r => r.status === 'resolved').length || 0;

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

  if (!user) return null;

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
        className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nepal-red to-nepal-crimson flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name || 'Unknown User'}</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-2`}>
                <span className="flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Nepal
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> Traveler
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Stats */}
        <div className={`p-6 grid grid-cols-3 gap-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="text-center">
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{reportCount}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Reports</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold text-green-600`}>{activeReports}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold text-blue-600`}>{resolvedReports}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Resolved</p>
          </div>
        </div>

        {/* Reports List */}
        <div className="p-6">
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <AlertTriangle className="w-4 h-4 text-nepal-red" />
            Reports by {user.name || 'User'}
          </h3>
          
          {!reports || reports.length === 0 ? (
            <div className="text-center py-8">
              <Shield className={`w-12 h-12 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-3`} />
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No reports yet</p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>This traveler hasn't reported anything</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {reports.map((report) => (
                <div key={report._id} className={`p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getReportIcon(report.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${report.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {report.status || 'Active'}
                        </span>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>{report.description}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'} at {report.createdAt ? new Date(report.createdAt).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfileModal;