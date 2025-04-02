import React, { useState } from 'react';
import CreateSession from './Session/Create';
import JoinSession from './Session/Join';

function Landing({ mode, setMode, socket, isConnected }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-brand-rich-black/40 backdrop-blur-md border border-brand-primary/30 rounded-3xl shadow-[0_0_30px_#6435AC55] space-y-6 transition-all font-barlow relative">

      {/* Toggle Buttons */}
      <div className="flex justify-center flex-wrap gap-3">
        <button
          onClick={() => setMode('create')}
          className={`px-5 py-2 rounded-full font-medium text-sm tracking-wide transition-all max-w-[160px]
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
          className={`px-5 py-2 rounded-full font-medium text-sm tracking-wide transition-all max-w-[160px]
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

      {/* ℹ️ Info Button */}
      <button
        onClick={() => setShowInfo(true)}
        className="block mx-auto mt-4 text-sm px-4 py-2 border border-brand-primary text-brand-primary rounded-full hover:bg-brand-primary hover:text-white transition-all"
      >
        What is Tessro?
      </button>

      {/* 🧊 Info Modal */}
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
              Tessro lets you <strong>sync videos</strong> with friends in real-time — like a watch party, but better. <strong>No uploads, no accounts. Watch whatever you want.</strong>
            </p>
            <ul className="mt-4 text-sm text-gray-400 list-disc list-inside space-y-2">
              <li><strong>Create or join a private session</strong></li>
              <li><strong>Select a local video file (everyone has to select the same one)</strong></li>
              <li><strong>Playback is synchronized — pause, play, or seek together</strong></li>
              <li><strong>Use the built-in chat to talk live while watching!</strong></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;