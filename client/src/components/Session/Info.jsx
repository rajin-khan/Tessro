import React, { useState } from 'react';

function SessionInfo({ sessionId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2s
    } catch (err) {
      console.error('Failed to copy session ID:', err);
    }
  };

  return (
    <div className="w-full mb-4">
      <div className="bg-dark-surface border border-gray-700 rounded-lg p-4 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-sm text-gray-400">Session ID:</span>
          <span className="font-mono text-brand-yellow text-sm break-all">{sessionId}</span>
        </div>

        <button
          onClick={handleCopy}
          aria-label="Copy Session ID"
          className="px-3 py-1 rounded-md text-sm text-white bg-violet-600 hover:bg-violet-700 transition w-fit"
        >
          {copied ? '✅ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default SessionInfo;