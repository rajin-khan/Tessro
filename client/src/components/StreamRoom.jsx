import React, { useState, useEffect, useMemo } from 'react';
import VideoPlayer from './VideoPlayer';
import { FaChevronRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Chat from './Chat';
import Participants from './Session/Participants';
import SessionInfo from './Session/Info';
import ConfirmLeaveModal from './Session/ConfirmLeaveModal';

// Accept `sessionPassword` prop
function StreamRoom({ socket, sessionId, sessionPassword, initialParticipants, onLeave }) {
    const [participants, setParticipants] = useState(initialParticipants || []);
    const [sessionMode, setSessionMode] = useState('sync');
    const [showSidebar, setShowSidebar] = useState(true);
    const [messages, setMessages] = useState([]);
    const [mobileView, setMobileView] = useState('chat');
    const [isMobileMinimized, setIsMobileMinimized] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    // Background ambient effects
    const AmbientBackground = () => (
        <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[100px] rounded-full mix-blend-screen opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/10 blur-[100px] rounded-full mix-blend-screen opacity-40" />
        </div>
    );

    const selfId = socket?.id;
    const hostId = useMemo(() => participants[0]?.id, [participants]);
    const isHost = useMemo(() => selfId === hostId, [selfId, hostId]);

    useEffect(() => {
        if (!socket) return;
        const handleParticipantsUpdate = ({ participants: updatedParticipants, mode: updatedMode }) => {
            setParticipants(updatedParticipants || []);
            setSessionMode(updatedMode || 'sync');
        };
        socket.on('session:participants', handleParticipantsUpdate);
        if (socket && sessionId) socket.emit('session:request_participants');
        return () => {
            socket.off('session:participants', handleParticipantsUpdate);
        };
    }, [socket, sessionId]);

    useEffect(() => {
        if (!socket) return;
        const handleMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
        };
        socket.on('chat:message', handleMessage);
        return () => {
            socket.off('chat:message', handleMessage);
        };
    }, [socket]);

    useEffect(() => {
        const handleUnload = () => {
            if (socket?.connected) {
                socket.emit('session:leave');
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [socket]);

    const sendMessage = (text) => {
        const trimmed = text.trim();
        if (!trimmed || !socket || !sessionId) return;
        const selfUser = participants.find((p) => p.id === selfId);
        const nickname = selfUser?.nickname || 'Me';
        const msg = {
            id: `${selfId}-${Date.now()}`, senderId: selfId, nickname, text: trimmed, timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, msg]);
        socket.emit('chat:message', { sessionId, message: msg });
    };

    const handleConfirmLeave = () => {
        setShowLeaveModal(false);
        if (socket) {
            socket.emit('session:leave');
        }
        onLeave();
    };

    if (!socket || !sessionId || !selfId) {
        return <div className="text-white p-10 font-barlow animate-pulse">Connecting to session...</div>;
    }

    return (
        <>
            <div className="w-full h-screen supports-[height:100dvh]:h-[100dvh] p-0 sm:p-2 md:p-6 lg:p-8 flex flex-col items-center justify-center font-barlow relative overflow-hidden bg-black md:bg-transparent">
                <AmbientBackground />

                <div className="w-full max-w-[1600px] bg-[#030303] border border-white/10 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex flex-col lg:flex-row h-[92dvh] md:h-[90vh] overflow-hidden relative">

                    {/* Main Content Area (Video) */}
                    <div className={`transition-all duration-300 ease-in-out w-full lg:flex-1 lg:min-w-0 flex flex-col relative bg-black ${isMobileMinimized ? 'flex-1 min-h-0' : 'h-[40%]'} lg:h-full`}>

                        {/* Top Bar / Controls */}
                        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
                            {/* Leave Button */}
                            <button
                                onClick={() => setShowLeaveModal(true)}
                                className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold tracking-wider text-red-400 hover:text-red-300 hover:bg-black/60 px-4 py-2 rounded-full uppercase transition-all flex items-center gap-1 group shadow-lg"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform">←</span> Leave
                            </button>

                            <div className="flex items-center gap-3 pointer-events-auto">
                                <SessionInfo socket={socket} sessionMode={sessionMode} isHost={isHost} />

                                {/* Desktop Chat Toggle */}
                                <button
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-black/40 text-gray-400 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md group"
                                    title={showSidebar ? 'Hide Chat' : 'Show Chat'}
                                >
                                    <FaChevronRight className={`w-3 h-3 transition-transform duration-300 ${showSidebar ? 'rotate-0' : 'rotate-180'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Video Player Container */}
                        <div className="flex-1 relative w-full h-full flex items-center justify-center bg-black">
                            <VideoPlayer
                                socket={socket}
                                sessionId={sessionId}
                                sessionMode={sessionMode}
                                isHost={isHost}
                                participants={participants}
                                selfId={selfId}
                            />
                        </div>
                    </div>

                    {/* Sidebar Area (Desktop: Right Column, Mobile: Bottom Section) */}
                    {(showSidebar || window.innerWidth < 1024) && (
                        <div className={`${showSidebar ? 'lg:flex' : 'lg:hidden'} lg:w-[320px] xl:w-[380px] lg:flex-none ${isMobileMinimized ? 'flex-none h-auto' : 'flex-1'} w-full border-t lg:border-t-0 lg:border-l border-white/10 bg-[#050505] flex flex-col relative z-20 overflow-hidden shadow-2xl transition-all duration-300`}>

                            {/* Mobile View Toggle Tabs */}
                            <div className="lg:hidden flex items-center justify-between border-b border-white/5 bg-[#0a0a0a] relative z-30">
                                <div className="flex-1 flex">
                                    <button
                                        onClick={() => { setMobileView('chat'); setIsMobileMinimized(false); }}
                                        className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${mobileView === 'chat' && !isMobileMinimized ? 'text-brand-primary border-b-2 border-brand-primary bg-white/5' : 'text-gray-500'}`}
                                    >
                                        Chat
                                    </button>
                                    <button
                                        onClick={() => { setMobileView('participants'); setIsMobileMinimized(false); }}
                                        className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${mobileView === 'participants' && !isMobileMinimized ? 'text-brand-primary border-b-2 border-brand-primary bg-white/5' : 'text-gray-500'}`}
                                    >
                                        Participants ({participants.length})
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsMobileMinimized(!isMobileMinimized)}
                                    className="px-4 py-3 text-gray-400 hover:text-white border-l border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    {isMobileMinimized ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                </button>
                            </div>

                            {/* Desktop: Stacked Participants & Chat */}
                            <div className="hidden lg:flex flex-col h-full">
                                <div className="shrink-0 border-b border-white/5 flex flex-col max-h-[230px] overflow-hidden transition-all duration-300 ease-in-out">
                                    <Participants
                                        participants={participants}
                                        hostId={hostId}
                                        selfId={selfId}
                                        sessionId={sessionId}
                                        sessionPassword={sessionPassword}
                                    />
                                </div>
                                <div className="flex-1 flex flex-col min-h-0 bg-[#080808]">
                                    <Chat socket={socket} sessionId={sessionId} messages={messages} sendMessage={sendMessage} />
                                </div>
                            </div>

                            {/* Mobile: Swappable Views */}
                            {!isMobileMinimized && (
                                <div className="lg:hidden flex-1 flex flex-col min-h-0 relative">
                                    {mobileView === 'participants' ? (
                                        <div className="absolute inset-0 bg-[#080808]">
                                            <Participants
                                                participants={participants}
                                                hostId={hostId}
                                                selfId={selfId}
                                                sessionId={sessionId}
                                                sessionPassword={sessionPassword}
                                            />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col bg-[#080808]">
                                            <Chat socket={socket} sessionId={sessionId} messages={messages} sendMessage={sendMessage} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmLeaveModal
                isOpen={showLeaveModal}
                onCancel={() => setShowLeaveModal(false)}
                onConfirm={handleConfirmLeave}
            />
        </>
    );
}

export default StreamRoom;