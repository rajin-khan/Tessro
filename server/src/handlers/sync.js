export function registerSyncHandlers(io, socket, sessions) {
    socket.on('sync:action', ({ sessionId, action, timestamp, seekTime }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        console.warn(`[sync] No session found for ID: ${sessionId}`);
        return;
      }
  
      if (!session.users.includes(socket.id) && socket.id !== session.host) {
        console.warn(`[sync] Unauthorized user tried to sync`);
        return;
      }
  
      // Broadcast to others in the session
      socket.to(sessionId).emit('sync:action', { action, timestamp, seekTime });
    });
  
    socket.on('sync:fileSelected', ({ sessionId, hash }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        console.warn(`[sync] No session found for file selection in ID: ${sessionId}`);
        return;
      }
  
      // ✅ First user's file sets the hash
      if (!session.fileHash) {
        session.fileHash = hash;
        console.log(`[sync] File hash set for session ${sessionId}: ${hash}`);
        return;
      }
  
      // ✅ Enforce file match
      if (session.fileHash !== hash) {
        console.warn(`[sync] Mismatched file hash from ${socket.id}. Expected: ${session.fileHash}, Got: ${hash}`);
        socket.emit('session:error', { error: 'Selected video does not match the host\'s file.' });
      }
    });
  }  