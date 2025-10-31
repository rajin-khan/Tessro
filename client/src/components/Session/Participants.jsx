import React, { useState, useEffect } from 'react';
import { FaUsers, FaShareAlt, FaCheckCircle, FaLink } from 'react-icons/fa';

function Participants({ participants = [], hostId, selfId, sessionId, sessionPassword }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (linkCopied) {
      const timer = setTimeout(() => setLinkCopied(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [linkCopied]);

  const handleCopyInvite = () => {
    if (!sessionId || !sessionPassword) return;

    const shareableLink = `${window.location.origin}${window.location.pathname}?join=${encodeURIComponent(sessionId)}&pass=${encodeURIComponent(sessionPassword)}`;

    const inviteMessage = `
🥳 Join the watch party on Tessro!
✨ Auto-join link: ${shareableLink}
🔭 Session ID: ${sessionId}
🧧 Password: ${sessionPassword}

💡 Tip: Click the auto-join link above to join automatically. If the link is acting up, enter the ID and Password in Join mode.
    `.trim();

    navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
  };

  const handleCopyShareableLink = () => {
    if (!sessionId || !sessionPassword) return;

    const shareableLink = `${window.location.origin}${window.location.pathname}?join=${encodeURIComponent(sessionId)}&pass=${encodeURIComponent(sessionPassword)}`;
    navigator.clipboard.writeText(shareableLink);
    setLinkCopied(true);
  };

  return (
    <div className="bg-brand-rich-black/40 backdrop-blur-md border border-brand-tekhelet/30 rounded-2xl p-4 w-full shadow-inner font-barlow relative">
      {/* --- Beautiful Toast Notifications --- */}
      <div className={`absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl transition-all duration-300 z-10 ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <FaCheckCircle className="text-white" />
        <span>Invite Info Copied!</span>
      </div>
      <div className={`absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl transition-all duration-300 z-10 ${linkCopied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <FaCheckCircle className="text-white" />
        <span>Shareable Link Copied!</span>
      </div>
      
      {/* --- Header with Invite Buttons --- */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide flex items-center">
          <FaUsers className="mr-2" />
          <span>Participants</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyShareableLink}
            title="Copy Shareable Link"
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-brand-tekhelet text-brand-tekhelet hover:bg-brand-tekhelet hover:text-white transition-all font-medium cursor-pointer"
          >
            <FaLink />
            <span>Copy Link</span>
          </button>
          <button
            onClick={handleCopyInvite}
            title="Copy Invite Info"
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all font-medium cursor-pointer"
          >
            <FaShareAlt />
            <span>Invite</span>
          </button>
        </div>
      </div>

      {/* --- Participant List --- */}
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