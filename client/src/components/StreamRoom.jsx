// client/src/components/StreamRoom.jsx
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
  const [mobileView, setMobileView] = useState('chat'); // 'chat' | 'participants'

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
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

    const selfUser = participants.find((p) => p.id === socket.id);
    const nickname = selfUser?.nickname || 'Me';

    const msg = {
      id: Date.now(),
      senderId: socket.id,
      nickname,
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);

    socket.emit('chat:message', {
      sessionId,
      message: msg,
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
      {/* Left Area */}
      <div className={`p-5 transition-all duration-200 ${showSidebar ? 'md:w-3/4' : 'w-full'} w-full flex flex-col overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          {/* Leave */}
          <LeaveSession socket={socket} onLeave={onLeave} />

          <div className="flex items-center gap-3">
            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                onClick={() =>
                  setMobileView((prev) =>
                    prev === 'chat' ? 'participants' : 'chat'
                  )
                }
                className="text-xs px-3 py-1 rounded-full border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-all"
              >
                {mobileView === 'chat' ? 'View Participants' : 'View Chat'}
              </button>
            </div>

            {/* Session ID */}
            <SessionInfo sessionId={sessionId} />

            {/* Show/Hide Chat Toggle (for desktop) */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="hidden md:block text-sm px-3 py-1 rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all"
            >
              {showSidebar ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>
        </div>

        {/* 🎥 Video */}
        <VideoPlayer socket={socket} sessionId={sessionId} />
      </div>

      {/* Right Sidebar — Desktop */}
      {showSidebar && (
        <div className="hidden md:flex md:w-1/4 w-full bg-brand-dark-purple border-l border-brand-primary/20 flex-col p-4 overflow-y-auto">
          <Participants participants={participants} hostId={hostId} selfId={selfId} />
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

      {/* Right Drawer — Mobile */}
      <div className="md:hidden w-full px-4 pb-4 pt-2 flex-1 overflow-y-auto">
        {mobileView === 'participants' ? (
          <Participants participants={participants} hostId={hostId} selfId={selfId} />
        ) : (
          <div className="mt-2">
            <Chat
              socket={socket}
              sessionId={sessionId}
              messages={messages}
              sendMessage={sendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default StreamRoom;