import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import { registerSessionHandlers } from './handlers/session.js';
import { registerSyncHandlers } from './handlers/sync.js';
import { registerChatHandlers } from './handlers/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(httpServer, {
  cors: {
    origin: clientURL,
    methods: ['GET', 'POST']
  }
});

// Serve static files from the client build
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/health', (req, res) => {
  res.send('Tessro Server is running!');
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// In-memory session state
const sessions = new Map();
const socketToSessionMap = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  registerSessionHandlers(io, socket, sessions, socketToSessionMap);
  registerSyncHandlers(io, socket, sessions);
  registerChatHandlers(io, socket, sessions);

  socket.on('disconnect', () => {
    const sessionId = socketToSessionMap.get(socket.id);
    if (sessionId) {
      const sessionData = sessions.get(sessionId);
      if (sessionData) {
        sessionData.users = sessionData.users.filter(userId => userId !== socket.id);
        if (sessionData.host === socket.id) {
          sessions.delete(sessionId);
          io.to(sessionId).emit('session:host_disconnected', { message: 'Host disconnected.' });
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

httpServer.listen(PORT, () => {
  console.log(`Tessro server listening on port ${PORT}`);
});
