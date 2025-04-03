import { useEffect, useState } from 'react';

export function useChat(socket, sessionId) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket || !sessionId) return;

    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [socket, sessionId]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed || !sessionId) return;

    const msg = {
      id: Date.now(),
      senderId: socket.id,
      text: trimmed,
      timestamp: new Date().toISOString(),
      nickname: 'Me' // UI displays nickname already
    };

    setMessages(prev => [...prev, msg]);

    socket.emit('chat:message', {
      sessionId,
      message: msg
    });
  };

  return { messages, sendMessage };
}