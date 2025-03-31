import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerSessionHandlers } from './handlers/session.js';

const app = express();
const httpServer = createServer(app);

// Configure Socket.IO
// Make sure the client origin matches your Vite dev server port (default 5173)
const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(httpServer, {
  cors: {
    origin: clientURL,
    methods: ["GET", "POST"]
  }
});

// In-memory storage (replace with Redis later)
const sessions = new Map(); // Stores session data { sessionId -> { host: socket.id, ... } }
const socketToSessionMap = new Map(); // Stores { socket.id -> sessionId } for easy lookup on disconnect

// Basic HTTP route (optional test)
app.get('/', (req, res) => {
  res.send('Tessro Server is running!');
});

// Socket.IO connection listener
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Register event handlers for this socket connection
  // Pass the shared state maps to the handler registration function
  registerSessionHandlers(io, socket, sessions, socketToSessionMap);
  // registerSyncHandlers(io, socket, sessions); // Add later
  // registerChatHandlers(io, socket, sessions); // Add later

  // Disconnect listener
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const sessionId = socketToSessionMap.get(socket.id);

    if (sessionId) {
      console.log(`Socket ${socket.id} was in session ${sessionId}`);
      const sessionData = sessions.get(sessionId);

      if (sessionData) {
         // Remove the disconnected user from the session's user list
         sessionData.users = sessionData.users.filter(userId => userId !== socket.id);
         console.log(`User ${socket.id} removed from session ${sessionId}. Remaining users: ${sessionData.users.length}`);

         // Basic cleanup: If the host disconnects, delete the session for now
         // More robust logic needed later (e.g., assign new host)
         if (sessionData.host === socket.id) {
            console.log(`Host of session ${sessionId} disconnected. Deleting session.`);
            sessions.delete(sessionId);
            // Optionally inform remaining users the host left / session ended
            io.to(sessionId).emit('session:host_disconnected', { message: 'Host disconnected, session ended.' });
            // Force remaining sockets in the room to leave
            io.socketsLeave(sessionId);
         } else if (sessionData.users.length === 0) {
             // If the last user leaves (and wasn't the host somehow), clean up
             console.log(`Last user left session ${sessionId}. Deleting session.`);
             sessions.delete(sessionId);
         } else {
             // Update the session data if only a regular user left
             sessions.set(sessionId, sessionData);
             // Optionally inform others someone left
             io.to(sessionId).emit('user:left', { userId: socket.id });
         }
      }
      // Clean up the socket -> session mapping
      socketToSessionMap.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001; // Default port for the server
httpServer.listen(PORT, () => {
  console.log(`Tessro server listening on port ${PORT}`);
  console.log(`Allowing connections from origin: ${clientURL}`);
});