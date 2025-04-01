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
      <div className="text-green-400 text-center mt-4">
        ✅ Joined session successfully!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-center text-gray-200">Join a Session</h2>

      <input
        type="text"
        placeholder="Session ID"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        className="w-full px-4 py-2 rounded-md bg-dark-bg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <input
        type="password"
        placeholder="Session Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded-md bg-dark-bg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <input
        type="text"
        placeholder="Your Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full px-4 py-2 rounded-md bg-dark-bg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      <button
        onClick={handleJoin}
        disabled={!isConnected || isJoining}
        className={`w-full px-4 py-2 rounded-md text-white bg-yellow-500 hover:bg-yellow-600 transition ${
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