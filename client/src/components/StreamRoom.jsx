import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import Chat from './Chat';
import Participants from './Session/Participants';
import LeaveSession from './Session/Leave';
import SessionInfo from './Session/Info';

function StreamRoom({ socket, sessionId, participants, onLeave }) {
  const hostId = participants[0]?.id;
  const selfId = socket.id;
  const [showSidebar, setShowSidebar] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    if (socket && sessionId) {
      socket.on('chat:message', handleMessage);
    }

    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [socket, sessionId]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

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

  // 💡 Handle tab/browser close
  useEffect(() => {
    const handleUnload = () => {
      if (socket && sessionId) {
        socket.emit('session:leave');
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [socket, sessionId]);

  return (
    <div className="w-full max-w-7xl mx-auto bg-brand-rich-black border border-brand-tekhelet/30 rounded-3xl shadow-[0_0_40px_#482A82aa] overflow-hidden flex flex-col md:flex-row h-[85vh] font-barlow">
      {/* Left Side */}
      <div className={`p-5 transition-all duration-200 ${showSidebar ? 'md:w-3/4' : 'w-full'} w-full flex flex-col`}>
        <div className="flex justify-between items-center mb-4">
          {/* Left: Leave Button */}
          <LeaveSession socket={socket} onLeave={onLeave} />

          {/* Right: Session ID + Chat Toggle */}
          <div className="flex items-center gap-4">
            <SessionInfo sessionId={sessionId} />
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-sm px-3 py-1 rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all"
            >
              {showSidebar ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>
        </div>

        {/* 🎥 Video */}
        <VideoPlayer socket={socket} sessionId={sessionId} />
      </div>

      {/* Right Sidebar */}
      {showSidebar && (
        <div className="md:w-1/4 w-full bg-brand-dark-purple border-t md:border-t-0 md:border-l border-brand-primary/20 flex flex-col p-4 transition-all duration-200">
          <div className="space-y-2">
            <h3 className="text-sm text-gray-300 uppercase tracking-wider font-semibold"></h3>
            <Participants participants={participants} hostId={hostId} selfId={selfId} />
          </div>
          <div className="flex-1 overflow-y-auto mt-4">
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