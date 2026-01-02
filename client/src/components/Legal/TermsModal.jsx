// client/src/components/Legal/TermsModal.jsx
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
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in font-barlow"
            onClick={onClose}
        >
            <div
                className="bg-[#0a0a0a] border border-white/10 text-white p-8 rounded-3xl shadow-2xl w-full max-w-xl mx-auto animate-fade-in-up relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Ambient Purple Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 blur-[60px] rounded-full pointer-events-none" />

                <h2 className="text-xl font-medium mb-6 text-brand-primary tracking-wide flex items-center gap-2">
                    <span className="text-2xl">Terms of Service</span>
                </h2>

                <div className="text-sm text-gray-400 font-light space-y-4 max-h-[65vh] overflow-y-auto pr-2 leading-relaxed custom-scrollbar">
                    <p>
                        By using Tessro, you acknowledge and agree to the following terms:
                    </p>
                    <ul className="list-disc pl-5 space-y-3 marker:text-brand-primary">
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
                            Any misuse of this application for illegal streaming or distribution is <span className="text-red-400 font-normal">STRICTLY PROHIBITED</span>.
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
                    <p className="text-xs text-gray-500 pt-4 border-t border-white/5">
                        By continuing to use Tessro, you automatically accept these terms.
                    </p>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300 text-sm font-medium shadow-lg shadow-brand-primary/10"
                    >
                        Accept & Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TermsModal;
