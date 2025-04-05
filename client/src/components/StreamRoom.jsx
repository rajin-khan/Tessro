// client/src/StreamRoom.jsx
import React, { useState, useEffect, useMemo } from 'react';
import VideoPlayer from './VideoPlayer';
import Chat from './Chat';
import Participants from './Session/Participants';
import SessionInfo from './Session/Info';
import ConfirmLeaveModal from './Session/ConfirmLeaveModal';

// --- Updated Props ---
// We now expect initialMode to be passed down if available from the join/create response
function StreamRoom({ socket, sessionId, initialParticipants, initialMode = 'sync', onLeave }) {
  // --- State Management ---
  const [participants, setParticipants] = useState(initialParticipants || []);
  const [sessionMode, setSessionMode] = useState(initialMode); // State for the session mode
  const [showSidebar, setShowSidebar] = useState(true);
  const [messages, setMessages] = useState([]);
  const [mobileView, setMobileView] = useState('chat');
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // --- Derived State ---
  const selfId = socket?.id; // Use optional chaining in case socket is briefly null
  // Calculate hostId and isHost based on the current participants state
  const hostId = useMemo(() => participants[0]?.id, [participants]);
  const isHost = useMemo(() => selfId === hostId, [selfId, hostId]);

  // --- Effects ---

  // Listener for participant updates and mode changes
  useEffect(() => {
    if (!socket) return;

    const handleParticipantsUpdate = ({ participants: updatedParticipants, mode: updatedMode }) => {
      console.log('Received participants update:', updatedParticipants, 'Mode:', updatedMode);
      setParticipants(updatedParticipants || []);
      setSessionMode(updatedMode || 'sync'); // Update mode based on server event
    };

    const handleUserJoined = ({ userId, nickname }) => {
      console.log('User joined:', nickname, userId);
      // Note: We primarily rely on 'session:participants' for the complete list,
      // but could update incrementally here if needed for immediate feedback.
      // setParticipants(prev => [...prev, { id: userId, nickname }]); // Example incremental update
    };

    const handleUserLeft = ({ userId }) => {
       console.log('User left:', userId);
       // Note: Relying on 'session:participants' ensures consistency, especially if host leaves.
       // setParticipants(prev => prev.filter(p => p.id !== userId)); // Example incremental update
    };

    socket.on('session:participants', handleParticipantsUpdate);
    if (socket && sessionId) {
        socket.emit('session:request_participants');
      }

    socket.on('user:joined', handleUserJoined); // Good for toast notifications, etc.
    socket.on('user:left', handleUserLeft);   // Good for toast notifications, etc.

    return () => {
      socket.off('session:participants', handleParticipantsUpdate);
      socket.off('user:joined', handleUserJoined);
      socket.off('user:left', handleUserLeft);
    };
    // Rerun if socket instance changes (though it shouldn't typically)
  }, [socket]);

  // Listener for chat messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('chat:message', handleMessage);

    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [socket]); // Only depends on socket

  // Graceful disconnect on browser/tab close
  useEffect(() => {
    const handleUnload = () => {
      // No need to check sessionId here, server handles finding the session via socket.id
      if (socket?.connected) { // Only emit if still connected
        socket.emit('session:leave');
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [socket]); // Only depends on socket

  // --- Functions ---

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed || !socket || !sessionId) return;

    const selfUser = participants.find((p) => p.id === selfId);
    const nickname = selfUser?.nickname || 'Me'; // Fallback nickname

    const msg = {
      id: `${selfId}-${Date.now()}`, // More unique ID
      senderId: selfId,
      nickname,
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, msg]);

    // Emit to server
    socket.emit('chat:message', {
      sessionId, // Server already knows session via socket map, but good practice? Maybe remove later.
      message: msg,
    });
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    if (socket) {
      socket.emit('session:leave');
    }
    onLeave(); // Trigger the callback provided by the parent component
  };

  // Render nothing or a loading state if essential info is missing
  if (!socket || !sessionId || !selfId) {
      // Or return a dedicated loading component
      return <div className="text-white p-10">Connecting to session...</div>;
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto bg-brand-rich-black border border-brand-tekhelet/30 rounded-3xl shadow-[0_0_40px_#482A82aa] overflow-hidden flex flex-col md:flex-row h-[85vh] font-barlow">
        {/* Left Area */}
        <div className={`p-5 transition-all duration-200 ${showSidebar ? 'md:w-3/4' : 'w-full'} w-full flex flex-col overflow-y-auto`}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="text-sm px-3 py-1 rounded-full border border-red-400 text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
              Leave Session
            </button>

            <div className="flex items-center gap-3">
              {/* Mobile Toggle */}
              <div className="md:hidden">
                <button
                  onClick={() =>
                    setMobileView((prev) => (prev === 'chat' ? 'participants' : 'chat'))
                  }
                  className="text-xs px-3 py-1 rounded-full border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-all"
                >
                  {mobileView === 'chat' ? 'View Participants' : 'View Chat'}
                </button>
              </div>

              {/* --- MODIFIED: Pass socket, mode, isHost to SessionInfo --- */}
              <SessionInfo
                socket={socket}
                sessionId={sessionId}
                sessionMode={sessionMode}
                isHost={isHost}
              />

              {/* Toggle Chat Desktop */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="hidden md:block text-sm px-3 py-1 rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all"
              >
                {showSidebar ? 'Hide Chat' : 'Show Chat'}
              </button>
            </div>
          </div>

          {/* --- MODIFIED: Pass mode and isHost to VideoPlayer --- */}
          <VideoPlayer
            socket={socket}
            sessionId={sessionId}
            sessionMode={sessionMode}
            isHost={isHost}
            participants={participants} // Pass participants for WebRTC hook later
            selfId={selfId} // Pass selfId for WebRTC hook later
          />
        </div>

        {/* Right Sidebar — Desktop */}
        {showSidebar && (
          <div className="hidden md:flex md:w-1/4 w-full bg-brand-dark-purple border-l border-brand-primary/20 flex-col p-4 overflow-y-auto">
            <Participants participants={participants} hostId={hostId} selfId={selfId} />
            <div className="flex-1 overflow-y-auto mt-4">
              <Chat
                socket={socket} // Keep passing socket if Chat needs direct emission
                sessionId={sessionId}
                messages={messages}
                sendMessage={sendMessage} // Pass down the sendMessage function
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

      {/* Confirmation Modal */}
      <ConfirmLeaveModal
        isOpen={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={handleConfirmLeave} // Use the handler function
      />
    </>
  );
}

export default StreamRoom;