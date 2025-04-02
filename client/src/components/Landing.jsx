import React from 'react';
import CreateSession from './Session/Create';
import JoinSession from './Session/Join';

function Landing({ mode, setMode, socket, isConnected }) {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-brand-rich-black/40 backdrop-blur-md border border-brand-primary/30 rounded-3xl shadow-[0_0_30px_#6435AC55] space-y-6 transition-all font-barlow">

      {/* Toggle Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setMode('create')}
          className={`px-5 py-2 rounded-full font-medium text-sm tracking-wide transition-all
            ${
              mode === 'create'
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-brand-tekhelet/30 text-gray-300 hover:bg-brand-tekhelet/50 hover:text-white'
            }`}
        >
          Create
        </button>
        <button
          onClick={() => setMode('join')}
          className={`px-5 py-2 rounded-full font-medium text-sm tracking-wide transition-all
            ${
              mode === 'join'
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-brand-tekhelet/30 text-gray-300 hover:bg-brand-tekhelet/50 hover:text-white'
            }`}
        >
          Join
        </button>
      </div>

      {/* Active Form */}
      <div className="w-full">
        {mode === 'create' ? (
          <CreateSession socket={socket} isConnected={isConnected} />
        ) : (
          <JoinSession socket={socket} isConnected={isConnected} />
        )}
      </div>
    </div>
  );
}

export default Landing;