import React from 'react';

function SessionInfo({ sessionId }) {
  return (
    <div className="w-full mb-4">
      <div className="bg-dark-surface border border-gray-700 rounded-lg px-4 py-3 shadow-sm">
        <p className="text-sm text-gray-400 mb-1">Session ID:</p>
        <p className="font-mono text-brand-yellow text-sm break-all">{sessionId}</p>
      </div>
    </div>
  );
}

export default SessionInfo;