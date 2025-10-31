import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

import { registerSessionHandlers } from './handlers/session.js';
import { registerSyncHandlers } from './handlers/sync.js';
import { registerChatHandlers } from './handlers/chat.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';

// Cloudflare TURN Configuration
const TURN_KEY_ID = process.env.CLOUDFLARE_TURN_KEY_ID;
const TURN_API_TOKEN = process.env.CLOUDFLARE_TURN_API_TOKEN;

if (!TURN_KEY_ID || !TURN_API_TOKEN) {
    console.warn('⚠️  WARNING: Cloudflare TURN credentials not configured. WebRTC may not work reliably.');
}

// Bandwidth monitoring - Hard limit: 1000GB/month (1TB = 1,073,741,824,000 bytes)
const MONTHLY_BANDWIDTH_LIMIT_BYTES = 1073741824000; // 1000 GB in bytes
let monthlyBandwidthUsed = 0;
let bandwidthResetDate = new Date();
bandwidthResetDate.setMonth(bandwidthResetDate.getMonth() + 1);
bandwidthResetDate.setDate(1); // First day of next month
bandwidthResetDate.setHours(0, 0, 0, 0);

// Reset bandwidth counter monthly
setInterval(() => {
    const now = new Date();
    if (now >= bandwidthResetDate) {
        console.log(`[Bandwidth] Resetting monthly bandwidth counter. Previous usage: ${(monthlyBandwidthUsed / 1073741824).toFixed(2)} GB`);
        monthlyBandwidthUsed = 0;
        bandwidthResetDate = new Date();
        bandwidthResetDate.setMonth(bandwidthResetDate.getMonth() + 1);
        bandwidthResetDate.setDate(1);
        bandwidthResetDate.setHours(0, 0, 0, 0);
        console.log(`[Bandwidth] Next reset scheduled for: ${bandwidthResetDate.toISOString()}`);
    }
}, 3600000); // Check every hour

// Track active connections for bandwidth estimation
const activeConnections = new Map(); // socketId -> { bytesReceived, bytesSent, lastUpdate }

// Helper function to estimate bandwidth usage (rough estimate based on connection duration)
// This is a conservative estimate. Actual Cloudflare usage will be tracked via their dashboard.
function estimateBandwidthUsage(socketId, estimatedMbps = 2) {
    // 2 Mbps is a conservative estimate for 720p video streaming
    // We track per-minute to estimate monthly usage
    const connection = activeConnections.get(socketId);
    if (!connection) return 0;
    
    const minutesActive = (Date.now() - connection.lastUpdate) / 60000;
    // Convert Mbps to bytes per minute: (Mbps * 1,000,000 / 8) * 60 seconds
    const bytesPerMinute = (estimatedMbps * 1000000 / 8) * 60;
    return bytesPerMinute * minutesActive;
}

// Add rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per window without delay
    delayMs: 500 // add 500ms delay per request after limit
  });
  app.use(speedLimiter);

const io = new Server(httpServer, {
  cors: {
    origin: clientURL,
    methods: ['GET', 'POST']
  }
});

const rootDir = path.join(__dirname, '../../client/dist');

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('Tessro Server is running!');
});

// === Cloudflare TURN Credentials API Endpoint ===
const turnLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 requests per 5 minutes per IP
    message: 'Too many credential requests, please try again later'
});

app.get('/api/turn-credentials', turnLimiter, async (req, res) => {
    try {
        // Check bandwidth limit before generating credentials
        const bandwidthUsedGB = monthlyBandwidthUsed / 1073741824;
        const bandwidthLimitGB = MONTHLY_BANDWIDTH_LIMIT_BYTES / 1073741824;
        
        if (monthlyBandwidthUsed >= MONTHLY_BANDWIDTH_LIMIT_BYTES) {
            console.error(`[TURN API] Bandwidth limit exceeded: ${bandwidthUsedGB.toFixed(2)} GB / ${bandwidthLimitGB} GB`);
            return res.status(429).json({
                error: 'Bandwidth limit reached',
                message: `Monthly bandwidth limit of ${bandwidthLimitGB} GB has been reached. Please wait until next month.`,
                bandwidthUsed: bandwidthUsedGB.toFixed(2),
                bandwidthLimit: bandwidthLimitGB
            });
        }

        // Return basic STUN if TURN is not configured
        if (!TURN_KEY_ID || !TURN_API_TOKEN) {
            console.log('[TURN API] Credentials not configured, returning public STUN only');
            return res.json({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });
        }

        // Generate short-lived TURN credentials from Cloudflare
        const ttl = 86400; // 24 hours (adjust based on your use case)
        
        const response = await fetch(
            `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_KEY_ID}/credentials/generate-ice-servers`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${TURN_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ttl })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TURN API] Cloudflare API error:', response.status, errorText);
            throw new Error(`Cloudflare API returned ${response.status}`);
        }

        const data = await response.json();
        console.log('[TURN API] Successfully generated Cloudflare TURN credentials');
        
        res.json(data);
        
    } catch (error) {
        console.error('[TURN API] Error generating credentials:', error.message);
        
        // Fallback to public STUN servers
        res.json({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });
    }
});

// Bandwidth monitoring endpoint (for debugging/admin)
app.get('/api/bandwidth-status', (req, res) => {
    const bandwidthUsedGB = monthlyBandwidthUsed / 1073741824;
    const bandwidthLimitGB = MONTHLY_BANDWIDTH_LIMIT_BYTES / 1073741824;
    const percentage = (monthlyBandwidthUsed / MONTHLY_BANDWIDTH_LIMIT_BYTES * 100).toFixed(2);
    
    res.json({
        bandwidthUsedGB: bandwidthUsedGB.toFixed(2),
        bandwidthLimitGB: bandwidthLimitGB,
        percentage: parseFloat(percentage),
        remainingGB: (bandwidthLimitGB - bandwidthUsedGB).toFixed(2),
        resetDate: bandwidthResetDate.toISOString(),
        activeConnections: activeConnections.size,
        status: monthlyBandwidthUsed >= MONTHLY_BANDWIDTH_LIMIT_BYTES ? 'LIMIT_EXCEEDED' : 'OK'
    });
});

app.use(express.static(rootDir));
app.use((req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

// In-memory session state
const sessions = new Map();
const socketToSessionMap = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Track connection for bandwidth monitoring
  activeConnections.set(socket.id, {
    bytesReceived: 0,
    bytesSent: 0,
    lastUpdate: Date.now(),
    estimatedMbps: 2 // Conservative estimate: 2 Mbps per connection
  });
  
  registerSessionHandlers(io, socket, sessions, socketToSessionMap);
  registerSyncHandlers(io, socket, sessions);
  registerChatHandlers(io, socket, sessions);
  
  socket.on('disconnect', () => {
    // Estimate bandwidth used by this connection before removing
    const connection = activeConnections.get(socket.id);
    if (connection) {
      const estimatedBytes = estimateBandwidthUsage(socket.id, connection.estimatedMbps);
      monthlyBandwidthUsed += estimatedBytes;
      const bandwidthUsedGB = monthlyBandwidthUsed / 1073741824;
      console.log(`[Bandwidth] Connection ${socket.id} closed. Estimated usage: ${(estimatedBytes / 1073741824).toFixed(4)} GB. Total this month: ${bandwidthUsedGB.toFixed(2)} GB`);
      activeConnections.delete(socket.id);
    }
    
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
  console.log(`✅ Tessro server listening on port ${PORT}`);
  if (TURN_KEY_ID && TURN_API_TOKEN) {
    console.log('✅ Cloudflare TURN service configured');
  } else {
    console.log('⚠️  Cloudflare TURN not configured - using public STUN only');
  }
  console.log(`📊 Bandwidth limit: ${(MONTHLY_BANDWIDTH_LIMIT_BYTES / 1073741824).toFixed(0)} GB/month`);
  console.log(`📅 Bandwidth reset scheduled for: ${bandwidthResetDate.toISOString()}`);
});