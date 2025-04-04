// client/src/components/Session/ConfirmLeaveModal.jsx
import React from 'react';
import { createPortal } from 'react-dom';

function ConfirmLeaveModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="animate-fade-in-up bg-brand-dark-purple border border-brand-tekhelet rounded-xl shadow-xl p-6 w-full max-w-sm text-center text-white font-barlow transform transition-all duration-300 scale-95 opacity-0 animate-enter"
      >
        <h2 className="text-lg font-semibold mb-2">Leave Session?</h2>
        <p className="text-sm text-gray-300 mb-4">
          Are you sure you want to leave this session? If you're the host, this will end the session for everyone.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full bg-gray-600 hover:bg-gray-500 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 transition text-sm"
          >
            Leave
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmLeaveModal;