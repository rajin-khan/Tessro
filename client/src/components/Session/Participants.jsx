import React, { useState, useEffect } from 'react';
import { FaUsers, FaShareAlt, FaCheckCircle } from 'react-icons/fa';

function Participants({ participants = [], hostId, selfId, sessionId, sessionPassword }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyInvite = () => {
    if (!sessionId || !sessionPassword) return;

    const inviteMessage = `
🥳 Join the watch party on Tessro!
✨ Link: https://tessro.com
🔭 Session ID: ${sessionId}
🧧 Password: ${sessionPassword}
    `.trim();

    navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
  };

  return (
    <div className="bg-brand-rich-black/40 backdrop-blur-md border border-brand-tekhelet/30 rounded-2xl p-4 w-full shadow-inner font-barlow relative">
      {/* --- Beautiful Toast Notification --- */}
      <div className={`absolute top-4 right-4 bg-green-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center shadow-lg transition-all duration-300 ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <FaCheckCircle className="mr-2" />
        <span>Invite Info Copied!</span> {/* 👈 UPDATED MESSAGE */}
      </div>
      
      {/* --- Header with Invite Button --- */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide flex items-center">
          <FaUsers className="mr-2" />
          <span>Participants</span>
        </h3>
        <button
          onClick={handleCopyInvite}
          title="Copy Invite Info"
          // 👇 BIGGER, and with cursor-pointer to override text selection cursor
          className="flex items-center gap-2 text-sm px-4 py-1.5 rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all font-medium cursor-pointer"
        >
          <FaShareAlt />
          <span>Invite</span> {/* 👈 WRAPPED IN SPAN TO FIX CURSOR */}
        </button>
      </div>

      {/* --- Participant List (no changes needed) --- */}
      <ul className="flex flex-col gap-3 text-sm">
        {participants.map((user) => {
          const isSelf = user.id === selfId;
          const isHost = user.id === hostId;
          const fallbackName = user.nickname || `Guest${user.id.slice(-4)}`;

          return (
            <li key={user.id} className="flex items-center justify-between text-white animate-fade-in flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${user.id}`}
                  alt={fallbackName}
                  className="w-8 h-8 rounded-full shadow"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{fallbackName}</span>
                  {isHost && (
                    <span className="text-[10px] text-yellow-400 font-semibold">Host 👑</span>
                  )}
                </div>
              </div>
              {isSelf && (
                <span className="text-[10px] text-gray-400 italic">(You)</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Participants;