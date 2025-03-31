// server/src/handlers/session.js
import { generateSessionId } from '../utils/id.js';

/**
 * Registers Socket.IO event handlers for session management.
 * Handles session creation and joining with optional password validation.
 */
export function registerSessionHandlers(io, socket, sessions, socketToSessionMap) {
  /**
   * SESSION CREATE
   */
  socket.on('session:create', ({ password }) => {
    const sessionId = generateSessionId();

    sessions.set(sessionId, {
      host: socket.id,
      password: password || null,
      createdAt: Date.now(),
      users: [socket.id]
    });

    socketToSessionMap.set(socket.id, sessionId);
    socket.join(sessionId);

    console.log(`[session] Created session ${sessionId} by host ${socket.id}`);
    socket.emit('session:created', { sessionId });
  });

  /**
   * SESSION JOIN
   */
  socket.on('session:join', ({ sessionId, password }) => {
    const sessionData = sessions.get(sessionId);

    if (!sessionData) {
      socket.emit('session:error', { error: 'Session not found.' });
      console.warn(`[session] Join failed: Session ${sessionId} not found.`);
      return;
    }

    // Check password match
    if (sessionData.password && sessionData.password !== password) {
      socket.emit('session:error', { error: 'Incorrect password.' });
      console.warn(`[session] Join failed: Incorrect password for session ${sessionId}`);
      return;
    }

    // Join socket to the session
    sessionData.users.push(socket.id);
    socketToSessionMap.set(socket.id, sessionId);
    socket.join(sessionId);
    sessions.set(sessionId, sessionData); // Update session

    console.log(`[session] ${socket.id} joined session ${sessionId}`);
    socket.emit('session:joined', { sessionId });
    io.to(sessionId).emit('user:joined', { userId: socket.id });
  });
}
