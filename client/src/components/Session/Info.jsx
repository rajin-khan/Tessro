import React, { useState } from 'react';

function SessionInfo({ sessionId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!sessionId) return null;

  return (
    <div
      onClick={handleCopy}
      title="Click to copy"
      className="cursor-pointer text-sm px-3 py-1 rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all font-medium whitespace-nowrap"
    >
      Session ID: {copied ? '✅ Copied!' : sessionId}
    </div>
  );
}

export default SessionInfo;