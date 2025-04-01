// client/src/components/Chat/index.jsx
import React from 'react';
import ChatInput from './Input.jsx';
import ChatMessages from './Messages.jsx';

function Chat({ socket, sessionId, messages, sendMessage }) {
  return (
    <div className="w-full">
      <h3 className="text-gray-300 text-sm mb-2">Chat</h3>
      <ChatMessages messages={messages} selfId={socket.id} />
      <div className="mt-4">
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}

export default Chat;