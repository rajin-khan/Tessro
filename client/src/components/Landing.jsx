import React, { useState } from 'react';
import CreateSession from './Session/Create';
import JoinSession from './Session/Join';

// Accept onSessionStart prop
function Landing({ mode, setMode, socket, isConnected, onSessionStart }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-brand-rich-black/40 backdrop-blur-md border border-brand-primary/30 rounded-3xl shadow-[0_0_30px_#6435AC55] space-y-6 transition-all font-barlow relative">
      <div className="flex justify-center flex-wrap gap-3">
        <button
          onClick={() => setMode('create')}
          className={`px-5 py-2 rounded-full font-medium text-sm tracking-wide transition-all max-w-[160px] ${
            mode === 'create'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-brand-tekhelet/30 text-gray-300 hover:bg-brand-tekhelet/50 hover:text-white'
          }`}
        >
          Create
        </button>
        <button
          onClick={() => setMode('join')}
          className={`px-5 py-2 rounded-full font-medium text-sm tracking-wide transition-all max-w-[160px] ${
            mode === 'join'
              ? 'bg-brand-primary text-white shadow-md'
              : 'bg-brand-tekhelet/30 text-gray-300 hover:bg-brand-tekhelet/50 hover:text-white'
          }`}
        >
          Join
        </button>
      </div>
      <div className="w-full">
        {mode === 'create' ? (
          <CreateSession socket={socket} isConnected={isConnected} onSessionStart={onSessionStart} />
        ) : (
          <JoinSession socket={socket} isConnected={isConnected} onSessionStart={onSessionStart} />
        )}
      </div>
      <button
        onClick={() => setShowInfo(true)}
        className="block mx-auto mt-4 text-sm px-4 py-2 border border-brand-primary text-brand-primary rounded-full hover:bg-brand-primary hover:text-white transition-all"
      >
        What is Tessro?
      </button>

      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-rich-black border border-brand-primary/30 p-6 sm:p-8 rounded-2xl max-w-lg sm:max-w-md w-full mx-auto shadow-xl animate-fade-scale-in font-barlow relative">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-semibold text-white mb-3">
              What is Tessro?
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Tessro lets you <strong>watch videos with friends in perfect sync</strong>, or <strong>stream your content directly</strong> — all in real-time. <strong>No uploads. No accounts.</strong>
            </p>
            <ul className="mt-4 text-sm text-gray-400 list-disc list-inside space-y-2">
              <li><strong>Create or join a private session</strong> using a unique ID</li>
              <li><strong>Choose between two modes:</strong></li>
              <ul className="ml-4 space-y-1">
                <li>
                  🎬 <strong>Sync Mode</strong>: Everyone selects the same local file. Playback stays synced — pause, play, seek together.
                </li>
                <li>
                  📡 <strong>Stream Mode</strong>: The host selects a file and streams it to everyone else in real-time. No need for others to have the same file.
                </li>
              </ul>
              <li><strong>Use the built-in chat</strong> to talk and react live</li>
              <li className="text-yellow-400">
                ⚠️ For best results, stick to one mode throughout your session
              </li>
              <li className="text-red-400">
                  ⏰ Let everyone join <strong>before</strong> you begin streaming
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;