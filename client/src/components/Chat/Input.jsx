import React, { useState } from 'react';

function ChatInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSend(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        className="flex-1 px-3 py-2 rounded bg-dark-surface border border-gray-600 text-white"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="px-4 py-2 bg-violet-600 rounded text-white">
        Send
      </button>
    </form>
  );
}

export default ChatInput;