// server/src/handlers/sync.js
export function registerSyncHandlers(io, socket, sessions) {
    socket.on('sync:action', ({ sessionId, action, timestamp, seekTime }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        console.warn(`[sync] No session found for ID: ${sessionId}`);
        return;
      }
  
      // Optional: Only allow host or verified user
      if (!session.users.includes(socket.id) && socket.id !== session.host) {
        console.warn(`[sync] Unauthorized user tried to sync`);
        return;
      }
  
      // Broadcast to everyone else in the session except the sender
      socket.to(sessionId).emit('sync:action', { action, timestamp, seekTime });
    });
  }  