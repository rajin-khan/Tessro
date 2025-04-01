import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerSessionHandlers } from './handlers/session.js';
import { registerSyncHandlers } from './handlers/sync.js'; // ✅ Sync handler added

const app = express();
const httpServer = createServer(app);

const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(httpServer, {
  cors: {
    origin: clientURL,
    methods: ["GET", "POST"]
  }
});

// In-memory storage (will move to Redis later)
const sessions = new Map();             // sessionId => { host, users, etc. }
const socketToSessionMap = new Map();   // socket.id => sessionId

// Optional test route
app.get('/', (req, res) => {
  res.send('Tessro Server is running!');
});

// Socket.IO connection logic
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Register per-socket event handlers
  registerSessionHandlers(io, socket, sessions, socketToSessionMap);
  registerSyncHandlers(io, socket, sessions); // ✅ Sync support activated
  // registerChatHandlers(io, socket, sessions); // Later...

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const sessionId = socketToSessionMap.get(socket.id);

    if (!sessionId) return;

    const sessionData = sessions.get(sessionId);
    if (!sessionData) return;

    sessionData.users = sessionData.users.filter(userId => userId !== socket.id);
    console.log(`User ${socket.id} removed from session ${sessionId}. Users left: ${sessionData.users.length}`);

    if (sessionData.host === socket.id) {
      console.log(`Host ${socket.id} left session ${sessionId}. Deleting session.`);
      sessions.delete(sessionId);
      io.to(sessionId).emit('session:host_disconnected', { message: 'Host disconnected, session ended.' });
      io.socketsLeave(sessionId);
    } else if (sessionData.users.length === 0) {
      console.log(`Last user left session ${sessionId}. Deleting session.`);
      sessions.delete(sessionId);
    } else {
      sessions.set(sessionId, sessionData); // update in-memory
      io.to(sessionId).emit('user:left', { userId: socket.id });
    }

    socketToSessionMap.delete(socket.id);
  });
});

// Server startup
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Tessro server listening on port ${PORT}`);
  console.log(`Allowing connections from origin: ${clientURL}`);
});