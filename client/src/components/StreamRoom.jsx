import React, { useState, useEffect, useMemo } from 'react';
import VideoPlayer from './VideoPlayer';
import Chat from './Chat';
import Participants from './Session/Participants';
import SessionInfo from './Session/Info';
import ConfirmLeaveModal from './Session/ConfirmLeaveModal';

// Accept `sessionPassword` prop
function StreamRoom({ socket, sessionId, sessionPassword, initialParticipants, onLeave }) {
  const [participants, setParticipants] = useState(initialParticipants || []);
  const [sessionMode, setSessionMode] = useState('sync');
  const [showSidebar, setShowSidebar] = useState(true);
  const [messages, setMessages] = useState([]);
  const [mobileView, setMobileView] = useState('chat');
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const selfId = socket?.id;
  const hostId = useMemo(() => participants[0]?.id, [participants]);
  const isHost = useMemo(() => selfId === hostId, [selfId, hostId]);

  useEffect(() => {
    if (!socket) return;
    const handleParticipantsUpdate = ({ participants: updatedParticipants, mode: updatedMode }) => {
      setParticipants(updatedParticipants || []);
      setSessionMode(updatedMode || 'sync');
    };
    socket.on('session:participants', handleParticipantsUpdate);
    if (socket && sessionId) socket.emit('session:request_participants');
    return () => {
      socket.off('session:participants', handleParticipantsUpdate);
    };
  }, [socket, sessionId]);

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('chat:message', handleMessage);
    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    const handleUnload = () => {
      if (socket?.connected) {
        socket.emit('session:leave');
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [socket]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed || !socket || !sessionId) return;
    const selfUser = participants.find((p) => p.id === selfId);
    const nickname = selfUser?.nickname || 'Me';
    const msg = {
      id: `${selfId}-${Date.now()}`, senderId: selfId, nickname, text: trimmed, timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    socket.emit('chat:message', { sessionId, message: msg });
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    if (socket) {
      socket.emit('session:leave');
    }
    onLeave();
  };

  if (!socket || !sessionId || !selfId) {
    return <div className="text-white p-10">Connecting to session...</div>;
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto bg-brand-rich-black border border-brand-tekhelet/30 rounded-3xl shadow-[0_0_40px_#482A82aa] overflow-hidden flex flex-col md:flex-row h-[85vh] font-barlow">
        <div className={`p-5 transition-all duration-200 ${showSidebar ? 'md:w-3/4' : 'w-full'} w-full flex flex-col overflow-y-auto`}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="text-sm px-3 py-1 rounded-full border border-red-400 text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
              Leave Session
            </button>
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <button
                  onClick={() => setMobileView((prev) => (prev === 'chat' ? 'participants' : 'chat'))}
                  className="text-xs px-3 py-1 rounded-full border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-all"
                >
                  {mobileView === 'chat' ? 'View Participants' : 'View Chat'}
                </button>
              </div>
              <SessionInfo
                socket={socket}
                sessionMode={sessionMode}
                isHost={isHost}
              />
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="hidden md:block text-sm px-3 py-1 rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all"
              >
                {showSidebar ? 'Hide Chat' : 'Show Chat'}
              </button>
            </div>
          </div>
          <VideoPlayer
            socket={socket}
            sessionId={sessionId}
            sessionMode={sessionMode}
            isHost={isHost}
            participants={participants}
            selfId={selfId}
          />
        </div>
        {showSidebar && (
          <div className="hidden md:flex md:w-1/4 w-full bg-brand-dark-purple border-l border-brand-primary/20 flex-col p-4 overflow-y-auto">
            <Participants
              participants={participants}
              hostId={hostId}
              selfId={selfId}
              sessionId={sessionId}
              sessionPassword={sessionPassword}
            />
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
        <div className="md:hidden w-full px-4 pb-4 pt-2 flex-1 overflow-y-auto">
          {mobileView === 'participants' ? (
            <Participants
              participants={participants}
              hostId={hostId}
              selfId={selfId}
              sessionId={sessionId}
              sessionPassword={sessionPassword}
            />
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
      <ConfirmLeaveModal
        isOpen={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={handleConfirmLeave}
      />
    </>
  );
}

export default StreamRoom;