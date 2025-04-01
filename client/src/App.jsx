import React, { useState, useEffect } from 'react';
import CreateSession from './components/Session/Create';
import JoinSession from './components/Session/Join';
import StreamRoom from './components/StreamRoom.jsx';
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

    const handleSessionCreated = ({ sessionId: newSessionId, error: creationError }) => {
      if (creationError) {
        setAppError(`Session creation failed: ${creationError}`);
        setSessionId(null);
      } else if (newSessionId) {
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
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 text-gray-200">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-brand-violet">Tessro</h1>
        <p className="text-lg text-gray-400">Real-time. Real fast.</p>
        <p className="text-sm text-gray-500 mt-2">
          Server Status: {isConnected ? <span className="text-green-400">Connected</span> : <span className="text-red-400">Disconnected</span>}
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
          <div className="w-full max-w-md bg-dark-surface p-6 rounded-lg shadow-lg mx-auto">
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => setMode('create')}
                className={`px-4 py-2 rounded bg-violet-600 ${mode === 'create' ? 'opacity-100' : 'opacity-60'}`}
              >
                Create
              </button>
              <button
                onClick={() => setMode('join')}
                className={`px-4 py-2 rounded bg-yellow-500 ${mode === 'join' ? 'opacity-100' : 'opacity-60'}`}
              >
                Join
              </button>
            </div>

            {mode === 'create' ? (
              <CreateSession socket={socket} isConnected={isConnected} />
            ) : (
              <JoinSession socket={socket} isConnected={isConnected} />
            )}
          </div>
        ) : (
          <StreamRoom
            socket={socket}
            sessionId={sessionId}
            participants={participants}
            onLeave={resetSessionState}
          />
        )}
      </main>

      <footer className="mt-8 text-center text-gray-500 text-xs">
        Developed by Rajin Khan
      </footer>
    </div>
  );
}

export default App;