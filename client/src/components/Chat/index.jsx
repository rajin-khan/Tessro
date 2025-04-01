import React from 'react';
import ChatInput from './Input.jsx';
import ChatMessages from './Messages.jsx';
import { useChat } from '../../hooks/useChat';

function Chat({ socket, sessionId }) {
  const { messages, sendMessage } = useChat(socket, sessionId);

  return (
    <div className="w-full bg-dark-surface border border-gray-700 rounded-lg p-4 mt-6">
      <h3 className="text-gray-300 text-sm mb-2">Chat</h3>
      <ChatMessages messages={messages} selfId={socket.id} />
      <div className="mt-4">
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}

export default Chat;