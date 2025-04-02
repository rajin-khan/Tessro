import React from 'react';

function Participants({ participants = [], hostId, selfId }) {
  return (
    <div className="bg-brand-rich-black/40 backdrop-blur-md border border-brand-tekhelet/30 rounded-2xl p-4 w-full shadow-inner font-barlow">
      <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3">
        Participants
      </h3>
      <ul className="flex flex-col gap-3 text-sm">
        {participants.map((user) => {
          const isSelf = user.id === selfId;
          const isHost = user.id === hostId;
          const fallbackName = user.nickname || `Guest${user.id.slice(-4)}`;

          return (
            <li
              key={user.id}
              className="flex items-center justify-between text-white animate-fade-in flex-wrap gap-2"
            >
              <div className="flex items-center gap-3">
                {/* 👤 Avatar */}
                <img
                  src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${user.id}`}
                  alt={fallbackName}
                  className="w-8 h-8 rounded-full shadow"
                />

                <div className="flex flex-col">
                  <span className="text-sm font-medium">{fallbackName}</span>
                  {isHost && (
                    <span
                      title="You are the host"
                      className="text-[10px] text-yellow-400 font-semibold"
                    >
                      Host 👑
                    </span>
                  )}
                </div>
              </div>

              {isSelf && (
                <span
                  title="This is you"
                  className="text-[10px] text-gray-400 italic"
                >
                  (You)
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Participants;