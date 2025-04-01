// server/src/handlers/chat.js

export function registerChatHandlers(io, socket, sessions) {
    socket.on('chat:message', ({ sessionId, message }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        console.warn(`[chat] No session found for ID: ${sessionId}`);
        return;
      }
  
      if (!session.users.includes(socket.id) && socket.id !== session.host) {
        console.warn(`[chat] Unauthorized user ${socket.id} tried to chat in ${sessionId}`);
        return;
      }
  
      console.log(`[chat] ${socket.id} sent a message to session ${sessionId}`);
  
      // Broadcast to everyone in the room except sender
      socket.to(sessionId).emit('chat:message', message);
    });
  }  