import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import StreamRoom from './components/StreamRoom.jsx';
import Landing from './components/Landing.jsx';
import { useSocket } from './hooks/useSocket';
import TermsModal from './components/Legal/TermsModal.jsx';
import PrivacyPolicyModal from './components/Legal/PrivacyPolicyModal.jsx';
import ServerStatusTimer from './components/Session/ServerStatusTimer.jsx';

function App() {
  const { socket, isConnected } = useSocket();
  const [sessionId, setSessionId] = useState(null);
  const [sessionPassword, setSessionPassword] = useState(''); // State to hold the password
  const [appError, setAppError] = useState(null);
  const [mode, setMode] = useState('create');
  const [participants, setParticipants] = useState([]);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const resetSessionState = () => {
    setSessionId(null);
    setSessionPassword(''); // Reset password on leave
    setParticipants([]);
    setAppError(null);
  };

  useEffect(() => {
    if (!socket) return;

    const handleSessionCreated = ({ sessionId: newSessionId }) => {
      setSessionId(newSessionId);
      setAppError(null);
    };

    const handleSessionJoined = ({ sessionId: joinedSessionId }) => {
      setSessionId(joinedSessionId);
      setAppError(null);
    };

    const handleSessionError = ({ error }) => {
      if (error?.includes('does not match the host')) return;
      setAppError(error || 'Something went wrong while joining the session.');
    };

    const handleHostDisconnected = ({ message }) => {
      setAppError(message || 'The session host disconnected.');
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
        <img
          src={logo}
          alt="Tessro Logo"
          className="h-24 sm:h-28 md:h-32 mx-auto mb-2 transition-all"
        />
        <p className="text-sm text-gray-400">Real-time, Real fast. Fully private.</p>
        <div className="mt-1">
          <p className="text-xs text-gray-500 break-all">
            Status:{' '}
            {isConnected ? (
              <span className="text-green-400">Connected</span>
            ) : (
              <span className="text-red-400">Disconnected</span>
            )}
            {isConnected && socket && ` (ID: ${socket.id})`}
          </p>
          {!sessionId && <ServerStatusTimer />}
        </div>
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
            onSessionStart={(pwd) => setSessionPassword(pwd)} // Pass the setter function
          />
        ) : (
          <StreamRoom
            socket={socket}
            sessionId={sessionId}
            sessionPassword={sessionPassword} // Pass the password down
            participants={participants}
            onLeave={resetSessionState}
          />
        )}
      </main>

      <footer className="mt-6 sm:mt-10 text-center text-gray-600 text-xs">
        <p className="text-sm text-gray-400">
          Tessro works best on a laptop or desktop computer. Streaming servers are now automatically maintained. (I learned how cron jobs work!🥳)
        </p>
        <p>
          Data is NEVER stored anywhere. Anything passing through is always encrypted.
        </p>
        <p>
          Each session is currently limited to 7 users (hit me up to change that).
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Developed by{' '}
          <a
            href="https://rajinkhan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:underline"
          >
            Rajin Khan
          </a>
          {' '} • {' '}
          <button
            onClick={() => setShowTerms(true)}
            className="underline text-brand-primary hover:text-white"
          >
            Terms of Service
          </button>{' '}
          •{' '}
          <button
            onClick={() => setShowPrivacy(true)}
            className="underline text-brand-primary hover:text-white"
          >
            Privacy Policy
          </button>
        </p>
      </footer>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyPolicyModal show={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}

export default App;