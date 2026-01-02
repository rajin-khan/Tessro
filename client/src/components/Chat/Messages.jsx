import React, { useEffect, useRef } from 'react';

function ChatMessages({ messages, selfId }) {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col space-y-4 px-6 py-4 overflow-y-auto h-full scrollbar-hide">
            {messages.map((msg, i) => {
                const isSelf = msg.senderId === selfId;
                const nickname = msg.nickname || 'Guest';

                return (
                    <div
                        key={msg.timestamp || i}
                        className={`flex items-end gap-3 ${isSelf ? 'justify-end' : 'justify-start'} group`}
                    >
                        {!isSelf && (
                            <img
                                src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${msg.senderId}`}
                                alt={nickname}
                                className="w-6 h-6 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                                title={nickname}
                            />
                        )}
                        <div className={`flex flex-col max-w-[80%] ${isSelf ? 'items-end' : 'items-start'}`}>
                            {!isSelf && <span className="text-[10px] text-white/30 ml-1 mb-1">{nickname}</span>}
                            <div
                                className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all duration-200 ${isSelf
                                    ? 'bg-brand-primary text-white rounded-2xl rounded-br-sm font-medium shadow-brand-primary/20'
                                    : 'bg-[#111] border border-white/10 text-gray-300 rounded-2xl rounded-bl-sm'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}

export default ChatMessages;