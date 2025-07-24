import React from 'react';

function PrivacyPolicyModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center animate-fade-in">
      <div className="bg-brand-dark-purple text-white p-6 rounded-2xl shadow-xl w-full max-w-xl mx-auto animate-fade-in-up">
        <h2 className="text-xl font-semibold mb-4 text-brand-primary">🔒 Privacy Policy</h2>
        <div className="space-y-4 text-sm text-gray-300 max-h-[65vh] overflow-y-auto pr-2">
          <p>
            Tessro does not collect, store, or share any personal data. All activity happens peer-to-peer and is session-based. No video files are uploaded to any server.
          </p>
          <p>
            Your nickname and messages are temporarily stored in your browser memory for the duration of the session and are cleared when you leave.
          </p>
          <p>
            By using Tessro, you acknowledge that the platform is designed for private, ephemeral video sessions with friends, and you are fully responsible for the content you stream.
          </p>
          <p>
            We use no cookies, trackers, or analytics. You are fully in control of your privacy.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 block ml-auto px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-tekhelet transition text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default PrivacyPolicyModal;