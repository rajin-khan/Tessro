import React, { useEffect, useRef } from 'react';

function ChatMessages({ messages, selfId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-1 py-2 h-full">
      {messages.map((msg, i) => {
        const isSelf = msg.senderId === selfId;
        const nickname = msg.nickname || 'Guest';

        return (
          <div
            key={msg.timestamp || i}
            className={`flex items-end space-x-2 ${isSelf ? 'justify-end' : 'justify-start'}`}
          >
            {!isSelf && (
              <img
                src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${msg.senderId}`}
                alt={nickname}
                className="w-8 h-8 rounded-full shadow"
                title={nickname}
              />
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