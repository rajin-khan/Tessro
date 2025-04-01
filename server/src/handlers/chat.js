export function registerChatHandlers(io, socket, sessions) {
    socket.on('chat:message', ({ sessionId, message }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        console.warn(`[chat] No session found for ID: ${sessionId}`);
        return;
      }
  
      const user = session.users.find(u => u.id === socket.id);
      if (!user) {
        console.warn(`[chat] Unauthorized user ${socket.id} tried to chat in ${sessionId}`);
        return;
      }
  
      console.log(`[chat] ${user.nickname} (${socket.id}) sent a message to session ${sessionId}`);
  
      // Broadcast to others with nickname
      socket.to(sessionId).emit('chat:message', {
        text: message.text,
        timestamp: Date.now(),
        nickname: user.nickname || 'Unknown',
        senderId: socket.id
      });
    });
  }  