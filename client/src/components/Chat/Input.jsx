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
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-2 items-center w-full font-barlow"
    >
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 min-w-0 px-4 py-2 bg-brand-rich-black/60 text-sm text-white placeholder-gray-400 border border-brand-tekhelet/30 rounded-xl
          focus:outline-none focus:bg-brand-rich-black/50 focus:shadow-inner transition duration-200"
      />
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium rounded-xl bg-brand-primary hover:bg-brand-tekhelet transition text-white disabled:opacity-40"
        disabled={!text.trim()}
      >
        Send
      </button>
    </form>
  );
}

export default ChatInput;