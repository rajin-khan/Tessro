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
    sessions.set(sessionId, session); // Save updated session

    console.log(`[session] ${name} (${socket.id}) joined session ${sessionId}`);
    socket.emit('session:joined', { sessionId });

    io.to(sessionId).emit('user:joined', { userId: socket.id, nickname: name });

    // Send full updated list
    io.to(sessionId).emit('session:participants', { participants: session.users });
  });

    /**
   * SESSION LEAVE
   */
    socket.on('session:leave', () => {
        const sessionId = socketToSessionMap.get(socket.id);
        if (!sessionId) return;
    
        const sessionData = sessions.get(sessionId);
        if (!sessionData) return;
    
        const wasHost = sessionData.host === socket.id;
    
        // Remove the user
        sessionData.users = sessionData.users.filter(u => u.id !== socket.id);
        socketToSessionMap.delete(socket.id);
        socket.leave(sessionId);
    
        if (wasHost) {
          console.log(`[session] Host left. Ending session ${sessionId}.`);
          sessions.delete(sessionId);
          io.to(sessionId).emit('session:host_disconnected', { message: 'Host left the session.' });
          io.socketsLeave(sessionId); // Force others to leave
          return;
        }
    
        if (sessionData.users.length === 0) {
          console.log(`[session] Last user left session ${sessionId}. Cleaning up.`);
          sessions.delete(sessionId);
          return;
        }
    
        // Update session and notify others
        sessions.set(sessionId, sessionData);
        io.to(sessionId).emit('user:left', { userId: socket.id });
        io.to(sessionId).emit('session:participants', { participants: sessionData.users });
    
        console.log(`[session] ${socket.id} left session ${sessionId}`);
      });    
}