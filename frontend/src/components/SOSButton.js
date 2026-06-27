import React from 'react';

const SOSButton = ({ onSOS, loading }) => {
  return (
    <button
      onClick={onSOS}
      disabled={loading}
      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center animate-pulse disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="mr-2">🚨</span> 
      {loading ? 'Sending...' : 'SOS Alert'}
    </button>
  );
};

export default SOSButton;