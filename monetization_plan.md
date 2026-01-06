# Tessro Monetization Plan

## Pricing

| Plan | Price | Per Month |
|------|-------|-----------|
| **Monthly** | $4.99/mo | $4.99 |
| **Yearly** | $34.99/yr | $2.92 (42% off) |

**Payment Provider:** LemonSqueezy

---

## Feature Matrix

| Feature | Free | Premium |
|---------|------|---------|
| **Sync Mode** | ✅ Unlimited | ✅ Unlimited |
| **Stream Mode** | ❌ | ✅ |
| **Voice Channels** | ❌ | ✅ |
| **Participants** | 4 max | 10 max |
| **Ads** | ❌ None | ❌ None |
| **Account Required** | Optional | Required |

---

## Account System

- **Free users:** Anonymous by default, optional email account
- **Premium users:** Email required (magic link authentication)
- **Auth flow:** Email → magic link → 30-day session
- **Database:** Store email (encrypted) + subscription status only

---

## Technical Implementation

### Server Requirements
- PostgreSQL/Supabase for user + subscription data
- LemonSqueezy webhook for subscription events
- Magic link email via Resend
- Socket.io middleware for premium validation

### Premium Gates
1. **Stream mode toggle** — Server rejects non-premium
2. **Voice channels** — Feature hidden/disabled for free
3. **Participant limit** — Server enforces 4 (free) vs 10 (premium)

### API Endpoints
```
POST /api/auth/magic-link      → Send login email
GET  /api/auth/verify/:token   → Verify token, create session
POST /api/webhook/lemonsqueezy → Subscription events
GET  /api/user/status          → Check premium status
```

---

## Privacy Pledge

- Free users: Zero data stored
- Premium users: Email only (encrypted), login + billing purpose only
- No analytics, no tracking, no third-party data sharing
- Session/chat data: Ephemeral, never persisted
