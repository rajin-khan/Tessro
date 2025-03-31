// client/src/components/Session/Info.jsx
import React, { useState } from 'react';

function SessionInfo({ sessionId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionId)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-200 mb-2">Session Active</h2>
      <p className="text-gray-400 mb-4">Share this ID with your friends:</p>
      <div className="bg-gray-800 p-3 rounded flex items-center justify-between">
        <span className="font-mono text-lg text-brand-yellow break-all">{sessionId}</span>
        <button
          onClick={handleCopy}
          className="ml-4 px-3 py-1 bg-brand-violet text-white text-sm rounded hover:bg-violet-700 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
       {/* Add leave session button later */}
    </div>
  );
}

export default SessionInfo;