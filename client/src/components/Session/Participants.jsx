import React from 'react';

function Participants({ participants = [], hostId, selfId }) {
  return (
    <div className="bg-dark-surface border border-gray-700 rounded-lg p-4 mt-6 w-full">
      <h3 className="text-gray-300 text-sm mb-3">Participants</h3>
      <ul className="flex flex-col space-y-2 text-sm text-gray-200">
        {participants.map((user) => (
          <li key={user.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {user.id === hostId && (
                <span title="Host" className="text-yellow-400">👑</span>
              )}
              <span>{user.nickname || 'Guest'}</span>
            </div>
            {user.id === selfId && (
              <span className="text-xs text-gray-400">(You)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Participants;