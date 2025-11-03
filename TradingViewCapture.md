## TradingView Dual Timeframe Capture (Mode A + Mode B)

This document specifies the feature to capture two TradingView screenshots per request (1H and 5m), persist them in the app (Supabase Storage + DB), and render them in the UI. Primary path uses a local, logged‑in Browser Extension (Mode A) so paid/invite‑only indicators appear. Fallback uses a self‑hosted Playwright service (Mode B) which works 24/7 but cannot show private studies.

---

### 0) Goals & Success Criteria

- Two images per capture (1H, 5m) with symbol, timeframe, timestamp.
- Mode A shows paid/invite‑only indicators (because capture happens from the user’s logged‑in session).
- If Mode A unavailable, auto‑fallback to Mode B and clearly label images as “captured without private studies”.
- Every capture writes an auditable record in DB (who/when/mode/source), with append‑only step events.

---

### 1) Operating Modes

- Mode A — Local Logged‑In Capture (primary)
  - Browser Extension (MV3) controls a TradingView tab that is already logged in.
  - Triggers timeframe switch + zoom and performs screenshot from the real TV UI.
  - No credentials leave the device.

- Mode B — Server Capture (fallback)
  - Self‑hosted Playwright service opens a view‑only TV layout URL and screenshots.
  - Works headlessly 24/7. Does not show invite‑only/private studies.

Decision: Prefer Mode A; auto‑fallback to Mode B with a visible badge.

---

### 2) UX & Flows

Manual capture (primary)
1. User selects 1H and 5m (pre‑checked) and an optional zoom preset (Tight/Medium/Wide).
2. Click Capture.
3. UI status: “Sending → Capturing 1H → Capturing 5m → Uploading → Done”.
4. Two tiles appear (1H on top, 5m below) with metadata + “Open original” link.

Alert capture (optional)
- A toggle (“Capture on alert”) that routes TV webhook to the same pipeline.

---

### 3) TradingView Preparation (one‑time)

- Dedicated layout for automation (clean theme, predictable indicators, consistent price scale).
- Confirm hotkeys and ensure camera/snapshot is accessible.
- Keep a pared‑down shared layout for Mode B reliability.

Risk: TV UI/hotkeys can change. Mitigation: use minimal actions, test weekly.

---

### 4) Local Helper (Mode A) — Browser Extension first, Electron later

Form factor
- v1: Browser Extension (Chrome/Edge/Arc) targeting `https://*.tradingview.com/*`.
- v2: Electron helper (optional) for stronger window control. Uses identical backend protocol.

Minimal capabilities (v1)
- Receive signed capture command from backend (symbol, TF list, zoom preset, layout URL).
- Ensure TradingView tab open → navigate to layout URL if needed.
- Switch TF to 1H, apply zoom preset, trigger screenshot, repeat for 5m.
- Upload PNGs to pre‑signed Supabase Storage URLs.
- Report progress events and completion to backend.

Security model
- No credentials collected; uses user’s existing TV session.
- Commands: signed (nonce + exp), device token scoped to user+device, rate‑limited.
- Extension acts only on whitelisted hostnames.

Operational risks & mitigations
- Window focus loss → retry with backoff; small local toast.
- Multi‑monitor / keymaps → one‑time calibration; store zoom counts per TF.

---

### 5) Backend: Router, Queue, Storage, DB

Minimal services
- API routes: `/api/capture/create` (manual), `/api/tv/webhook` (alert), `/api/capture/complete`, `/api/devices/*`.
- Command router prefers Mode A when an online device exists; otherwise enqueues Mode B job.
- Storage/CDN: Supabase Storage `captures` bucket (private). Signed URLs for upload and view.
- Queue: simple table‑backed queue for retries and back‑pressure (can evolve later).

Logical DB tables
- `captures` (id, user_id, symbol, requested_tfs, zoom_profile, requested_at, mode_used, status, device_id)
- `capture_images` (id, capture_id, tf, object_key, cdn_url, sha256, width, height, captured_at)
- `devices` (id, user_id, type enum('extension','electron'), name, last_seen_at, online, capabilities, token_hash)
- `layouts` (id, user_id null, label, modeA_url, modeB_view_only_url, default)
- `capture_events` (id, capture_id, step, detail jsonb, created_at)
- `dead_letters` (id, payload, reason, created_at)

RLS
- All tables restricted to `auth.uid()`; `devices` token bound to owner; images path‑prefixed by user id.

Storage structure
- Bucket: `captures` (private).
- Path: `user/{userId}/capture/{captureId}/{tf}.png`.
- Dedupe by SHA‑256 when identical uploads occur.

---

### 6) API (Next.js Route Handlers)

`POST /api/capture/create`
- Input: `{ symbol, tfs: ['1h','5m'], zoomPreset, layoutId }`.
- Creates `captures` row (status `queued`).
- If device online → Mode A: create signed upload URLs; return `{ captureId, mode: 'A', command }`.
- Else → Mode B: enqueue Playwright job; return `{ captureId, mode: 'B' }`.

`POST /api/capture/complete`
- Body contains `{ captureId, images[] }`; writes `capture_images`, sets `captures.status='done'`.

`POST /api/devices/link/start` → returns 6‑digit code.

`POST /api/devices/link/verify` → exchanges code for device JWT; inserts/updates `devices`.

`GET /api/devices/next` (polling)
- Header: `Device-Token`.
- Returns next signed command or 204 when idle.

`POST /api/capture/event` → append step events for auditability.

Env
- `NEXT_PUBLIC_APP_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `PLAYWRIGHT_SERVICE_URL`, `PLAYWRIGHT_SERVICE_TOKEN`

---

### 7) Zoom Strategy

- Presets per TF as: Reset → Zoom‑In N steps.
- Maintain separate N for 1H and 5m; store in command and capture record.
- Optional tiny on‑screen helper to show visible bar count for one‑time calibration.

---

### 8) Server Capture (Mode B) — Self‑Hosted Playwright

Service
- Node service (Docker) with Chromium + Playwright.
- Endpoints: `POST /render` → `{ layoutUrl, symbol, tfs, zoomProfile }`; `GET /health`.

Flow
1) Open view‑only layout URL.
2) Wait for chart readiness.
3) Switch TF, reset/zoom, screenshot viewport for each TF.
4) Return PNG buffers (or upload to Storage directly and return object keys).

Security & Ops
- Auth via bearer token; IP allowlist; concurrency limits.
- Structured logs; retries via backend queue; dead‑letter table on repeated failure.

---

### 9) Web App (Next.js)

- Capture page: symbol input, TF chips (1H/5m), zoom preset dropdown, Capture button, live status.
- Gallery list: latest captures with filters (symbol, TF, date, mode badge).
- Detail page: large PNG, metadata, “Open in TV”, “Copy CDN link”, “Re‑capture”.
- Device panel: show extension status (online/offline, last seen), link helper flow.

---

### 10) Observability & QA

- Append‑only `capture_events` for each step; metrics: success rate, time‑to‑image, retry count.
- QA scenarios: helper online/offline, TV tab not open (auto‑open), zoom calibration, multi‑monitor, network hiccup on upload, CDN delays.

---

### 11) Privacy, ToS & Trust

- Local mode uses existing TV session; no passwords collected.
- Clear permissions summary in extension: acts only on TradingView tabs; uploads only its own images.
- Mode B clearly indicates private studies will not appear.

---

### 12) Rollout Plan (incremental)

1) Skeleton: UI button → backend record → mock capture images → DB/Viewer done.
2) Mode A minimal: extension switches TFs, snapshots, uploads two PNGs.
3) Zoom presets: add Tight/Medium/Wide; persist per user per TF.
4) Mode B: integrate self‑hosted Playwright; fallback routing.
5) Polish: labels, copy‑link, “Open in TV”, retries, device status.
6) Alert capture: enable `/api/tv/webhook` to trigger same pipeline.

---

### 13) Acceptance Criteria

- Two images (1H, 5m) produced and visible in the app with metadata.
- Mode A shows private studies; Mode B labeled accordingly.
- DB records + Storage objects created with audit events.
- Failure modes retried and observable; dedupe by hash; signed URLs used for access.

---

### 14) Tests & Success Criteria

#### 14.1 Skeleton (Mock Capture)
- Tests
  - API unit: `/api/capture/create` returns `captureId` and persists `captures` row (`status='queued'`).
  - DB: RLS prevents cross-user reads; owner can read/write.
  - UI: capture form shows Sending → Done and renders two mock tiles.
- Success criteria
  - New capture visible in gallery within ≤2s.
  - `captures` + `capture_events` rows created; no storage writes yet.

#### 14.2 Mode A — Browser Extension (Happy Path)
- Tests
  - Device link flow: code → token → `devices` row created; token scoped to device+user.
  - Polling: extension receives signed command; rejects expired/invalid nonce/signature.
  - TV automation: TF switches to 1H then 5m; zoom preset applied per TF.
  - Uploads: PUT to signed URLs; SHA-256 returned; `/api/capture/complete` writes `capture_images` rows.
  - UI: tiles show Mode A badge; “Open original” link works.
- Success criteria
  - Both images < 5 MB; dimensions stable across runs (±2%).
  - Time-to-image P95 ≤ 6s on typical laptop hardware.
  - Paid/invite-only indicators present in images.

#### 14.3 Zoom Presets
- Tests
  - Calibration writes `zoom_profile` with N per TF.
  - Visual consistency: count visible bars (heuristic) within tolerance.
- Success criteria
  - Repeated captures show framing variance ≤ 2% width.

#### 14.4 Mode B — Self-Hosted Playwright
- Tests
  - Service health: `/health` returns 200; rejects unauthorized calls.
  - Render flow: returns two PNGs for 1H/5m; labeled Mode B in UI.
  - Fallback: when no online device for 60s, router enqueues Mode B job.
- Success criteria
  - Time-to-image P95 ≤ 10s; success rate ≥ 98% over 100 runs.
  - Images never contain paid/invite-only overlays (by design).

#### 14.5 Web App UI
- Tests
  - Capture form validates symbol, TF chips, zoom preset.
  - Status stream shows step updates; errors display retry action.
  - Gallery filters by symbol, TF, date, mode; detail actions work (Open in TV, Copy link, Re-capture).
- Success criteria
  - All UI tests pass in CI (Playwright E2E/component).
  - Copy link and Re-capture triggers correct flows consistently.

#### 14.6 Storage & DB
- Tests
  - Storage path: `user/{userId}/capture/{captureId}/{tf}.png`; object ACL private.
  - Dedupe: identical uploads (same SHA-256) do not create duplicate `capture_images` rows.
  - RLS: only owner can list/serve; signed URLs expire ≤ 15 minutes.
- Success criteria
  - No public access without signed URL.
  - Duplicate protection confirmed by checksum.

#### 14.7 Security & Abuse Controls
- Tests
  - Command signature: invalid signature/expired nonce rejected (401/403) with no side effects.
  - Device token: token from user A cannot fetch commands for user B.
  - Rate limits: manual capture limited per user (e.g., 30/hour); exceeding returns 429.
- Success criteria
  - ≥95% of negative tests fail safely with clear errors; no capture progresses after rejection.

#### 14.8 Alert-Driven Capture
- Tests
  - `/api/tv/webhook` validates secret; dedup by alert id + timestamp.
  - Pipeline parity: produces same outputs as manual capture (images + metadata).
- Success criteria
  - End-to-end parity confirmed on 20 sample alerts across 3 symbols.

#### 14.9 Observability & SLOs
- Metrics collected
  - `success_rate` (by mode), `time_to_image_ms` (P50/P95), `retries_count`, `fallback_rate`.
- Initial SLOs
  - `success_rate` ≥ 98% (rolling 7 days, any mode).
  - Mode A `time_to_image_ms` P95 ≤ 6s; Mode B P95 ≤ 10s.
  - `fallback_rate` ≤ 20% during business hours for users with helper installed.


