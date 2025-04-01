// client/src/components/StreamRoom.jsx
import React from 'react';
import VideoPlayer from './VideoPlayer/index.jsx';
import Chat from './Chat/index.jsx';
import Participants from './Session/Participants.jsx';
import LeaveSession from './Session/Leave.jsx';

function StreamRoom({ socket, sessionId, participants, onLeave }) {
  const hostId = participants[0]?.id;
  const selfId = socket.id;

  return (
    <div className="flex flex-row w-full h-[80vh] max-w-7xl bg-dark-surface border border-gray-700 rounded-lg overflow-hidden shadow-xl">
      {/* Left: Video */}
      <div className="w-3/4 h-full p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <LeaveSession socket={socket} onLeave={onLeave} />
          <div className="text-sm text-gray-500">Session ID: {sessionId}</div>
        </div>
        <VideoPlayer socket={socket} sessionId={sessionId} />
      </div>

      {/* Right: Chat & Participants */}
      <div className="w-1/4 h-full bg-dark-bg border-l border-gray-700 flex flex-col justify-between p-4 space-y-4">
        <div>
          <h3 className="text-sm text-gray-400 mb-2">Participants</h3>
          <Participants participants={participants} hostId={hostId} selfId={selfId} />
        </div>
        <div className="flex-1 overflow-y-auto mt-4">
          <Chat socket={socket} sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}

export default StreamRoom;