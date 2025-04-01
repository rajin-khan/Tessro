import { generateSessionId } from '../utils/id.js';

/**
 * Registers Socket.IO event handlers for session management.
 * Handles session creation and joining with optional password and nickname support.
 */
export function registerSessionHandlers(io, socket, sessions, socketToSessionMap) {
  /**
   * SESSION CREATE
   */
  socket.on('session:create', ({ password, nickname }) => {
    const sessionId = generateSessionId();
    const name = nickname?.trim() || `Host${Math.floor(Math.random() * 1000)}`;

    sessions.set(sessionId, {
      host: socket.id,
      password: password || null,
      createdAt: Date.now(),
      users: [
        {
          id: socket.id,
          nickname: name,
        },
      ],
    });

    socketToSessionMap.set(socket.id, sessionId);
    socket.join(sessionId);

    console.log(`[session] Created session ${sessionId} by ${name} (${socket.id})`);
    socket.emit('session:created', { sessionId });
  });

  /**
   * SESSION JOIN
   */
  socket.on('session:join', ({ sessionId, password, nickname }) => {
    const session = sessions.get(sessionId);

    if (!session) {
      socket.emit('session:error', { error: 'Session not found.' });
      console.warn(`[session] Join failed: Session ${sessionId} not found.`);
      return;
    }

    if (session.password && session.password !== password) {
      socket.emit('session:error', { error: 'Incorrect password.' });
      console.warn(`[session] Join failed: Incorrect password for session ${sessionId}`);
      return;
    }

    const name = nickname?.trim() || `Guest${Math.floor(Math.random() * 1000)}`;

    // Add to session
    session.users.push({
      id: socket.id,
      nickname: name,
    });

    socketToSessionMap.set(socket.id, sessionId);
    socket.join(sessionId);
    sessions.set(sessionId, session); // Update the session

    console.log(`[session] ${name} (${socket.id}) joined session ${sessionId}`);
    socket.emit('session:joined', { sessionId });

    io.to(sessionId).emit('user:joined', { userId: socket.id, nickname: name });
  });
}