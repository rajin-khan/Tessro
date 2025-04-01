import React from 'react';

function ChatMessages({ messages, selfId }) {
  return (
    <div className="flex flex-col space-y-3 max-h-64 overflow-y-auto pr-2">
      {messages.map((msg) => {
        const isSelf = msg.senderId === selfId;
        return (
          <div key={msg.timestamp} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-col space-y-1 max-w-[75%]">
              {!isSelf && (
                <span className="text-xs text-gray-400 pl-1">{msg.nickname || 'Guest'}</span>
              )}
              <div className={`rounded-xl px-4 py-2 text-sm ${
                isSelf ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-100'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatMessages;