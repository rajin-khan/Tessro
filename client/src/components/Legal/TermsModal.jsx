import React, { useEffect } from 'react';

function TermsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-brand-dark-purple text-white p-6 rounded-2xl shadow-xl max-w-lg w-full mx-4 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-brand-primary">Terms of Service</h2>
        <div className="text-sm text-gray-300 space-y-3 max-h-[60vh] overflow-y-auto">
          <p>
            By using Tessro, you acknowledge and agree to the following terms:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Tessro is intended for personal use and collaborative media syncing only.
            </li>
            <li>
              Users are solely responsible for the content they stream or share using this application.
            </li>
            <li>
              Tessro does not host or distribute any copyrighted media.
            </li>
            <li>
              Tessro does not store any video content.
            </li>
            <li>
              Any misuse of this application for illegal streaming or distribution is STRICTLY PROHIBITED.
            </li>
            <li>
              Misuse or abuse of the platform WILL result in access restrictions.
            </li>
            <li>
              These terms may be updated periodically without notice.
            </li>
            <li>
              We are NOT liable for any DMCA violations, user behavior, or third-party copyright infringement.
            </li>
            <li>
              Tessro is provided as-is, without warranties. The developer assumes no responsibility for any misuse of this platform.
            </li>
          </ul>
          <p className="text-xs text-gray-500 pt-2">
            By continuing to use Tessro, you automatically accept these terms.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default TermsModal;