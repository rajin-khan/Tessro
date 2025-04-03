// client/src/services/socket.js
import { io } from 'socket.io-client';

// Ensure this URL points to your server (running on port 3001 by default)
const URL = import.meta.env.VITE_SERVER_URL;

export const socket = io(URL, {
  autoConnect: false // We will connect manually
});

// Optional: Log socket events for debugging
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});