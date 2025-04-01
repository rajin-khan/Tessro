// client/src/components/StreamRoom.jsx
import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import Chat from './Chat';
import Participants from './Session/Participants';
import LeaveSession from './Session/Leave';

function StreamRoom({ socket, sessionId, participants, onLeave }) {
  const hostId = participants[0]?.id;
  const selfId = socket.id;
  const [showSidebar, setShowSidebar] = useState(true);
  const [messages, setMessages] = useState([]);

  // Listen for incoming chat messages
  useEffect(() => {
    if (!socket || !sessionId) return;

    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [socket, sessionId]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed || !sessionId) return;
  
    const selfUser = participants.find(p => p.id === socket.id);
    const nickname = selfUser?.nickname || 'Me';
  
    const msg = {
      id: Date.now(),
      senderId: socket.id,
      nickname,
      text: trimmed,
      timestamp: new Date().toISOString()
    };
  
    setMessages(prev => [...prev, msg]);
  
    socket.emit('chat:message', {
      sessionId,
      message: msg
    });
  };  

  return (
    <div className="w-full max-w-7xl mx-auto bg-dark-surface border border-gray-700 rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row h-[80vh]">
      
      {/* Left: Video Area */}
      <div
        className={`p-4 flex flex-col transition-all duration-200 ${
          showSidebar ? 'md:w-3/4' : 'w-full'
        } w-full`}
      >
        <div className="flex justify-between items-center mb-4">
          <LeaveSession socket={socket} onLeave={onLeave} />
          <div className="flex gap-4 items-center">
            <span className="text-xs text-gray-400 font-mono">Session ID: {sessionId}</span>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded hover:text-white hover:bg-gray-600 transition"
            >
              {showSidebar ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>
        </div>

        <VideoPlayer socket={socket} sessionId={sessionId} />
      </div>

      {/* Right: Sidebar */}
      {showSidebar && (
        <div className="md:w-1/4 w-full bg-dark-bg border-t md:border-t-0 md:border-l border-gray-700 flex flex-col justify-between p-4 space-y-4 transition-all duration-200">
          <div className="space-y-2">
            <h3 className="text-sm text-gray-400 mb-1">Participants</h3>
            <Participants
              participants={participants}
              hostId={hostId}
              selfId={selfId}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <Chat
              socket={socket}
              sessionId={sessionId}
              messages={messages}
              sendMessage={sendMessage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default StreamRoom;