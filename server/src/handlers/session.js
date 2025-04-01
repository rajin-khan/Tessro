import { generateSessionId } from '../utils/id.js';

/**
 * Registers Socket.IO event handlers for session management.
 */
export function registerSessionHandlers(io, socket, sessions, socketToSessionMap) {
  /**
   * Create Session
   */
  socket.on('session:create', ({ password, nickname }) => {
    const sessionId = generateSessionId();
    const name = nickname?.trim() || `Host${Math.floor(Math.random() * 1000)}`;

    const newSession = {
      host: socket.id,
      password: password || null,
      createdAt: Date.now(),
      users: [
        {
          id: socket.id,
          nickname: name,
        },
      ],
    };

    sessions.set(sessionId, newSession);
    socketToSessionMap.set(socket.id, sessionId);
    socket.join(sessionId);

    console.log(`[session] Created session ${sessionId} by ${name} (${socket.id})`);
    socket.emit('session:created', { sessionId });
    io.to(sessionId).emit('session:participants', { participants: newSession.users });
  });

  /**
   * Join Session
   */
  socket.on('session:join', ({ sessionId, password, nickname }) => {
    const session = sessions.get(sessionId);

    if (!session) {
      socket.emit('session:error', { error: 'Session not found.' });
      return;
    }

    if (session.password && session.password !== password) {
      socket.emit('session:error', { error: 'Incorrect password.' });
      return;
    }

    const name = nickname?.trim() || `Guest${Math.floor(Math.random() * 1000)}`;

    session.users.push({
      id: socket.id,
      nickname: name,
    });

    socketToSessionMap.set(socket.id, sessionId);
    socket.join(sessionId);
    sessions.set(sessionId, session);

    console.log(`[session] ${name} (${socket.id}) joined session ${sessionId}`);
    socket.emit('session:joined', { sessionId });

    io.to(sessionId).emit('user:joined', { userId: socket.id, nickname: name });
    io.to(sessionId).emit('session:participants', { participants: session.users });
  });

  /**
   * Leave Session
   */
  socket.on('session:leave', () => {
    const sessionId = socketToSessionMap.get(socket.id);
    if (!sessionId) return;

    const session = sessions.get(sessionId);
    if (!session) return;

    const wasHost = session.host === socket.id;

    // Remove user
    session.users = session.users.filter(u => u.id !== socket.id);
    socketToSessionMap.delete(socket.id);
    socket.leave(sessionId);

    if (wasHost) {
      console.log(`[session] Host (${socket.id}) left. Deleting session ${sessionId}`);
      sessions.delete(sessionId);
      io.to(sessionId).emit('session:host_disconnected', { message: 'Host left the session.' });
      io.socketsLeave(sessionId); // Disconnect all others
      return;
    }

    if (session.users.length === 0) {
      console.log(`[session] Last user left session ${sessionId}. Cleaning up.`);
      sessions.delete(sessionId);
      return;
    }

    sessions.set(sessionId, session);
    io.to(sessionId).emit('user:left', { userId: socket.id });
    io.to(sessionId).emit('session:participants', { participants: session.users });

    console.log(`[session] ${socket.id} left session ${sessionId}`);
  });
}