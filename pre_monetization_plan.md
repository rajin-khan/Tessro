# Tessro Pre-Monetization Plan

> **Goal:** Validate demand, build an audience, and gather data before launching Premium—without compromising Tessro's privacy-first values.

---

## Phase 1: Privacy-Respecting Analytics

### What to Track (Behavior Only, No PII)

| Metric | Purpose | Implementation |
|--------|---------|----------------|
| **Mode Usage** | Sync vs Stream popularity | Count per session, not per user |
| **Session Length** | Engagement signal | Aggregate buckets (< 30m, 30m-1h, 1h+) |
| **Session Size** | Feature demand | Participant count distributions |
| **Return Visitors** | Retention signal | Anonymous fingerprint (localStorage token) |
| **Feature Interaction** | UX insights | Which controls are used most |

### Implementation Approach

```
Client-side only, no server tracking:
- localStorage UUID (regenerated on clear, not linked to identity)
- Aggregate stats sent on session end (not real-time)
- No IP logging, no cookies, no third-party scripts
```

### Privacy Safeguards

- ❌ No email/name/identity tracking
- ❌ No cross-session user linking
- ❌ No third-party analytics (no Google Analytics, Mixpanel, etc.)
- ✅ All data aggregated before storage
- ✅ Open-source tracking code (users can verify)
- ✅ Easy opt-out toggle in settings

---

## Phase 2: Voluntary Support (Tip Jar)

### Placement Strategy

| Location | Design | Visibility |
|----------|--------|------------|
| **Footer** | Subtle "☕ Support Tessro" link | Always visible, low-pressure |
| **Post-Session** | "Enjoyed your watch party? 💜" | After 30+ min sessions only |
| **About/Credits** | Full support section | For curious users |

### Platform Options

| Platform | Fees | One-time | Recurring | Recommendation |
|----------|------|----------|-----------|----------------|
| **Ko-fi** | 0% (free tier) | ✅ | ✅ | Best for starting out |
| **Buy Me a Coffee** | 5% | ✅ | ✅ | More polished UI |
| **GitHub Sponsors** | 0% | ✅ | ✅ | If audience is dev-heavy |
| **LemonSqueezy** | ~5% | ✅ | ✅ | Future premium integration |

### Recommended Copy

```
Landing Footer:
"Love Tessro? Buy me a coffee ☕" → [Ko-fi link]

Post-Session (optional modal):
┌─────────────────────────────────────┐
│  Thanks for watching together! 🎬   │
│                                     │
│  Tessro is free and ad-free.        │
│  If you enjoyed it, consider        │
│  supporting development.            │
│                                     │
│  [☕ Buy me a coffee]  [Maybe later] │
└─────────────────────────────────────┘
(Show only after 30+ min sessions, max 1x per week per visitor)
```

### Success Metrics

- Any tips at all = validated willingness to pay
- Tip frequency vs session length correlation
- Tip messages (Ko-fi allows messages) = qualitative feedback

---

## Phase 3: Email Capture (Waitlist)

### Value Proposition

> "Get notified when new features drop + exclusive early supporter perks"

### Incentive Structure

| Tier | Benefit |
|------|---------|
| **Early Signup** | 50% off first year of Premium |
| **Referral Bonus** | Extra month free for each referral |
| **Founder's List** | First 100 signups → Lifetime 30% off |

### Implementation

```
Footer CTA:
┌──────────────────────────────────────────┐
│ 🚀 Premium is coming                     │
│                                          │
│ Voice chat, HD streaming, and more.      │
│ Early supporters get 50% off lifetime.   │
│                                          │
│ [Enter email] [Notify Me]                │
│                                          │
│ 🔒 No spam. Unsubscribe anytime.         │
└──────────────────────────────────────────┘
```

### Email Provider Options

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| **Buttondown** | 100 subs | Privacy-focused, simple |
| **Resend** | 3k emails/mo | Already in stack (magic links later) |
| **Loops** | 1k contacts | Product-led growth focus |

### Privacy Alignment

- Email stored encrypted (same as future premium accounts)
- Only used for: Feature announcements, Premium launch, Major updates
- Easy unsubscribe in every email
- No third-party sharing, ever

---

## Phase 4: Power User Feedback Loop

### Trigger Conditions

Show feedback prompt when user has:
- Hosted **3+ sessions** (not joined, hosted = invested user)
- OR spent **2+ hours** total in sessions
- AND hasn't been prompted in the last 30 days

### Survey Questions (Keep it Short: 3-5 questions max)

```
1. What do you mainly use Tessro for?
   [ ] Movie nights with friends
   [ ] Watch parties with online communities  
   [ ] Remote team activities
   [ ] Long-distance relationships
   [ ] Other: ___________

2. What would make Tessro more valuable to you? (Select all)
   [ ] Voice chat during sessions
   [ ] Higher quality streaming
   [ ] Subtitle syncing
   [ ] More participants (10+)
   [ ] Reactions/emojis
   [ ] Mobile app
   [ ] Other: ___________

3. Would you pay for premium features?
   [ ] Yes, definitely ($5/mo seems fair)
   [ ] Maybe, depends on features
   [ ] No, I'd only use free
   [ ] I'd prefer a one-time payment

4. (Optional) Anything else you'd like to tell us?
   [                    ]

5. (Optional) Email for follow-up/early access?
   [                    ]
```

### Implementation Options

| Tool | Why |
|------|-----|
| **Tally** | Free, privacy-friendly, beautiful forms |
| **Typeform** | Better UX, free tier limited |
| **In-app modal** | Custom, but more dev work |

### Feedback Analysis

Create a simple spreadsheet tracking:
- Feature request frequency (what do people actually want?)
- Willingness to pay % (is there a market?)
- Price sensitivity (one-time vs subscription preference)
- Use case distribution (who is the core audience?)

---

## Implementation Roadmap

### Phase 1: Quick Wins (Week 1-2)

| Task | Effort | Impact |
|------|--------|--------|
| Add Ko-fi button to footer | 1 hour | Validates willingness to pay |
| Create Tally feedback form | 1 hour | Gathers qualitative insights |
| Add "Premium Coming Soon" teaser | 2 hours | Builds anticipation |

### Phase 2: Waitlist (Week 2-3)

| Task | Effort | Impact |
|------|--------|--------|
| Set up Buttondown/Resend | 1 hour | Email infrastructure |
| Build email capture modal | 3 hours | Grows audience |
| Create "early supporter" landing | 2 hours | Conversion optimization |

### Phase 3: Analytics (Week 3-4)

| Task | Effort | Impact |
|------|--------|--------|
| Design privacy-safe tracking | 2 hours | Data architecture |
| Implement client-side metrics | 4 hours | Usage insights |
| Build simple dashboard | 3 hours | Decision making |

### Phase 4: Feedback Loop (Week 4+)

| Task | Effort | Impact |
|------|--------|--------|
| Implement session counter | 2 hours | Trigger condition |
| Build feedback prompt modal | 3 hours | User research |
| Set up analysis workflow | 1 hour | Insights extraction |

---

## Success Criteria

Before launching Premium, validate:

| Signal | Target | Status |
|--------|--------|--------|
| **Tip jar revenue** | Any amount | ⬜ |
| **Email signups** | 100+ subscribers | ⬜ |
| **Survey responses** | 50+ responses | ⬜ |
| **"Would pay" rate** | > 20% of respondents | ⬜ |
| **Top requested feature** | Clear winner emerges | ⬜ |
| **Session analytics** | Understand usage patterns | ⬜ |

---

## Messaging Guidelines

### Tone

- 🙌 Grateful, not desperate
- 🔒 Privacy-first, always
- 🎯 Honest about sustainability
- 💜 Community-focused

### Sample Copy

**Footer Tip Jar:**
> "Tessro is free, ad-free, and privacy-first. If you love it, [support development ☕](https://ko-fi.com/tessro)"

**Email Capture:**
> "Premium features are coming—voice chat, HD streaming, and more. Early supporters get 50% off. [Get notified →]"

**Feedback Prompt:**
> "You've hosted 3 watch parties! 🎉 Got 30 seconds to help shape Tessro's future? [Quick survey]"

---

## Privacy Commitment (Reiterated)

Even in pre-monetization phase:

- ✅ No tracking without consent
- ✅ No selling data, ever
- ✅ No dark patterns or guilt-tripping
- ✅ All features work without email
- ✅ Tip jar is purely voluntary
- ✅ Survey is skippable with no penalty

---

## Next Steps

1. **Immediate:** Add Ko-fi button to footer
2. **This week:** Create Tally survey form
3. **Next week:** Build email waitlist with early supporter perks
4. **Ongoing:** Monitor signals and iterate

---

*Last updated: January 2026*
