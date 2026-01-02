import React from 'react';
import ChatInput from './Input.jsx';
import ChatMessages from './Messages.jsx';

function Chat({ socket, sessionId, messages, sendMessage }) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 pb-2">
                <h3 className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em] mb-2 pl-2">Live Chat</h3>
            </div>
            <div className="flex-1 overflow-hidden relative">
                <ChatMessages messages={messages} selfId={socket.id} />
                {/* Gradient fade at top for aesthetics */}
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none" />
            </div>
            <div className="">
                <ChatInput onSend={sendMessage} />
            </div>
        </div>
    );
}

export default Chat;