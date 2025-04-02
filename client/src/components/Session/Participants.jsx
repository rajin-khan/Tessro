// client/src/components/Session/Participants.jsx
import React from 'react';

function getInitials(nickname = 'G') {
  return nickname.charAt(0).toUpperCase();
}

function getAvatarColor(id) {
  const colors = [
    'bg-pink-500', 'bg-yellow-400', 'bg-green-400',
    'bg-blue-400', 'bg-indigo-500', 'bg-red-400', 'bg-purple-500'
  ];
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return colors[sum % colors.length];
}

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
          const avatarColor = getAvatarColor(user.id);

          return (
            <li
              key={user.id}
              className="flex items-center justify-between text-white"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold text-white shadow ${avatarColor}`}
                  title={user.nickname}
                >
                  {getInitials(user.nickname)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user.nickname || 'Guest'}
                  </span>
                  {isHost && (
                    <span className="text-[10px] text-yellow-400 font-semibold">
                      Host 👑
                    </span>
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