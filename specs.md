
# **Tessro**: Synchronized Video Playback Platform  
**_Real-time. Real fast._**

---

## Project Overview

**Tessro** is a web application that allows users to watch locally stored videos together in perfect synchronization, regardless of their location. The platform features real-time playback control synchronization and chat functionality, similar to Teleparty but for any video file stored locally on users' devices.

---

## Tech Stack

### Frontend
- **Framework**: React with Vite (for fast development and optimized builds)
- **Styling**: Tailwind CSS (utility-first CSS for rapid UI development)
- **State Management**: React Context API (simple state management without extra dependencies)
- **WebSocket Client**: Socket.IO Client (reliable real-time communication)
- **Video Player**: React Player (flexible player with extensive controls)

### Backend
- **Runtime**: Node.js with Express (robust server framework)
- **Real-time Communication**: Socket.IO (WebSocket implementation with fallbacks)
- **Deployment**: Vercel (seamless deployment with serverless functions)
- **Session Storage**: Serverless Redis (for scalable session management)

---

## Project Structure

```
tessro/
│
├── client/                  # Frontend React application
│   ├── public/
│   │   ├── favicon.svg      # App icon
│   │   └── assets/          # Static assets
│   │
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── App.jsx      # Main application component
│   │   │   ├── Header.jsx   # Application header
│   │   │   ├── VideoPlayer/ # Video player components
│   │   │   │   ├── index.jsx    # Main player component
│   │   │   │   ├── Controls.jsx # Custom player controls
│   │   │   │   └── Sync.jsx     # Sync status indicator
│   │   │   │
│   │   │   ├── Session/     # Session management components
│   │   │   │   ├── Create.jsx   # Create session form
│   │   │   │   ├── Join.jsx     # Join session form
│   │   │   │   └── Info.jsx     # Session information display
│   │   │   │
│   │   │   ├── Chat/        # Chat functionality
│   │   │   │   ├── index.jsx    # Chat container
│   │   │   │   ├── Messages.jsx # Message display
│   │   │   │   └── Input.jsx    # Message input
│   │   │   │
│   │   │   └── FileSelector.jsx # Local file selection
│   │   │
│   │   ├── contexts/        # React contexts
│   │   │   ├── SessionContext.jsx  # Session state management
│   │   │   └── VideoContext.jsx    # Video state management
│   │   │
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useSocket.js     # Socket.IO connection management
│   │   │   ├── useVideoSync.js  # Video synchronization logic
│   │   │   └── useChat.js       # Chat functionality
│   │   │
│   │   ├── services/        # Service modules
│   │   │   └── socket.js    # Socket.IO client configuration
│   │   │
│   │   ├── utils/           # Utility functions
│   │   │   ├── time.js      # Time formatting helpers
│   │   │   └── fileHandlers.js # File processing utilities
│   │   │
│   │   ├── App.css          # Global styles
│   │   ├── index.css        # Tailwind imports
│   │   └── main.jsx         # Application entry point
│   │
│   ├── .eslintrc.json       # ESLint configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Frontend dependencies
│
├── server/                  # Backend Node.js application
│   ├── api/                 # Vercel serverless functions
│   │   └── socket.js        # Socket.IO serverless implementation
│   │
│   ├── src/
│   │   ├── handlers/        # Event handlers
│   │   │   ├── session.js   # Session management handlers
│   │   │   ├── sync.js      # Synchronization event handlers
│   │   │   └── chat.js      # Chat message handlers
│   │   │
│   │   ├── services/        # Server services
│   │   │   └── redis.js     # Redis client for session storage
│   │   │
│   │   ├── utils/           # Utility functions
│   │   │   ├── id.js        # ID generation
│   │   │   └── validators.js # Input validation
│   │   │
│   │   └── index.js         # Server entry point
│   │
│   ├── vercel.json          # Vercel deployment configuration
│   └── package.json         # Backend dependencies
│
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

---

## Key Features Implementation

### 1. File Selection & Local Playback

Users select their local video files using the browser's File API, which creates a temporary URL for the video file that can be played in the video element. No actual file upload occurs - the file remains on the user's device.

```jsx
// FileSelector.jsx
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const videoURL = URL.createObjectURL(file);
    setVideoFile(videoURL);
    // Calculate file hash for verification
    calculateFileHash(file).then(hash => setFileHash(hash));
  }
};
```

---

### 2. Session Management

Sessions are created with a unique ID and password. The backend stores session information including connected users, current playback state, and authentication details.

```javascript
// server/src/handlers/session.js
const createSession = (socket, { password }) => {
  const sessionId = generateUniqueId();
  
  // Store session in Redis
  redisClient.hSet(`session:${sessionId}`, {
    host: socket.id,
    password: password,
    currentTime: 0,
    isPlaying: false,
    fileHash: null,
    createdAt: Date.now()
  });
  
  // Join socket room
  socket.join(sessionId);
  
  // Send session ID to client
  socket.emit('session:created', { sessionId });
};
```

---

### 3. WebSocket Communication

Socket.IO provides the real-time communication channel for synchronization events and chat messages.

```javascript
// server/src/index.js
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Register event handlers
  sessionHandlers(io, socket);
  syncHandlers(io, socket);
  chatHandlers(io, socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    handleDisconnect(io, socket);
  });
});
```

---

### 4. Video Synchronization

The core feature - playback events from one user are broadcast to all others in the session, keeping everyone in sync.

```jsx
// useVideoSync.js
const syncWithRemote = (data) => {
  const { action, timestamp, seekTime } = data;
  
  // Prevent event loops
  setSyncLock(true);
  
  // Handle different sync actions
  switch (action) {
    case 'play':
      if (Math.abs(playerRef.current.getCurrentTime() - timestamp) > 0.5) {
        playerRef.current.seekTo(timestamp);
      }
      playerRef.current.play();
      break;
      
    case 'pause':
      playerRef.current.pause();
      break;
      
    case 'seek':
      playerRef.current.seekTo(seekTime);
      break;
  }
  
  // Release lock after a short delay
  setTimeout(() => setSyncLock(false), 200);
};
```

---

### 5. Chat Functionality

Real-time chat allows users to communicate while watching.

```jsx
// Chat/index.jsx
const sendMessage = (message) => {
  if (!message.trim()) return;
  
  // Add message to local state
  addMessage({
    id: Date.now(),
    sender: 'me',
    text: message,
    timestamp: Date.now()
  });
  
  // Send to other users via socket
  socket.emit('chat:message', {
    sessionId,
    message,
    timestamp: Date.now()
  });
};
```

---

## Deployment Process

### Frontend Deployment (Vercel)

1. Push code to GitHub repository  
2. Connect repository to Vercel  
3. Configure build settings:
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `cd client && npm install`

---

### Backend Deployment (Vercel)

The backend uses Vercel's serverless functions to handle Socket.IO connections.

**Configuration in `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    { "src": "server/api/**/*.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/socket.io/(.*)", "dest": "server/api/socket.js" },
    { "src": "/(.*)", "dest": "client/dist/$1" }
  ]
}
```

---

## User Flow

1. **Host:**
   - Opens Tessro in browser
   - Selects local video file
   - Creates new session with password
   - Shares session ID and password with friends
   - Starts playback when ready

2. **Guest:**
   - Opens Tessro in browser
   - Selects matching local video file
   - Enters session ID and password
   - Joins synchronized playback
   - Can control playback and chat

---

## Next Steps After MVP

1. **WebRTC Implementation** - Add true peer-to-peer streaming for cases where guests don't have the file  
2. **User Accounts** - Add authentication for persistent user profiles  
3. **Advanced Sync Features** - Add subtitle synchronization and buffering indicators  
4. **Mobile Support** - Optimize for mobile browsers and consider native apps  

---

## Development & Running Locally

```bash
# Clone repository
git clone <repository-url>
cd tessro

# Install dependencies for client
cd client
npm install

# Start development server
npm run dev

# In another terminal, install dependencies for server
cd ../server
npm install

# Start server
npm run dev
```

---