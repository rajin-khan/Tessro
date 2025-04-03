import React from 'react';
import ChatInput from './Input.jsx';
import ChatMessages from './Messages.jsx';

function Chat({ socket, sessionId, messages, sendMessage }) {
  return (
    <div className="flex flex-col h-full px-1 sm:px-2">
      <h3 className="text-gray-300 text-sm mb-2">CHAT</h3>
      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} selfId={socket.id} />
      </div>
      <div className="mt-2">
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}

export default Chat;