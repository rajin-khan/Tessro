// client/src/components/Landing.jsx (Refactored Option 1)
import React, { useState, useEffect, useRef } from 'react';
import { FaCrown, FaCheck, FaUsers, FaRocket, FaStar, FaTimes } from 'react-icons/fa';
import VideoPlayer from './VideoPlayer';
import CreateSession from './Session/Create';
import JoinSession from './Session/Join';
import ServerStatusTimer from './Session/ServerStatusTimer';
import logo from '../assets/logo.png';

// Helper for smooth height transitions
const SmoothHeightWrapper = ({ children }) => {
    const contentRef = useRef(null);
    const [height, setHeight] = useState('auto');

    useEffect(() => {
        if (!contentRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setHeight(entry.contentRect.height);
            }
        });
        resizeObserver.observe(contentRef.current);
        return () => resizeObserver.disconnect();
    }, [children]);

    return (
        <div
            style={{ height }}
            className="transition-[height] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        >
            <div ref={contentRef}>{children}</div>
        </div>
    );
};

// --- EDIT THIS MESSAGE TO CHANGE THE DEVELOPER NOTE ---
const DEVELOPER_MESSAGE = "Hope you guys enjoy the UI overhauls. I'm working on more features and improvements <3";
// ----------------------------------------------------

export default function Landing({ mode, setMode, socket, isConnected, onSessionStart }) {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="min-h-screen bg-brand-bg w-full flex flex-col font-barlow overflow-hidden relative selection:bg-brand-primary selection:text-white">
            {/* Background Visuals */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Tessro" className="h-8 md:h-10 opacity-90" />
                    <div className="flex flex-col">
                        <span className="text-white/50 text-[10px] tracking-[0.2em] font-light leading-none">V2.2</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-[10px] font-mono text-white/40 flex items-center gap-2">
                        {isConnected ? (
                            <>
                                <span className="text-emerald-500/80">● ONLINE</span>
                                <span className="hidden md:inline text-white/10">|</span>
                                <span className="hidden md:inline">ID: {socket?.id?.slice(0, 4)}...</span>
                            </>
                        ) : (
                            <span className="text-red-500/80">● OFFLINE</span>
                        )}
                    </div>
                    {/* Server Status Timer integrated into Header */}
                    <div className="hidden md:block opacity-60 scale-90 origin-right">
                        <ServerStatusTimer />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-6xl mx-auto mt-8 md:mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 w-full items-center">

                    {/* Left Column: Hero Text */}
                    <div className="text-center lg:text-left space-y-5 max-w-2xl mx-auto lg:mx-0">
                        <div>
                            <span className="inline-block py-2 px-5 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm font-bold tracking-[0.25em] text-brand-primary uppercase mb-6 animate-fade-in-up shadow-lg shadow-brand-primary/10">
                                Real time. Real fast.
                            </span>
                            <h1 className="text-6xl md:text-8xl font-medium text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 leading-[0.9] tracking-tight">
                                SYNC <br /> TOGETHER.
                            </h1>
                        </div>

                        <p className="text-lg md:text-xl text-gray-400 font-light max-w-md mx-auto lg:mx-0 leading-relaxed">
                            The best way to watch movies with friends. <br />
                            <span className="text-brand-primary font-normal">No uploads. No accounts. Total privacy.</span>
                        </p>

                        {/* Mode Switcher - Pill Style */}
                        {/* Mode Switcher - Sliding Pill Style */}
                        <div className="relative inline-flex p-1 bg-[#0a0a0a] border border-white/10 rounded-full mt-6 shadow-inner overflow-hidden">
                            {/* Sliding Background Pill */}
                            <div
                                className={`absolute top-1 bottom-1 left-1 w-28 rounded-full bg-gradient-to-r from-purple-100 via-white to-purple-100 bg-[length:200%_auto] animate-shine shadow-[0_0_20px_rgba(168,85,247,0.4)] transform transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) ${mode === 'create' ? 'translate-x-0' : 'translate-x-[112px]'}`}
                            />

                            {/* Buttons */}
                            <button
                                onClick={() => setMode('create')}
                                className={`relative z-10 w-28 py-3 rounded-full text-sm tracking-widest font-medium transition-colors duration-300 shrink-0 ${mode === 'create' ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                HOST
                            </button>
                            <button
                                onClick={() => setMode('join')}
                                className={`relative z-10 w-28 py-3 rounded-full text-sm tracking-widest font-medium transition-colors duration-300 shrink-0 ${mode === 'join' ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                JOIN
                            </button>
                        </div>

                        {/* Developer / Portfolio Link - Desktop */}
                        <div className="hidden lg:block pt-8 text-left animate-fade-in delay-200 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="h-px w-8 bg-white/10"></div>
                                <p>
                                    Crafted by <a href="https://rajinkhan.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-primary transition-colors border-b border-transparent hover:border-brand-primary pb-0.5">Rajin Khan</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Active Card */}
                    <div className="relative w-full max-w-md mx-auto perspective-1000">
                        <div className="absolute inset-0 bg-brand-primary/20 blur-[60px] rounded-full -z-10" />

                        <div className="bg-[#080808]/95 border border-white/10 rounded-[2rem] shadow-2xl ring-1 ring-white/5 transition-all duration-500 hover:shadow-brand-primary/20 hover:scale-[1.01] overflow-hidden">
                            <SmoothHeightWrapper>
                                {mode === 'create' ? (
                                    <div key="create" className="p-8 animate-fade-in-fast">
                                        <h2 className="text-2xl text-white mb-6 font-light">Start a Session</h2>
                                        <CreateSession socket={socket} isConnected={isConnected} onSessionStart={onSessionStart} />
                                    </div>
                                ) : (
                                    <div key="join" className="p-8 animate-fade-in-fast">
                                        <h2 className="text-2xl text-white mb-6 font-light">Join a Stream</h2>
                                        <JoinSession socket={socket} isConnected={isConnected} onSessionStart={onSessionStart} />
                                    </div>
                                )}
                            </SmoothHeightWrapper>
                        </div>

                        <div className="mt-6 flex justify-center gap-6">
                            <button onClick={() => setShowInfo(true)} className="text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors font-medium">
                                About
                            </button>
                            <span className="text-white/10 text-xs">•</span>
                            <p className="text-xs uppercase tracking-widest font-medium bg-gradient-to-r from-brand-primary via-brand-yellow to-brand-primary bg-[length:200%_auto] text-transparent bg-clip-text animate-shine">End-to-End Encrypted</p>
                        </div>

                        {/* Developer / Portfolio Link - Mobile */}
                        <div className="lg:hidden mt-8 text-center animate-fade-in delay-200">
                            <p className="text-xs text-gray-500 mb-2">
                                Crafted by <a href="https://rajinkhan.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-primary transition-colors border-b border-transparent hover:border-brand-primary pb-0.5">Rajin Khan</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Info Modal */}
            {showInfo && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowInfo(false)}>
                    <div className="bg-[#0a0a0a] border border-white/10 p-8 md:p-12 rounded-[2rem] max-w-3xl w-full mx-auto shadow-2xl animate-fade-in-up relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Visuals */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full pointer-events-none" />

                        <button
                            onClick={() => setShowInfo(false)}
                            className="absolute top-6 right-6 text-white/30 hover:text-white text-2xl transition-colors"
                        >
                            &times;
                        </button>

                        <h2 className="text-4xl text-white font-medium mb-8">The Vision.</h2>

                        <div className="grid md:grid-cols-2 gap-12 text-gray-400 font-light leading-relaxed">
                            <div className="space-y-6">
                                <p>
                                    <span className="text-white font-normal block mb-2">Sync Mode</span>
                                    Everyone picks the same local video file. Tessro syncs the playback commands. Perfect for high-quality movie nights where everyone has the file.
                                </p>
                                <p>
                                    <span className="text-white font-normal block mb-2">Stream Mode</span>
                                    The host streams their local file directly to guests via WebRTC. No need for guests to download anything. Just click and watch.
                                </p>
                            </div>
                            <div className="space-y-6 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12">
                                <ul className="space-y-4 text-sm">
                                    <li className="flex items-center gap-3">
                                        <span className="text-brand-primary">✓</span> No user data stored
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-brand-primary">✓</span> No uploads to servers
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-brand-primary">✓</span> No accounts needed
                                    </li>
                                </ul>
                                <div className="pt-6 mt-4 border-t border-white/5">
                                    <p className="text-[10px] text-brand-primary uppercase tracking-widest mb-3 font-semibold">Developer Status</p>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
                                        {/* Shine effect overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine duration-1000 pointer-events-none"></div>

                                        <p className="text-sm md:text-base font-medium leading-relaxed bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-[length:200%_auto] text-transparent bg-clip-text animate-shine italic">
                                            {DEVELOPER_MESSAGE}
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <a href="https://rajinkhan.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white hover:text-brand-primary transition-colors text-sm font-medium">
                                            Visit my Portfolio &rarr;
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}