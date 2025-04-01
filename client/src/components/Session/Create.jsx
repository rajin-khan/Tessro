import React, { useState } from 'react';

function CreateSession({ socket, isConnected }) {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateSession = () => {
    if (!isConnected) {
      setError("Not connected to server.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setError('');
    setIsLoading(true);

    const name = nickname.trim() || `Host${Math.floor(Math.random() * 1000)}`;

    console.log('[Create] Creating session...');
    socket.emit('session:create', {
      password,
      nickname: name,
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-center text-gray-200">Start a New Session</h2>

      <input
        type="text"
        placeholder="Your Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full px-4 py-2 rounded-md bg-dark-bg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <input
        type="password"
        placeholder="Session Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded-md bg-dark-bg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      <button
        onClick={handleCreateSession}
        disabled={!isConnected || isLoading}
        className={`w-full px-4 py-2 rounded-md text-white bg-violet-600 hover:bg-violet-700 transition ${
          (!isConnected || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Creating...' : isConnected ? 'Create Session' : 'Connecting...'}
      </button>

      {!isConnected && !isLoading && (
        <p className="text-xs text-yellow-400 text-center">Connecting to server...</p>
      )}
    </div>
  );
}

export default CreateSession;