# Cloudflare TURN Integration Guide

Complete documentation for the Cloudflare TURN service integration in Tessro.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What Changed from Twilio](#what-changed-from-twilio)
3. [How It Works](#how-it-works)
4. [Architecture](#architecture)
5. [Setup & Configuration](#setup--configuration)
6. [New Features](#new-features)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Testing](#testing)

---

## Overview

Tessro migrated from Twilio TURN to **Cloudflare TURN** service for WebRTC peer-to-peer connections. This migration provides:

- ✅ **Cost Savings**: 87.5% cheaper than Twilio ($0.05/GB vs $0.40/GB)
- ✅ **Free Tier**: 1TB/month (1000GB) free bandwidth
- ✅ **Better Performance**: 330+ global edge locations
- ✅ **Automated Credential Management**: No manual updates every 24 hours
- ✅ **Built-in Protection**: DDoS protection and automatic scaling
- ✅ **Bandwidth Monitoring**: Hard limit enforcement to prevent overages

---

## What Changed from Twilio

### Before (Twilio)
- ❌ Hardcoded credentials in frontend code (`useWebRTC.js`)
- ❌ Manual credential updates every 24 hours
- ❌ Expensive: $0.40-$0.80 per GB
- ❌ Manual tracking of credential expiry timestamps
- ❌ No bandwidth monitoring or limits

### After (Cloudflare)
- ✅ Dynamic credential fetching from backend API
- ✅ Automatic credential generation (24-hour TTL, refreshed on-demand)
- ✅ Cost-effective: $0.05/GB after free tier (1TB/month free)
- ✅ Built-in bandwidth monitoring and hard limits
- ✅ Centralized credential management via backend
- ✅ Better error handling and fallback mechanisms

### Code Changes

**Frontend (`client/src/hooks/useWebRTC.js`):**
- Removed: Hardcoded `turnCredentials` object and `ICE_SERVERS` array
- Added: `fetchIceServers()` function that calls `/api/turn-credentials`
- Added: State management for dynamically fetched ICE servers

**Backend (`server/src/index.js`):**
- Added: Cloudflare TURN credentials API endpoint (`/api/turn-credentials`)
- Added: Bandwidth monitoring system (1000GB/month limit)
- Added: Connection tracking for bandwidth estimation
- Added: Rate limiting on TURN endpoint
- Added: Bandwidth status endpoint (`/api/bandwidth-status`)

**Configuration:**
- Added: Environment variables for Cloudflare credentials
- Added: `.env.example` template file
- Updated: `package.json` with `dotenv` dependency

---

## How It Works

### High-Level Flow

```
1. User opens app → Frontend loads
2. Frontend calls /api/turn-credentials on component mount
3. Backend checks bandwidth limit (blocks if exceeded)
4. Backend calls Cloudflare API to generate short-lived credentials
5. Backend returns ICE servers array to frontend
6. Frontend stores ICE servers in state
7. When WebRTC connection needed:
   - Creates RTCPeerConnection with fetched ICE servers
   - Uses STUN for NAT discovery (direct connection attempt)
   - Falls back to TURN for relaying (if direct connection fails)
```

### Detailed Component Flow

#### 1. Frontend Initialization
```javascript
// client/src/hooks/useWebRTC.js
useEffect(() => {
  fetchIceServers().then(servers => {
    setIceServers(servers);
    console.log('[WebRTC] ICE servers loaded:', servers.length, 'servers');
  });
}, []);
```

The `useWebRTC` hook fetches ICE servers when it initializes, before any peer connections are created.

#### 2. Backend Credential Generation
```javascript
// server/src/index.js
app.get('/api/turn-credentials', turnLimiter, async (req, res) => {
  // 1. Check bandwidth limit
  if (monthlyBandwidthUsed >= MONTHLY_BANDWIDTH_LIMIT_BYTES) {
    return res.status(429).json({ error: 'Bandwidth limit reached' });
  }
  
  // 2. Call Cloudflare API
  const response = await fetch(
    `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_KEY_ID}/credentials/generate-ice-servers`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ttl: 86400 }) // 24 hours
    }
  );
  
  // 3. Return ICE servers to frontend
  res.json(await response.json());
});
```

#### 3. WebRTC Connection Creation
```javascript
// Frontend creates RTCPeerConnection with fetched servers
const pc = new RTCPeerConnection({ iceServers });
```

The browser automatically:
- Tries STUN first (direct peer-to-peer connection)
- Falls back to TURN if NAT/firewall blocks direct connection
- Uses the credentials provided by Cloudflare for TURN authentication

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useWebRTC Hook                                      │   │
│  │  - Fetches ICE servers on mount                      │   │
│  │  - Stores in state                                   │   │
│  │  - Uses for RTCPeerConnection                        │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP GET
                         │ /api/turn-credentials
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/turn-credentials                               │   │
│  │  - Rate limiting (10 req/5min per IP)                │   │
│  │  - Bandwidth limit check                             │   │
│  │  - Cloudflare API call                               │   │
│  │  - Error handling + fallback                         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Bandwidth Monitor                                   │   │
│  │  - Tracks active connections                         │   │
│  │  - Estimates usage (2 Mbps per connection)           │   │
│  │  - Monthly reset (1st of each month)                 │   │
│  │  - Hard limit: 1000GB/month                          │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS POST
                         │ Bearer Token Auth
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare API                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TURN Key Management                                 │   │
│  │  - Validates credentials                             │   │
│  │  - Generates short-lived tokens                      │   │
│  │  - Returns ICE servers configuration                 │   │
│  │  - TTL: 24 hours                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Credential Request**: Frontend → Backend → Cloudflare
2. **Credential Response**: Cloudflare → Backend → Frontend
3. **WebRTC Connection**: Peer A ←→ STUN/TURN ←→ Peer B
4. **Bandwidth Tracking**: Backend monitors connection duration

---

## Setup & Configuration

### Prerequisites

- Cloudflare account (free tier works)
- Node.js installed
- Access to your Cloudflare dashboard

### Step 1: Create Cloudflare TURN Key

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to: **Your Account** → **Calls** → **TURN Keys**
3. Click **Create TURN Key**
4. Enter name: `tessro-production-turn`
5. **Copy both values** (you won't see them again!):
   - **Key ID (uid)** → `CLOUDFLARE_TURN_KEY_ID`
   - **API Token (key)** → `CLOUDFLARE_TURN_API_TOKEN`

### Step 2: Configure Environment Variables

1. Navigate to `server/` directory
2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add:
   ```env
   PORT=3001
   CLIENT_URL=http://localhost:5173
   
   CLOUDFLARE_TURN_KEY_ID=your_key_id_here
   CLOUDFLARE_TURN_API_TOKEN=your_api_token_here
   ```
4. Verify `.env` is in `.gitignore` (already configured)

### Step 3: Install Dependencies

```bash
cd server
npm install
```

### Step 4: Verify Setup

```bash
npm start
```

Look for:
```
✅ Tessro server listening on port 3001
✅ Cloudflare TURN service configured
📊 Bandwidth limit: 1000 GB/month
```

Test endpoint:
```
http://localhost:3001/api/turn-credentials
```

Expected response:
```json
{
  "iceServers": [
    {
      "urls": [
        "stun:stun.cloudflare.com:3478",
        "turn:turn.cloudflare.com:3478?transport=udp",
        "turn:turn.cloudflare.com:3478?transport=tcp",
        "turns:turn.cloudflare.com:5349?transport=tcp"
      ],
      "username": "xxxx...",
      "credential": "yyyy..."
    }
  ]
}
```

---

## New Features

### 1. Automatic Credential Management
- **No manual updates**: Credentials are generated on-demand
- **24-hour TTL**: Cloudflare credentials expire after 24 hours, but are automatically refreshed when needed
- **Fresh credentials**: Each peer connection can fetch new credentials if needed

### 2. Bandwidth Monitoring & Limits
- **Hard limit**: 1000GB/month enforced at the API level
- **Connection tracking**: Estimates bandwidth based on connection duration
- **Monthly reset**: Automatically resets on the 1st of each month
- **Status endpoint**: Check usage via `/api/bandwidth-status`

```javascript
// Check bandwidth status
GET /api/bandwidth-status

// Response
{
  "bandwidthUsedGB": "45.23",
  "bandwidthLimitGB": 1000,
  "percentage": 4.52,
  "remainingGB": "954.77",
  "resetDate": "2025-02-01T00:00:00.000Z",
  "activeConnections": 3,
  "status": "OK"
}
```

### 3. Rate Limiting
- **TURN endpoint protection**: 10 requests per 5 minutes per IP
- **Prevents abuse**: Protects against credential harvesting
- **Standard rate limits**: Existing rate limits on other endpoints remain

### 4. Enhanced Error Handling
- **Graceful fallback**: Falls back to public STUN if Cloudflare unavailable
- **Detailed logging**: Console logs help debug issues
- **Error responses**: Clear error messages for troubleshooting

### 5. Connection Lifecycle Tracking
- **Connection monitoring**: Tracks active WebRTC connections
- **Bandwidth estimation**: Estimates usage per connection (2 Mbps default)
- **Cleanup on disconnect**: Properly tracks bandwidth when connections close

---

## Maintenance

### Regular Tasks

#### Monthly
- ✅ **Check bandwidth usage**: Visit `/api/bandwidth-status` endpoint
- ✅ **Review Cloudflare dashboard**: Verify usage matches expectations
- ✅ **Monitor for errors**: Check server logs for API failures

#### Quarterly
- ✅ **Rotate TURN keys**: Create new TURN key, update `.env`, deploy
- ✅ **Review rate limits**: Adjust if needed based on usage patterns
- ✅ **Cost review**: Check Cloudflare billing (should be $0 if under 1TB/month)

### Key Maintenance Files

```
server/
├── .env                    # Credentials (NEVER commit)
├── .env.example           # Template for new setups
└── src/
    └── index.js           # Main server file with TURN logic
```

### Updating Credentials

1. Create new TURN key in Cloudflare dashboard
2. Update `server/.env`:
   ```env
   CLOUDFLARE_TURN_KEY_ID=new_key_id
   CLOUDFLARE_TURN_API_TOKEN=new_api_token
   ```
3. Restart server (or redeploy)
4. Old credentials will expire naturally (24-hour TTL)

### Monitoring Bandwidth

**Via API:**
```bash
curl http://localhost:3001/api/bandwidth-status
```

**Via Cloudflare Dashboard:**
- Navigate to: **Your Account** → **Calls** → **Analytics**
- View TURN usage metrics

**Via Server Logs:**
```
[Bandwidth] Connection socket_123 closed. Estimated usage: 0.0234 GB. Total this month: 45.23 GB
```

### Troubleshooting Common Issues

#### Issue: "Cloudflare TURN not configured"
**Solution:** Check `.env` file exists and has correct variable names (case-sensitive)

#### Issue: "Bandwidth limit reached" (429 error)
**Solution:** 
- Check usage: `GET /api/bandwidth-status`
- Wait until next month for reset, OR
- Consider upgrading Cloudflare plan if consistently exceeding 1TB

#### Issue: "Cloudflare API returned 401"
**Solution:** API token is invalid/expired. Create new TURN key and update `.env`

#### Issue: "Cloudflare API returned 403"
**Solution:** TURN key doesn't have correct permissions. Verify in Cloudflare dashboard

#### Issue: WebRTC connections failing
**Solution:**
1. Check browser console for WebRTC errors
2. Verify `/api/turn-credentials` returns valid response
3. Test with public STUN servers (if Cloudflare fails, fallback should work)
4. Check network/firewall blocking ports 3478, 5349, 443

---

## Testing

### Quick Test Checklist

- [ ] Server starts without errors
- [ ] `/api/turn-credentials` returns valid JSON
- [ ] Frontend fetches credentials on load
- [ ] Browser console shows: `[WebRTC] Successfully fetched Cloudflare TURN credentials`
- [ ] Stream Mode works (host can stream to guest)
- [ ] Bandwidth tracking works (check `/api/bandwidth-status`)

### Full Integration Test

1. **Start servers:**
   ```bash
   # Terminal 1: Backend
   cd server && npm start
   
   # Terminal 2: Frontend
   cd client && npm run dev
   ```

2. **Test WebRTC:**
   - Open two browser windows (or incognito)
   - Window 1: Create session, switch to Stream Mode, select video
   - Window 2: Join session
   - Verify guest sees host's stream

3. **Check logs:**
   - Browser console: Look for WebRTC connection logs
   - Server console: Look for bandwidth tracking logs

4. **Monitor bandwidth:**
   - Visit: `http://localhost:3001/api/bandwidth-status`
   - Verify usage increases after connections

### Testing TURN Server Directly

Use [WebRTC Trickle ICE tool](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/):

1. Open the tool in browser
2. Click "Remove Server", then "Add Server"
3. Get credentials from: `http://localhost:3001/api/turn-credentials`
4. Enter TURN URI: `turns:turn.cloudflare.com:5349`
5. Enter username and credential from API response
6. Click "Add Server", then "Gather candidates"
7. **Success indicators:**
   - See `srflx` candidates (STUN reflexive)
   - See `relay` candidates (TURN relay) ← **This proves TURN works!**

---

## Security Best Practices

### ✅ DO:
- Store credentials in `.env` file only
- Add `.env` to `.gitignore` (already done)
- Rotate TURN keys periodically (every 3-6 months)
- Use different keys for dev/staging/production
- Monitor bandwidth usage regularly
- Set up Cloudflare billing alerts

### ❌ DON'T:
- Commit `.env` files to git
- Share credentials in chat/email/PRs
- Hardcode credentials in source code
- Use same keys across environments
- Ignore bandwidth limit warnings

---

## Cost Management

### Free Tier Limits
- **1TB/month free**: First 1000GB included
- **After free tier**: $0.05 per GB
- **Estimated monthly cost**: $0 (if under 1TB)

### Usage Estimation

**Conservative estimate**: 2 Mbps per connection

**Example scenarios:**
- 1-hour video call (2 participants): ~900 MB
- 100 such calls/month: ~90 GB (well within free tier)
- 1000 such calls/month: ~900 GB (still within free tier)
- 1200 such calls/month: ~1080 GB (would cost ~$4/month)

### Monitoring Costs

1. **Server-side tracking**: Check `/api/bandwidth-status` regularly
2. **Cloudflare dashboard**: View accurate usage in dashboard
3. **Set alerts**: Configure billing alerts in Cloudflare (90% threshold recommended)

### Optimizing Usage

- **Prefer direct connections**: TURN is only used when direct peer-to-peer fails
- **Lower video quality**: Reduces bandwidth (adjust in video capture settings)
- **Monitor patterns**: Identify high-usage users/times
- **Implement user limits**: Consider per-user bandwidth caps if needed

---

## Architecture Decisions

### Why Backend API Instead of Direct Frontend Calls?

1. **Security**: Keep API tokens server-side only
2. **Rate limiting**: Centralized control
3. **Bandwidth monitoring**: Track usage before issuing credentials
4. **Error handling**: Centralized fallback logic
5. **Caching**: Could add credential caching in future

### Why 24-Hour TTL?

- **Balance**: Long enough to avoid frequent API calls, short enough for security
- **Flexibility**: Can be adjusted if needed (change `ttl` value in code)
- **Auto-refresh**: Frontend can fetch new credentials when needed

### Why Estimate Bandwidth Instead of Real-time Tracking?

- **Simpler**: No need for complex WebRTC statistics API
- **Sufficient**: Estimation is conservative, ensures we stay under limit
- **Performant**: Doesn't impact WebRTC connection performance
- **Accurate enough**: Cloudflare dashboard provides real usage

---

## Future Enhancements

Potential improvements for the future:

1. **Credential caching**: Cache credentials server-side to reduce API calls
2. **Real-time bandwidth tracking**: Use WebRTC statistics API for accurate tracking
3. **Per-user limits**: Implement individual user bandwidth caps
4. **Usage analytics**: Dashboard showing bandwidth trends
5. **Automatic key rotation**: Automated credential rotation system
6. **Multi-region support**: Use different TURN keys for different regions

---

## Support & Resources

- **Cloudflare API Docs**: https://developers.cloudflare.com/api/
- **Cloudflare TURN Docs**: https://developers.cloudflare.com/calls/
- **WebRTC Samples**: https://webrtc.github.io/samples/
- **MDN WebRTC Guide**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

---

## Migration Notes

For reference, the migration from Twilio included:

- ✅ Removed hardcoded Twilio credentials
- ✅ Removed `turnCredentials` export from `useWebRTC.js`
- ✅ Updated `ServerStatusTimer.jsx` to not rely on hardcoded timestamps
- ✅ Added backend API endpoint for credential management
- ✅ Implemented bandwidth monitoring system
- ✅ Added environment variable configuration
- ✅ Updated documentation and README

All Twilio-specific code has been removed. The system now exclusively uses Cloudflare TURN.

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Compatible with**: Cloudflare Realtime API v1

