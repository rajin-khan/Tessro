// client/src/components/Session/Leave.jsx
import React from 'react';

function LeaveSession({ socket, onLeave }) {
  const handleLeave = () => {
    if (socket && socket.connected) {
      socket.emit('session:leave');
      console.log('[Leave] Sent session:leave event');
    }
    onLeave(); // Reset frontend state
  };

  return (
    <button
      onClick={handleLeave}
      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
    >
      Leave Session
    </button>
  );
}

export default LeaveSession;