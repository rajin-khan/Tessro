import React, { useState } from 'react';

function SessionInfo({ socket, sessionId, sessionMode, isHost }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModeToggle = () => {
    if (!socket || !isHost) return;
    const newMode = sessionMode === 'sync' ? 'stream' : 'sync';
    socket.emit('session:set_mode', { mode: newMode });
  };

  if (!sessionId) return null;

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className={`${enabled ? 'bg-brand-accent' : 'bg-gray-600'} relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-brand-dark-purple`}
      role="switch"
      aria-checked={enabled}
    >
      <span className="sr-only">Toggle Mode</span>
      <span
        className={`${enabled ? 'translate-x-5' : 'translate-x-1'} inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-300 ease-in-out`}
      />
    </button>
  );

  const modeDisplayText = sessionMode === 'sync' ? 'Sync' : 'Stream';

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Session ID */}
      <div
        onClick={handleCopy}
        title="Click to copy Session ID"
        className="cursor-pointer text-sm px-3 py-1 rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all font-medium whitespace-nowrap"
      >
        ID: {copied ? '✅ Copied!' : sessionId}
      </div>

      {/* Mode Display */}
      <div
        className="text-sm px-3 py-1 rounded-full border border-brand-tekhelet text-brand-tekhelet font-medium whitespace-nowrap"
        title={`Current session mode is ${modeDisplayText}`}
      >
        Mode: <span className="font-semibold capitalize">{modeDisplayText}</span>
      </div>

      {/* Host Only: Toggle with inline warning */}
      {isHost && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* ⚠️ Caution note inline */}
          <span className="text-xs text-gray-400 italic">
            Stick to one mode per session
          </span>

          {/* Toggle */}
          <ToggleSwitch enabled={sessionMode === 'stream'} onChange={handleModeToggle} />
        </div>
      )}
    </div>
  );
}

export default SessionInfo;