// server/src/handlers/voice.js
export function registerVoiceHandlers(io, socket) {
    socket.on('voice:offer', ({ to, offer }) => {
      io.to(to).emit('voice:offer', { from: socket.id, offer });
    });
  
    socket.on('voice:answer', ({ to, answer }) => {
      io.to(to).emit('voice:answer', { from: socket.id, answer });
    });
  
    socket.on('voice:candidate', ({ to, candidate }) => {
      io.to(to).emit('voice:candidate', { from: socket.id, candidate });
    });
  
    socket.on('voice:ready', ({ sessionId }) => {
      socket.to(sessionId).emit('voice:ready', { userId: socket.id });
    });
  
    socket.on('voice:mute_status', ({ sessionId, muted }) => {
      socket.to(sessionId).emit('voice:mute_status', {
        userId: socket.id,
        muted,
      });
    });
  }  