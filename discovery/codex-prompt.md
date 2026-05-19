# Prompt para Codex — Ritmo Real MVP

Fecha: 2026-03-13

---

Copiar y pegar directamente en Codex:

---

You are Codex acting as a senior full-stack engineer. Build a web-mobile MVP (responsive, PWA-ready) for a running coaching app focused on "Real Pace" (Ritmo Real): interpreting post-run data and the user's perceived effort to provide simple feedback and weekly progress. The app must NOT record runs; it only imports/reads activities after the fact (via Strava OAuth, file import, or manual entry) and then collects a 20-second post-run "feel" check-in.

LANGUAGE/LOCALE:
- UI in Spanish by default; structure for English locale later (i18n-ready).
- America/Argentina/Cordoba timezone for display, but store timestamps in UTC.

CORE USER JOURNEY:
1) User visits landing (mobile-first). CTA: "Conectar Strava", "Importar actividad", "Solo por sensaciones".
2) Onboarding must branch users:
   - Branch A: Strava-connected users (OAuth). After connecting, show activity inbox (last 10) and request check-in for each.
   - Branch B: Non-Strava users: offer file import (FIT/GPX/TCX) OR manual activity creation, then check-in.
3) For each activity, user submits a check-in:
   - rpe_1_5 (1-5)
   - talk_test: phrases | words | none
   - breathing: easy | medium | hard
   - intent: enjoy | improve | trail
   - optional notes
4) App computes derived metrics (feedback engine v1) and shows:
   - Primary insight sentence (friendly, non-judgmental)
   - sustainable_score (0-100)
   - intensity_bucket: easy | moderate | hard
   - real_pace_estimate (if distance+duration exist) as min/km
5) Weekly dashboard:
   - "Corridas disfrutables esta semana": count of EASY check-ins / total runs
   - "Ritmo Real estimado": median pace of EASY runs in last 4 weeks (if available)
   - One insight line: e.g., "Cuando mantenés conversación, tus salidas duran +X min en promedio."

TECH REQUIREMENTS:
- Implement as Next.js (App Router) + TypeScript + Tailwind.
- Backend via Next.js API routes (or route handlers) + PostgreSQL using Prisma.
- Auth: simple email magic link OR email+password (choose simplest), with session cookies (NextAuth acceptable).
- Database: Postgres with Prisma models listed below.
- File import: accept .fit .gpx .tcx uploads; parse server-side to extract summary: start_time, duration_sec, distance_m, elevation_gain_m (if present), avg_hr (if present), sport guess. Use a safe parsing approach; for GPX/TCX you can parse XML; for FIT use a library.
- Strava integration:
  - OAuth connect flow, store tokens encrypted at rest.
  - Fetch recent activities (last 90 days) on connect; save summaries.
  - Implement Strava webhook endpoint to ingest new activities; on webhook event, fetch activity summary and store.
  - Keep within Strava rate limits; cache and avoid repeated calls.
  - For MVP, do NOT fetch streams unless needed; summary is enough.

DATA MODELS (Prisma):
- User: id, email, locale, createdAt
- Connection: id, userId, provider(strava), accessToken(encrypted), refreshToken(encrypted), expiresAt
- Activity: id, userId, provider(strava|import|manual), providerActivityId?, startTime, durationSec, distanceM?, elevationGainM?, avgSpeedMps?, avgHr?, sport, createdAt
- ActivityCheckin: id, activityId, rpe1_5, talkTest, breathing, intent, notes?, createdAt
- DerivedMetric: activityId (PK/FK), sustainableScore, intensityBucket, pacingHint, realPaceEstimateSecPerKm?, createdAt

FEEDBACK ENGINE V1 (IMPLEMENT EXACTLY):
A) Determine intensity_bucket from check-in:
- EASY if rpe<=2 AND talkTest==phrases AND breathing==easy
- HARD if rpe>=4 OR talkTest==none OR breathing==hard
- else MODERATE
B) sustainable_score:
- EASY: 95
- MODERATE: 70
- HARD: 40
C) real_pace_estimate per activity:
- If distanceM and durationSec exist: paceSecPerKm = durationSec / (distanceM/1000)
- Store as DerivedMetric.realPaceEstimateSecPerKm
D) user "Ritmo Real estimado":
- median paceSecPerKm of EASY activities within last 28 days where paceSecPerKm is present.
E) Trail adjustment (summary-only):
- If elevationGainM and distanceM exist:
  - density = elevationGainM / (distanceM/1000)
  - if density > 40, treat as hilly/trail: do not give pace-based critique; focus on talk/breathing.
F) pacingHint sentence rules (Spanish):
- If hilly/trail (density>40):
  - If intensity EASY: "Perfecto para trail: el ritmo engaña en subida. Hoy mandó la respiración y estuvo controlada."
  - If MODERATE: "En desnivel el pace no dice todo. Probá buscar más conversación/respiración cómoda en las subidas."
  - If HARD: "Hoy fue exigente. En trail, para disfrutar más, bajá un punto el esfuerzo en subida hasta poder hablar."
- Else (flat/road):
  - If EASY: "Esto fue Ritmo Real: sostenible y disfrutable. Repetilo 2–3 veces por semana."
  - If MODERATE: "Cerca del Ritmo Real. Si querés terminar más fresco, bajá un poco hasta poder hablar en frases."
  - If HARD: "Hoy te fuiste por encima de tu Ritmo Real. Para disfrutar más, probá aflojar hasta conversación en frases."
Additionally, if user has a current "Ritmo Real estimado" and this activity is HARD and pace is faster than estimate by >=10 sec/km:
  - Append: "Referencia: tu Ritmo Real actual ronda ~MM:SS/km."

PAGES / ROUTES:
- / (landing)
- /onboarding (choose Strava vs no Strava)
- /connect/strava (starts OAuth)
- /inbox (recent activities list)
- /activities/[id] (activity detail + check-in form if missing + feedback display)
- /dashboard (weekly)

UI REQUIREMENTS:
- Mobile-first layout, very simple.
- Activity cards show: date, sport, duration, distance, elevation gain, status.
- After check-in submission, immediately show feedback and save DerivedMetric.
- Add basic empty states: no activities, no easy runs to estimate pace, etc.
- Do not shame the user; tone is calm and encouraging.

SECURITY:
- Validate all inputs.
- Limit upload size.
- Store tokens encrypted.
- Protect webhook endpoint with Strava verification (challenge) and a shared secret if available.
- Use environment variables for secrets.

DELIVERABLES:
- Provide runnable code with instructions: setup env, run migrations, run dev server.
- Include Prisma schema, migrations, and seed (optional).
- Include minimal tests for feedback engine (unit tests) verifying intensity_bucket + trail adjustment + pace reference append.
- Provide a concise README.

Now implement the project.
