import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerSessionHandlers } from './handlers/session.js';
import { registerSyncHandlers } from './handlers/sync.js';
import { registerChatHandlers } from './handlers/chat.js';

const app = express();
const httpServer = createServer(app);

const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(httpServer, {
  cors: {
    origin: clientURL,
    methods: ["GET", "POST"]
  }
});

// In-memory store (swap with Redis later)
const sessions = new Map();
const socketToSessionMap = new Map();

app.get('/', (req, res) => {
  res.send('Tessro Server is running!');
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Register handlers
  registerSessionHandlers(io, socket, sessions, socketToSessionMap);
  registerSyncHandlers(io, socket, sessions);
  registerChatHandlers(io, socket, sessions);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const sessionId = socketToSessionMap.get(socket.id);

    if (!sessionId) return;

    const sessionData = sessions.get(sessionId);
    if (!sessionData) return;

    const wasHost = sessionData.host === socket.id;

    // Remove user from session
    sessionData.users = sessionData.users.filter(u => u.id !== socket.id);
    socketToSessionMap.delete(socket.id);

    if (wasHost) {
      console.log(`Host of session ${sessionId} disconnected. Deleting session.`);
      sessions.delete(sessionId);
      io.to(sessionId).emit('session:host_disconnected', { message: 'Host disconnected, session ended.' });
      io.socketsLeave(sessionId); // Force users to leave
      return;
    }

    if (sessionData.users.length === 0) {
      console.log(`Last user left session ${sessionId}. Deleting session.`);
      sessions.delete(sessionId);
      return;
    }

    // Update the session and notify others
    sessions.set(sessionId, sessionData);
    io.to(sessionId).emit('user:left', { userId: socket.id });
    io.to(sessionId).emit('session:participants', { participants: sessionData.users });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Tessro server listening on port ${PORT}`);
  console.log(`Allowing connections from origin: ${clientURL}`);
});