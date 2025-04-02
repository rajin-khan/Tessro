import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png'; // ✅ Logo path
import StreamRoom from './components/StreamRoom.jsx';
import Landing from './components/Landing.jsx';
import { useSocket } from './hooks/useSocket';

function App() {
  const { socket, isConnected } = useSocket();
  const [sessionId, setSessionId] = useState(null);
  const [appError, setAppError] = useState(null);
  const [mode, setMode] = useState('create');
  const [participants, setParticipants] = useState([]);

  const resetSessionState = () => {
    setSessionId(null);
    setParticipants([]);
    setAppError(null);
  };

  useEffect(() => {
    if (!socket) return;

    const handleSessionCreated = ({ sessionId: newSessionId, error }) => {
      if (error) {
        setAppError(`Session creation failed: ${error}`);
        setSessionId(null);
      } else {
        setSessionId(newSessionId);
        setAppError(null);
      }
    };

    const handleSessionJoined = ({ sessionId: joinedSessionId }) => {
      setSessionId(joinedSessionId);
      setAppError(null);
    };

    const handleSessionError = ({ error }) => {
      setAppError(error || "Something went wrong while joining the session.");
    };

    const handleHostDisconnected = ({ message }) => {
      setAppError(message || "The session host disconnected.");
      resetSessionState();
    };

    const handleParticipantUpdate = ({ participants }) => {
      setParticipants(participants);
    };

    socket.on('session:created', handleSessionCreated);
    socket.on('session:joined', handleSessionJoined);
    socket.on('session:error', handleSessionError);
    socket.on('session:host_disconnected', handleHostDisconnected);
    socket.on('session:participants', handleParticipantUpdate);

    return () => {
      socket.off('session:created', handleSessionCreated);
      socket.off('session:joined', handleSessionJoined);
      socket.off('session:error', handleSessionError);
      socket.off('session:host_disconnected', handleHostDisconnected);
      socket.off('session:participants', handleParticipantUpdate);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-brand-bg text-white font-barlow flex flex-col items-center justify-center px-4">
      <header className="text-center mb-6">
        <img src={logo} alt="Tessro Logo" className="h-32 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Real-time. Real fast.</p>
        <p className="text-xs text-gray-500 mt-1">
          Status:{' '}
          {isConnected ? (
            <span className="text-green-400">Connected</span>
          ) : (
            <span className="text-red-400">Disconnected</span>
          )}
          {isConnected && socket && ` (ID: ${socket.id})`}
        </p>
      </header>

      <main className="w-full">
        {appError && (
          <div className="bg-red-800 border border-red-600 text-white p-3 rounded mb-4 text-center text-sm max-w-xl mx-auto">
            {appError}
          </div>
        )}

        {!sessionId ? (
          <Landing
            mode={mode}
            setMode={setMode}
            socket={socket}
            isConnected={isConnected}
          />
        ) : (
          <StreamRoom
            socket={socket}
            sessionId={sessionId}
            participants={participants}
            onLeave={resetSessionState}
          />
        )}
      </main>

      <footer className="mt-10 text-center text-gray-600 text-xs">
        Developed by Rajin Khan
        (visit rajinkhan.com)
      </footer>
    </div>
  );
}

export default App;