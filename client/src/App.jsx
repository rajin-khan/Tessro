// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import CreateSession from './components/Session/Create';
import JoinSession from './components/Session/Join';
import SessionInfo from './components/Session/Info';
import VideoPlayer from './components/VideoPlayer/index.jsx';
import Chat from './components/Chat/index.jsx';
import { useSocket } from './hooks/useSocket';

function App() {
  const { socket, isConnected } = useSocket();
  const [sessionId, setSessionId] = useState(null);
  const [appError, setAppError] = useState(null);
  const [mode, setMode] = useState('create'); // 'create' or 'join'

  console.log("App rendering. Session ID:", sessionId, "Socket ID:", socket?.id, "Connected:", isConnected);

  useEffect(() => {
    if (!socket) return;

    const handleSessionCreated = ({ sessionId: newSessionId, error: creationError }) => {
      console.log(">>> handleSessionCreated triggered!", { newSessionId, creationError });

      if (creationError) {
        console.error("Session creation failed:", creationError);
        setAppError(`Session creation failed: ${creationError}`);
        setSessionId(null);
      } else if (newSessionId) {
        console.log(">>> Setting Session ID state to:", newSessionId);
        setSessionId(newSessionId);
        setAppError(null);
      } else {
        console.warn(">>> session:created event received but no sessionId found.");
      }
    };

    const handleSessionJoined = ({ sessionId: joinedSessionId }) => {
      console.log(">>> handleSessionJoined triggered!", joinedSessionId);
      setSessionId(joinedSessionId);
      setAppError(null);
    };

    const handleSessionError = ({ error }) => {
      console.error(">>> handleSessionError triggered!", error);
      setAppError(error || "Something went wrong while joining the session.");
    };

    const handleHostDisconnected = ({ message }) => {
      console.warn(">>> handleHostDisconnected triggered!", message);
      setAppError(message || "The session host disconnected.");
      setSessionId(null);
    };

    socket.on('session:created', handleSessionCreated);
    socket.on('session:joined', handleSessionJoined);
    socket.on('session:error', handleSessionError);
    socket.on('session:host_disconnected', handleHostDisconnected);

    return () => {
      if (socket) {
        socket.off('session:created', handleSessionCreated);
        socket.off('session:joined', handleSessionJoined);
        socket.off('session:error', handleSessionError);
        socket.off('session:host_disconnected', handleHostDisconnected);
      }
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

      <main className="w-full max-w-3xl bg-dark-surface p-6 rounded-lg shadow-lg">
        {appError && (
          <div className="bg-red-800 border border-red-600 text-white p-3 rounded mb-4 text-center text-sm">
            {appError}
          </div>
        )}

        {!sessionId ? (
          <>
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
          </>
        ) : (
          <>
            <SessionInfo sessionId={sessionId} />
            <div className="mt-6">
              <VideoPlayer socket={socket} sessionId={sessionId} />
            </div>
            <Chat socket={socket} sessionId={sessionId} />
          </>
        )}
      </main>

      <footer className="mt-8 text-center text-gray-500 text-xs">
        Developed by Rajin Khan
      </footer>
    </div>
  );
}

export default App;