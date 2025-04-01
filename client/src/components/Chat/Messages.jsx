import React from 'react';

function ChatMessages({ messages, selfId }) {
  return (
    <div className="flex flex-col space-y-2 max-h-64 overflow-y-auto pr-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.sender === selfId ? 'justify-end' : 'justify-start'
          }`}
        >
          <div className={`rounded-xl px-4 py-2 text-sm max-w-[75%] ${
            msg.sender === selfId
              ? 'bg-violet-600 text-white'
              : 'bg-gray-700 text-gray-100'
          }`}>
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatMessages;