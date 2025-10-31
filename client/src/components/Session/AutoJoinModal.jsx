import React, { useState } from 'react';
import logo from '../../assets/logo.png';

function AutoJoinModal({ sessionId, password, socket, isConnected, onJoin, onCancel }) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {
    if (!isConnected) {
      setError('Not connected to server.');
      return;
    }

    setError('');
    setIsJoining(true);

    const name = nickname.trim() || `Guest${Math.floor(Math.random() * 1000)}`;

    // Emit join event
    socket.emit('session:join', { sessionId, password, nickname: name });

    // Listen for response
    const handleJoinSuccess = () => {
      setIsJoining(false);
      if (onJoin) onJoin(password);
      socket.off('session:joined', handleJoinSuccess);
      socket.off('session:error', handleJoinError);
    };

    const handleJoinError = ({ error: errorMsg }) => {
      setError(errorMsg || 'Failed to join session.');
      setIsJoining(false);
      socket.off('session:joined', handleJoinSuccess);
      socket.off('session:error', handleJoinError);
    };

    socket.once('session:joined', handleJoinSuccess);
    socket.once('session:error', handleJoinError);
  };

  const handleCancel = () => {
    // Clear URL params
    const url = new URL(window.location);
    url.searchParams.delete('join');
    url.searchParams.delete('pass');
    window.history.replaceState({}, '', url);
    if (onCancel) onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-rich-black/95 border border-brand-primary/30 p-6 sm:p-7 rounded-2xl max-w-md w-full mx-auto shadow-2xl animate-fade-scale-in font-barlow">
        {/* Logo and header */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src={logo} 
            alt="Tessro" 
            className="h-12 w-auto mb-3"
          />
          <p className="text-gray-300 text-center text-sm">
            You have been invited to join a session
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="w-full">
            <input
              type="text"
              placeholder="Your Nickname (optional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isJoining && isConnected) {
                  handleJoin();
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-rich-black/60 border border-brand-tekhelet/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-200 text-sm"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1.5 px-1">
              Leave blank for auto-generated name
            </p>
          </div>
          
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-900/20 border border-red-500/30">
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}
          
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={handleCancel}
              disabled={isJoining}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={!isConnected || isJoining}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-brand-primary text-white hover:bg-brand-tekhelet transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
            >
              {isJoining ? 'Joining...' : isConnected ? 'Join Session' : 'Connecting...'}
            </button>
          </div>

          {!isConnected && !isJoining && (
            <p className="text-xs text-yellow-400 text-center">Connecting to server...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AutoJoinModal;

