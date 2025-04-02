import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerSessionHandlers } from './handlers/session.js';
import { registerSyncHandlers } from './handlers/sync.js';
import { registerChatHandlers } from './handlers/chat.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const httpServer = createServer(app);

delete process.env.DEBUG_URL;

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static files from client/dist
app.use(express.static(path.join(__dirname, '../../client/dist')));

// ✅ Health check route (optional)
app.get('/health', (req, res) => {
  res.send('Tessro Server is running!');
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  registerSessionHandlers(io, socket, sessions, socketToSessionMap);
  registerSyncHandlers(io, socket, sessions);
  registerChatHandlers(io, socket, sessions);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const sessionId = socketToSessionMap.get(socket.id);

    if (sessionId) {
      const sessionData = sessions.get(sessionId);

      if (sessionData) {
        sessionData.users = sessionData.users.filter(userId => userId !== socket.id);

        if (sessionData.host === socket.id) {
          sessions.delete(sessionId);
          io.to(sessionId).emit('session:host_disconnected', { message: 'Host disconnected, session ended.' });
          io.socketsLeave(sessionId);
        } else if (sessionData.users.length === 0) {
          sessions.delete(sessionId);
        } else {
          sessions.set(sessionId, sessionData);
          io.to(sessionId).emit('user:left', { userId: socket.id });

          const updatedParticipants = sessionData.users.map(id => ({
            id,
            nickname: sessionData.nicknames?.[id] || 'Guest'
          }));
          io.to(sessionId).emit('session:participants', { participants: updatedParticipants });
        }
      }

      socketToSessionMap.delete(socket.id);
    }
  });
});

// ✅ Fallback route for React SPA (must come *after* all handlers)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Tessro server listening on port ${PORT}`);
  console.log(`Allowing connections from origin: ${clientURL}`);
});