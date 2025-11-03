### 🧠 Notion Trade Journal Bridge
*A smart, voice-enabled journaling and AI performance assistant for traders — automatically syncing trades, journaling insights, and reviewing your trading behaviour.*


---

## 1) Vision & Mission
Trading success depends on consistency, discipline, and reflection — but most traders skip journaling because it’s time-consuming.  
Notion Trade Journal Bridge removes that friction by connecting trading platforms (like Tradovate, NinjaTrader, and others) directly to Notion, automatically logging trades and voice journals, and using AI to review, coach, and summarize performance.

**Goal:** Make journaling effortless, insightful, and consistent — turning raw trading data into human feedback and growth.

---

## 2) Core Problem It Solves
- Manual journaling eats time and introduces errors.  
- No unified way to connect trades from multiple brokers to Notion.  
- Traders struggle to reflect consistently or learn from mistakes.  
- Existing tools (TraderSync, TradesViz) are data-heavy, not habit-driven.

**Our approach:** Automation + AI reflection = fast, human, habit-forming trade journaling.

---

## 3) High-Level User Outcomes
| Goal | Description |
|------|-------------|
| 🧾 **Effortless Journaling** | Automatically logs trades, notes, voice reflections into Notion. |
| 🧠 **AI Feedback** | Personalized analysis on what went right/wrong daily/weekly. |
| 🗓️ **Weekly Summary Reports** | Auto-generated Notion summary with insights and trends. |
| ⚖️ **Rule Consistency Check** | Compares behaviour vs. user-defined rules; flags breaks. |
| 🎙️ **Voice-First Experience** | Speak thoughts; AI cleans speech; quick edit → save. |
| 🔒 **Trust & Privacy** | Secure API connections, encryption, minimal storage, control. |

---

## 4) Tech Stack (MVP and Future-Ready)
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js (React) | Web dashboard, responsive UI, setup wizard |
| **Styling/UI** | Tailwind CSS / shadcn UI | Fast modern components |
| **Backend** | Node.js (Express or Fastify) | Auth, API calls, scheduling, sync |
| **Database** | Supabase (Postgres + Auth) | Users, connections, mappings, logs |
| **Integrations** |  |  |
| ↳ **Broker APIs** | Tradovate (start), NinjaTrader (next), MT4/5 (later) | Fetch trade data |
| ↳ **Notion API** | Official SDK | Create/update pages & databases |
| ↳ **AI Layer** | OpenAI GPT / Anthropic | Reflections, summaries, rule-check |
| **Voice Processing** | Whisper API or Speechmatics | Speech → clean text |
| **Hosting/Deployment** | Vercel (frontend) + Render/Fly.io (backend) | Quick deploy, scale |
| **Job Scheduling** | Cron/queue worker | Regular syncs + weekly reports |
| **Monitoring** | Logs + error webhooks (Logtail/Posthog) | Health, analytics |
| **Storage (files)** | Supabase Storage | Screenshots & attachments with RLS |

> ⚙️ Light and modular — MVP-friendly, scalable as traction grows.

---

## 5) User Flows (Simplified)
1. **Onboarding:**  
   Sign up → Connect Broker → Credential consent (what we store, encryption, revocation) → Connect Notion → Pick Template → Auto-Mapping → Confirm → Test Sync.

2. **Daily Flow:**  
   Trades auto-sync → Dashboard → Add quick journal (voice/text) → Upload screenshots (optional) → Everything pushed to Notion.

3. **AI Review Flow:**  
   Daily/weekly AI analyzes outcomes, journals, and rule adherence → Generates insights → Post to Notion Weekly Review.

---

## 6) Core Features (Expanded)

### 6.1. Broker + Notion Integration
- Securely connect broker(s) and Notion via OAuth or API keys.  
- Detect user’s Notion databases; allow template selection.  
- Auto-map broker fields (Symbol, Side, Entry/Exit, P&L, etc.) to Notion columns.  
- Users can adjust or save mapping presets.

### 6.2. Trade Journaling (Pre, Live, Post)
- Pre-Market: Plan, mindset, bias, setups to watch.  
- Live Trade: Emotional state, adjustments, live thoughts.  
- Post-Trade: Reflection, review, lessons learned, rating.  
- Journals linked to trade IDs for full context.

Voice Integration:
- Tap mic → speak → AI cleans speech → display → user edits/saves.  
- Transcript saved to Notion; raw audio deleted after successful transcription (details in §7.2).

### 6.3. Manual Add + CSV Import (Core)
- Manually log trades when outside connected brokers.  
- CSV Import from any broker/export.
  - Column-mapping UI; presets per broker/export type.  
  - Dedup by Trade ID + timestamp tolerance; preview + validate before import.  
  - Imported trades behave like API trades (journaling links, AI review, weekly summaries).

### 6.4. AI Review of Trades
Goal: Turn data into coaching feedback.
- Example outputs:
  - “You closed early on 3 trades that met your 2R target.”
  - “You traded outside plan twice — both after a losing day.”
  - “Average risk-to-reward improved by 0.4 since last week.”
- Checks:
  - Emotional tone across journals.
  - Patterns in timing, size, rule breaks.
  - P&L consistency vs. plan.
- Output: Friendly summary; optionally posted into Notion “Weekly Review”.

### 6.5. Weekly Summary Reports
- Auto report with: trade count, win rate, R/R, common patterns, emotional themes, key AI insight.  
- View in dashboard or push to Notion weekly page.

### 6.6. Trading Rules & Strategy Cross-Check
User sets rules (e.g., “Only trade 9–11 AM,” “Risk ≤2%/trade”).  
AI monitors journals + trades; flags violations with impact (e.g., “Rule breaks caused −3.2R this week”).

### 6.7. Screenshots & Attachments
- Purpose: Attach chart/trade screenshots to trades and journals; sync to Notion.
- Sources: Upload, paste from clipboard, drag-and-drop.
- Storage + linking:
  - Supabase Storage bucket `attachments` with RLS; encrypted at rest.  
  - Link via `attachments` table to `trade_id` or `journal_entry_id`.  
  - Create Notion file/image blocks with caption + metadata (symbol, timeframe, trade ID).
- Formats/limits:
  - png, jpg/jpeg, webp; max 10 MB/file; up to 10 files per trade/journal (configurable).  
  - Client-side compress to webp when >3 MB; keep original if user opts out (configurable).
- UX:
  - Inline previews, lightbox, captions, tags (“entry”, “exit”, “HTF context”).  
  - Batch upload, progress, retry.
- AI (optional): Suggest tags from filename/caption. Images not sent to AI by default.
- Dedup: SHA-256 fingerprint to avoid duplicates across retries.
- Notion sync:
  - Upload → generate signed URL → insert Notion file blocks referencing URL.  
  - Store Notion block IDs for idempotent updates/deletes.
- Deletion:
  - Deleting in app removes Supabase object + Notion block; retries if partial failure.

### 6.8. Authentication & Accounts (Password + Google Authenticator)
- Account auth
  - Email + password using Supabase Auth (email/password) as the identity provider.
  - Minimal, practical UI with Next.js + Tailwind; no frills.
- Two‑factor (TOTP)
  - Google Authenticator (RFC 6238) via Supabase Auth MFA (TOTP factors).
  - Flows: enroll (QR + secret), verify on sign‑in, recovery with backup codes.
- Session
  - HttpOnly cookies; short access token TTL, rolling refresh.
  - Guard all app routes behind server checks; redirect to sign‑in when unauthenticated.
- Passwords
  - Managed by Supabase Auth with modern password hashing (argon2/bcrypt per provider default). No plaintext ever.
---

### 6.9. TradingView Dual Timeframe Capture (New Feature)
- Purpose: Capture two TradingView screenshots per request (1H and 5m) with consistent zoom, store privately, and render in the app.
- Modes:
  - Mode A (primary): Local Browser Extension captures from a logged‑in session so paid/invite‑only indicators appear.
  - Mode B (fallback): Self‑hosted Playwright service screenshots a view‑only layout; labeled “no private studies”.
- Storage & DB: Supabase Storage bucket `captures` (private) with per‑user prefixes; tables for `captures`, `capture_images`, `devices`, `layouts`, and `capture_events` with RLS.
- UI: Capture form (symbol, TF chips 1H/5m, zoom preset), live status, gallery with filters, detail page with metadata + “Open in TV” and “Re‑capture”.
- Link: See full spec in `./TradingViewCapture.md`.

---

## 7) Security & Privacy

### 7.1 Credential Handling (Brokers & Notion)
- Acquisition:
  - User provides credentials via OAuth or API key in onboarding.  
  - Request least-privilege scopes (read-only trade history).
- Storage:
  - Encrypted at rest using Supabase Postgres with pgsodium (row-level AEAD).  
  - Encryption keys via Supabase secrets; never shipped to client.  
  - RLS: user can only access their connection rows.
- Access:
  - Decrypt server-side at call time only; no plaintext persisted; never exposed to browser.
- Refresh, Rotation, Revocation:
  - Auto-refresh OAuth tokens where supported; fallback to “Reconnect” on expiry.  
  - Rotation via “Reconnect.”  
  - “Disconnect” revokes at broker (if supported) and deletes encrypted tokens immediately.
- Monitoring:
  - Minimal, non-sensitive metadata logging (no secrets) for ≤48h to debug auth/rate limits.

Schema sketch:
```sql
create table broker_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  broker text not null,
  access_token_enc bytea not null,
  refresh_token_enc bytea,
  expires_at timestamptz,
  scopes text[],
  created_at timestamptz default now(),
  revoked_at timestamptz
);
-- RLS: user_id = auth.uid()
```

### 7.2 Data Retention & Deletion (Voice, Transcripts, Trades)
- Raw audio:
  - Delete immediately after successful transcription.  
  - If retries needed, retain ≤24h, then purge.
- Transcripts:
  - Notion is system of record; write directly to Notion.  
  - Ephemeral server cache for operational retries ≤24h; purge after.
- Trade data:
  - Store only normalized records needed for mapping/journaling.  
  - Raw broker fills deleted once synced/normalized.
- Screenshots/attachments:
  - Persist until user deletes; short-lived signed URLs (≤15 min) minted on access.
- Logs/metadata:
  - Minimal, non-content request metadata ≤48h; purge after.
- User controls:
  - “Delete all my data” wipes in-flight caches and app-side normalized trade data.  
  - “Disconnect” removes broker tokens and stops sync.

### 7.3 Authentication Security (TOTP + Password)
- MFA factors
  - Use Supabase Auth built‑in TOTP; secrets stored only inside Supabase Auth schemas.
  - Backup codes stored hashed (one‑way) in app DB if used.
- DB schema (app tables)
```sql
create table user_security (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mfa_enrolled boolean not null default false,
  last_mfa_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table user_backup_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null, -- store salted hash, never plaintext
  used_at timestamptz,
  created_at timestamptz default now()
);
-- RLS: user_id = auth.uid()
```
- Policies
  - RLS on both tables; only the owner can read/write their rows.
  - No select of `code_hash` from clients; verification occurs server‑side only.

---

## 8) Roadmap (Non-Technical)
| Phase | Focus | Key Deliverables | Success Criteria |
|-------|-------|------------------|------------------|
| **Week 1** | Core setup + Auth + Test scaffolding | Password sign‑up/in, TOTP enroll/verify, credential consent, connect Broker + Notion, Vitest/Playwright/RTL setup + CI | Sign‑up/in works end‑to‑end with TOTP; protected routes enforce auth; CI runs unit + E2E smoke tests on PRs and pass |
| **Week 2** | Mapping + CSV import | Auto‑mapping, logs, presets, CSV import (core); unit tests for mapping/CSV; E2E for import | Sample CSV imports without errors; mapped trades visible in app; E2E validates import flow; unit tests for mapping/CSV pass |
| **Week 3** | Journaling + Voice + Attachments | Pre/live/post journal, voice input/cleanup, screenshots upload + Notion sync; component tests for forms/uploader; E2E for journal flow | Voice transcription appears in Notion; raw audio deleted immediately; screenshot uploads show previews and Notion blocks created; tests green in CI |
| **Week 4** | AI Review + Reports | Weekly summary generation, rule analysis, idempotent Notion updates; scheduled job + retries; E2E for weekly report | Weekly report generated (manual trigger in staging) and posted to Notion; rule violations flagged; job retry logic verified; tests stable |
| **Week 5+** | Feedback + Scale | Add brokers, refine AI, beta launch, performance hardening | 20+ beta users onboarded; <1% auth failure rate; P95 sync time under target; crash‑free sessions >99% |

Dependencies to call out:
- Broker sandbox creds (or tester-provided credentials).  
- Notion database template design finalized by Week 1.  
- Storage buckets + RLS policies in place by Week 3.

---

## 9) Tech & Ops Maintenance
- Version Control: Git for code and Markdown docs.  
- Docs: Keep `/docs/README.md` updated monthly; split into `/features/` as needed.  
- Feature Tags: Use emojis (`🚧`, `✅`, `🧠 Idea`).  
- Changelog: Maintain `/CHANGELOG.md` for milestones.  
- Feedback: Collect anonymous beta insights to adjust roadmap.

---

## 10) Risks & Mitigation
| Risk | Mitigation |
|------|------------|
| API changes / limits | Abstraction layer, retries, backoff, caching, Notion rate-limit respect |
| Speech quality | Edit-before-save step; retry with enhanced model if needed |
| AI hallucination | Frame as suggestions; show data explainability snippets |
| Privacy concerns | Minimal storage; clear consent; immediate raw audio deletion |
| Credential exposure | Read-only scopes, encryption, RLS, revocation, short logs |
| Cost volatility (AI) | Cache prompts, batch summaries, allow provider swap |
| Large attachments | Client compress to webp; configurable limits; resumable upload |

---

## 11) Long-Term Vision
- Become the Notion-connected performance coach for traders.  
- Expand to include:
  - Real-time analytics dashboards  
  - Mentor/group journaling  
  - Cross-platform syncing (Google Sheets, Airtable)  
  - Mobile app for on-the-go reflections  
- Premium AI packages (e.g., “Behavioral Coach Mode”, “Strategy Tracker”).

---

## 12) Maintenance & Best Practices
- Update this doc after any feature ships or scope change.  
- Mark features as `✅ Done` or `🚧 In Progress`.  
- If a section grows, extract to `/docs/features/<name>.md`.  
- Keep `README.md` strategic; use `/docs/` for detail.  
- Maintain a dated `CHANGELOG.md`.

---

## 13) Quick Summary
| Category | Highlights |
|----------|------------|
| **Core Focus** | Automatic journaling + voice + screenshots + AI reviews |
| **Differentiator** | Voice-first, rule-based AI coaching, Notion-native |
| **Tech** | Next.js, Node, Supabase, Notion API, AI APIs |
| **Security** | Encrypted tokens, minimal retention, RLS, user controls |
| **Launch Goal** | MVP in 4–5 weeks with 20+ beta users |

---

## 14) KPIs (MVP)
- Weekly active journaling users.  
- % trades with linked journals/screenshots.  
- Rule violations per week (and delta over time).  
- AI insight open rate / applied actions.  
- Time-to-sync (trade → Notion).

---

## 15) Testing Strategy
- Unit tests (Vitest)
  - Mapping logic (broker → Notion schema)
  - Rule checks and weekly aggregation calculations
  - CSV parsing, deduplication, and validation
- Component tests (React Testing Library)
  - Auth forms (sign‑up/in), TOTP enroll/verify UI
  - Journaling form and screenshot uploader
- E2E tests (Playwright)
  - Sign‑up → TOTP setup → sign‑out → sign‑in + TOTP verify
  - Connect Notion (mock), import CSV, create journal with screenshot, verify Notion sync call
  - Protected route redirect and session persistence
