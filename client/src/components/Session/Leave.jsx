import React from 'react';

function LeaveSession({ socket, onLeave }) {
  const handleLeave = () => {
    const confirmed = window.confirm("Are you sure you want to leave the session?");
    if (!confirmed) return;

    if (socket) {
      socket.emit('session:leave');
    }

    // Reset frontend state
    onLeave();
  };

  return (
    <div className="text-center mt-4">
      <button
        onClick={handleLeave}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Leave Session
      </button>
    </div>
  );
}

export default LeaveSession;