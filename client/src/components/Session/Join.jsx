import React, { useState, useEffect } from 'react';

function JoinSession({ socket, isConnected }) {
  const [sessionId, setSessionId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    if (!sessionId.trim() || !password.trim()) {
      setError('Session ID and password are required.');
      return;
    }

    if (!isConnected) {
      setError('Not connected to server.');
      return;
    }

    setError('');
    setIsJoining(true);

    const name = nickname.trim() || `Guest${Math.floor(Math.random() * 1000)}`;

    socket.emit('session:join', {
      sessionId,
      password,
      nickname: name,
    });
  };

  useEffect(() => {
    const handleJoinSuccess = ({ sessionId }) => {
      setJoined(true);
      setIsJoining(false);
      console.log('Successfully joined session:', sessionId);
    };

    const handleJoinError = ({ error }) => {
      setError(error);
      setIsJoining(false);
    };

    socket.on('session:joined', handleJoinSuccess);
    socket.on('session:error', handleJoinError);

    return () => {
      socket.off('session:joined', handleJoinSuccess);
      socket.off('session:error', handleJoinError);
    };
  }, [socket]);

  if (joined) {
    return (
      <div className="text-green-400 text-center mt-4 font-barlow">
        ✅ Joined session successfully!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-5 w-full font-barlow">
      <h2 className="text-lg font-semibold text-center text-white">Join a Session</h2>

      <input
        type="text"
        placeholder="Session ID"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-brand-rich-black border border-brand-primary/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
      />

      <input
        type="password"
        placeholder="Session Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-brand-rich-black border border-brand-primary/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
      />

      <input
        type="text"
        placeholder="Your Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-brand-rich-black border border-brand-tekhelet/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-tekhelet transition"
      />

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      <button
        onClick={handleJoin}
        disabled={!isConnected || isJoining}
        className={`w-full px-4 py-2 rounded-full font-medium bg-brand-primary text-white hover:bg-brand-tekhelet transition ${
          (!isConnected || isJoining) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isJoining ? 'Joining...' : isConnected ? 'Join Session' : 'Connecting...'}
      </button>

      {!isConnected && !isJoining && (
        <p className="text-xs text-yellow-400 text-center">Connecting to server...</p>
      )}
    </div>
  );
}

export default JoinSession;