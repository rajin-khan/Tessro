// ✅ Updated server-side sync.js

export function registerSyncHandlers(io, socket, sessions) {
    socket.on('sync:action', ({ sessionId, action, timestamp, seekTime }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        console.warn(`[sync] No session found for ID: ${sessionId}`);
        return;
      }
  
      const user = session.users.find(u => u.id === socket.id);
      if (!user && socket.id !== session.host) {
        console.warn(`[sync] Unauthorized user tried to sync`);
        return;
      }
  
      socket.to(sessionId).emit('sync:action', { action, timestamp, seekTime });
    });
  
    socket.on('sync:fileSelected', ({ sessionId, hash }) => {
      const session = sessions.get(sessionId);
      if (!session) {
        console.warn(`[sync] No session found for file selection in ID: ${sessionId}`);
        return;
      }
  
      if (!session.fileHash) {
        session.fileHash = hash;
        console.log(`[sync] File hash set for session ${sessionId}: ${hash}`);
        socket.emit('sync:fileStatus', { status: 'matched' });
        return;
      }
  
      if (session.fileHash !== hash) {
        console.warn(`[sync] Mismatched file hash from ${socket.id}. Expected: ${session.fileHash}, Got: ${hash}`);
        socket.emit('sync:fileStatus', { status: 'mismatched' });
        return;
      }
  
      socket.emit('sync:fileStatus', { status: 'matched' });
    });
  }  