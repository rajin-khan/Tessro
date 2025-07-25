import React from 'react';

// Simplified to only handle mode display and toggle
function SessionInfo({ socket, sessionMode, isHost }) {

  const handleModeToggle = () => {
    if (!socket || !isHost) return;
    const newMode = sessionMode === 'sync' ? 'stream' : 'sync';
    socket.emit('session:set_mode', { mode: newMode });
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className={`${enabled ? 'bg-brand-accent' : 'bg-gray-600'} relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none`}
      role="switch"
      aria-checked={enabled}
    >
      <span className="sr-only">Toggle Mode</span>
      <span
        className={`${enabled ? 'translate-x-5' : 'translate-x-1'} inline-block w-3 h-3 transform bg-white rounded-full transition-transform`}
      />
    </button>
  );

  const modeDisplayText = sessionMode === 'sync' ? 'Sync' : 'Stream';

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Mode Display */}
      <div
        className="text-sm px-3 py-1 rounded-full border border-brand-tekhelet text-brand-tekhelet font-medium whitespace-nowrap"
        title={`Current session mode is ${modeDisplayText}`}
      >
        Mode: <span className="font-semibold capitalize">{modeDisplayText}</span>
      </div>

      {/* Host Only: Toggle */}
      {isHost && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 italic">Toggle:</span>
          <ToggleSwitch enabled={sessionMode === 'stream'} onChange={handleModeToggle} />
        </div>
      )}
    </div>
  );
}

export default SessionInfo;