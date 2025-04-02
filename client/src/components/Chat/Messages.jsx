// client/src/components/Chat/Messages.jsx
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
    <div className="flex flex-col gap-4 overflow-y-auto px-1 py-2 h-full">
      {messages.map((msg, i) => {
        const isSelf = msg.senderId === selfId;
        const avatarColor = getAvatarColor(msg.senderId);
        return (
          <div
            key={msg.timestamp || i}
            className={`flex items-end space-x-2 ${
              isSelf ? 'justify-end' : 'justify-start'
            }`}
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
              className={`px-4 py-2 rounded-2xl max-w-xs text-sm break-words shadow transition-transform duration-200 ${
                isSelf
                  ? 'bg-brand-primary text-white rounded-br-none animate-slide-in-right'
                  : 'bg-brand-tekhelet/40 text-white rounded-bl-none animate-slide-in-left'
              }`}
            >
              {msg.text}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatMessages;