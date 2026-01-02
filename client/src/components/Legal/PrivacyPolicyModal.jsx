import React from 'react';

function PrivacyPolicyModal({ show, onClose }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in font-barlow">
            <div className="bg-[#0a0a0a] border border-white/10 text-white p-8 rounded-3xl shadow-2xl w-full max-w-xl mx-auto animate-fade-in-up relative overflow-hidden">
                {/* Ambient Purple Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 blur-[60px] rounded-full pointer-events-none" />

                <h2 className="text-xl font-medium mb-6 text-brand-primary tracking-wide">Privacy Policy</h2>

                <div className="space-y-4 text-sm text-gray-400 font-light max-h-[65vh] overflow-y-auto pr-2 leading-relaxed">
                    <p>
                        Tessro does not collect, store, or share any personal data. All activity happens <span className="text-white font-normal">peer-to-peer</span> and is session-based. No video files are uploaded to any server.
                    </p>
                    <p>
                        Your nickname and messages are temporarily stored in your browser memory for the duration of the session and are cleared when you leave.
                    </p>
                    <p>
                        By using Tessro, you acknowledge that the platform is designed for private, ephemeral video sessions with friends, and you are fully responsible for the content you stream.
                    </p>
                    <p className="text-xs text-gray-500 pt-4 border-t border-white/5">
                        We use no cookies, trackers, or analytics. You are fully in control of your privacy.
                    </p>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300 text-sm font-medium shadow-lg shadow-brand-primary/10"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicyModal;