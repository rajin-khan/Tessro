import React, { useEffect, useRef } from 'react';

const avatarColors = [
  'bg-pink-500', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400',
  'bg-indigo-500', 'bg-red-400', 'bg-purple-500'
];

function getAvatarColor(id) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return avatarColors[sum % avatarColors.length];
}

function getInitials(nickname = 'G') {
  return nickname.charAt(0).toUpperCase();
}

function ChatMessages({ messages, selfId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className="flex flex-col gap-4 overflow-y-auto px-1 py-2 h-full"
      role="log"
      aria-live="polite"
    >
      {messages.map((msg, i) => {
        const isSelf = msg.senderId === selfId;
        const avatarColor = getAvatarColor(msg.senderId);
        const key = msg.id || msg.timestamp || i;

        return (
          <div
            key={key}
            className={`flex items-end space-x-2 ${isSelf ? 'justify-end' : 'justify-start'}`}
          >
            {!isSelf && (
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor} shadow`}
                title={msg.nickname}
              >
                {getInitials(msg.nickname)}
              </div>
            )}
            <div
              className={`px-4 py-2 rounded-2xl max-w-[75%] sm:max-w-xs md:max-w-sm lg:max-w-md text-sm break-words shadow transition-transform duration-200 relative group ${
                isSelf
                  ? 'bg-brand-primary text-white rounded-br-none animate-slide-in-right'
                  : 'bg-brand-tekhelet/40 text-white rounded-bl-none animate-slide-in-left'
              }`}
            >
              {msg.text}
              {/* Optional timestamp on hover */}
              <span className="absolute bottom-[-1.1rem] right-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200">
                {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatMessages;