import React, { useState } from 'react';
import { useVoiceMesh } from './useVoiceMesh';

function VoiceChat({ socket, sessionId, selfId }) {
  const [peerMuteStates, setPeerMuteStates] = useState({});
  const {
    isMuted,
    connected,
    toggleMute,
  } = useVoiceMesh(socket, sessionId, selfId, setPeerMuteStates);

  const [joined, setJoined] = useState(false);

  const handleJoin = () => setJoined(true);
  const handleLeave = () => setJoined(false);

  return (
    <div className="mt-6 space-y-2 text-sm text-white">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
        Voice Channel
      </h3>

      {!joined ? (
        <button
          onClick={handleJoin}
          className="w-full py-2 px-3 rounded-xl bg-brand-primary text-white hover:bg-brand-tekhelet transition"
        >
          Connect Voice Channel 🎙️
        </button>
      ) : (
        <>
          <button
            onClick={handleLeave}
            className="w-full py-2 px-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
          >
            Disconnect 🔌
          </button>
          <button
            onClick={toggleMute}
            className="w-full py-2 px-3 rounded-xl bg-brand-accent text-white hover:bg-brand-tekhelet transition"
          >
            {isMuted ? 'Unmute 🔊' : 'Mute 🔇'}
          </button>
        </>
      )}

      {/* 🔇 Show mute status of others */}
      {joined && Object.keys(peerMuteStates).length > 0 && (
        <div className="mt-2 text-xs text-gray-400">
          <p className="mb-1">Others:</p>
          <ul className="space-y-1 pl-2 list-disc">
            {Object.entries(peerMuteStates).map(([id, muted]) => (
              <li key={id} className={muted ? 'text-yellow-400' : 'text-green-400'}>
                {muted ? `User ${id.slice(-4)} is muted` : `User ${id.slice(-4)} is speaking`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default VoiceChat;