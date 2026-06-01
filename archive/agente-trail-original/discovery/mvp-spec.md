# MVP Spec — Ritmo Real

Fecha: 2026-03-13

---

## Objetivo del MVP

- Traer actividades post-carrera sin grabar
- Pedir sensación (20s)
- Calcular "Ritmo Real" v1
- Dar 1 insight por actividad + 1 insight semanal
- Mostrar evolución simple

---

## Stack Técnico

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind (PWA)
- **Backend**: Next.js API routes
- **DB**: PostgreSQL + Prisma
- **Jobs**: cron + queue (BullMQ) para backfill y derive
- **Storage**: S3 compatible para uploads
- **Auth**: Email magic link o email+password (NextAuth)

---

## Flujo UX (5 pantallas)

### Pantalla A — Landing (mobile-first)
- Promesa: "Corré al ritmo correcto. Disfrutá más."
- CTA: Conectar Strava / Importar actividad / Modo sensaciones

### Pantalla B — Conectar fuente
- Connect with Strava (OAuth)
- Importar .FIT/.GPX/.TCX
- "No tengo datos → solo sensaciones"

### Pantalla C — Inbox de actividades
- Lista de últimas 10 actividades
- Fecha, tipo, duración, distancia, desnivel
- Estado: "sin feedback" / "listo"
- CTA: Agregar sensación (20s)

### Pantalla D — Activity feedback
- 1 frase de feedback principal
- 2 métricas: "Sostenible: Sí/No" + "Esfuerzo: Fácil/Medio/Duro"
- Botón: "Ver semana"

### Pantalla E — Dashboard semanal
- Corridas disfrutables: X / total
- Tiempo "conversacional" total
- Tendencia de Ritmo Real (si hay ritmo)

---

## Recolección de Datos (sin grabar)

### Opción 1: Strava
- OAuth → backfill últimos 90 días
- Webhook para nuevas actividades
- Summary suficiente para MVP (no streams)

### Opción 2: Import file
- Upload FIT/GPX/TCX
- Parsear: start_time, duration, distance, elevation_gain, avg_hr, avg_speed

### Opción 3: Modo sensaciones (manual)
- Duración, distancia (opcional), desnivel (opcional), sensación

---

## Check-in Post-Run (20 segundos)

| Campo | Opciones |
|-------|----------|
| Sensación (RPE) | 1-5 (Muy fácil → Muy duro) |
| Habla | Frases completas / Solo palabras / No pude hablar |
| Respiración | Cómoda / Media / Agitada |
| Objetivo de hoy | Disfrutar / Mejorar / Trail |
| Notas | Opcional |

---

## Modelos de Datos (Prisma/PostgreSQL)

```
users
  id, email, locale, createdAt

connections
  id, userId, provider("strava"), accessToken(encrypted),
  refreshToken(encrypted), expiresAt

activities
  id, userId, provider("strava"|"import"|"manual"),
  providerActivityId?, startTime, durationSec,
  distanceM?, elevationGainM?, avgSpeedMps?, avgHr?,
  sport("run"|"trail_run"|"treadmill"), createdAt

activity_checkins
  id, activityId, rpe1_5, talkTest, breathing,
  intent, notes?, createdAt

derived_metrics
  activityId(PK), sustainableScore, intensityBucket,
  pacingHint, realPaceEstimateSecPerKm?, createdAt
```

---

## Feedback Engine v1 (Sin ML)

### A) Clasificación de intensidad (desde check-in)

```
EASY    si: rpe<=2 AND talkTest==phrases AND breathing==easy
HARD    si: rpe>=4 OR talkTest==none OR breathing==hard
MODERATE: todo lo demás
```

### B) Sustainable Score

| Bucket | Score |
|--------|-------|
| EASY | 95 |
| MODERATE | 70 |
| HARD | 40 |

### C) Ritmo Real por actividad

```
Si distanceM y durationSec existen:
  paceSecPerKm = durationSec / (distanceM / 1000)
```

### D) Ritmo Real estimado del usuario

Mediana de paceSecPerKm de actividades EASY en últimos 28 días.

### E) Ajuste Trail (sin streams)

```
Si elevationGainM y distanceM existen:
  density = elevationGainM / (distanceM / 1000)
  Si density > 40 m/km → modo trail: no criticar pace
```

### F) Frases de Feedback (Spanish)

**Trail (density > 40):**
- EASY: "Perfecto para trail: el ritmo engaña en subida. Hoy mandó la respiración y estuvo controlada."
- MODERATE: "En desnivel el pace no dice todo. Probá buscar más conversación/respiración cómoda en las subidas."
- HARD: "Hoy fue exigente. En trail, para disfrutar más, bajá un punto el esfuerzo en subida hasta poder hablar."

**Llano:**
- EASY: "Esto fue Ritmo Real: sostenible y disfrutable. Repetilo 2–3 veces por semana."
- MODERATE: "Cerca del Ritmo Real. Si querés terminar más fresco, bajá un poco hasta poder hablar en frases."
- HARD: "Hoy te fuiste por encima de tu Ritmo Real. Para disfrutar más, probá aflojar hasta conversación en frases."

**Adicional**: Si tiene Ritmo Real estimado y la actividad es HARD con pace >=10s/km más rápido:
→ "Referencia: tu Ritmo Real actual ronda ~MM:SS/km."

---

## API Endpoints

```
Auth:
  POST /auth/login
  POST /auth/logout

Strava:
  GET  /connect/strava (redirect)
  GET  /connect/strava/callback
  POST /webhooks/strava (receiver)

Activities:
  GET  /activities?limit=20
  POST /activities/manual
  POST /activities/import (file upload)
  GET  /activities/:id

Check-in:
  POST /activities/:id/checkin

Metrics:
  POST /activities/:id/derive
  GET  /dashboard/week?date=YYYY-MM-DD
```

---

## Strava Integration Details

### OAuth + Scopes
- Login "Connect with Strava"
- Scope: `activity:read_all` (para leer privados/zonas)

### Ingesta inicial (backfill)
- Últimas N actividades (90 días)
- Guardar summary en tabla Activities

### Ingesta continua
- Webhooks: cuando se crea actividad, llega evento → fetch detalle
- Ahorra rate limits y escala mejor

### Rate limits
- ~200 requests/15min y 2000/día
- Cachear y ser inteligente con streams/webhooks

---

## Orden de Construcción

1. Login + DB
2. Activities manual + check-in + feedback v1 (sin integraciones)
3. Import FIT/GPX/TCX
4. Strava OAuth + backfill
5. Strava webhook
6. Dashboard semanal

---

## Prompt para Codex

El prompt completo para Codex está disponible en el documento de discovery original.
Cubre: todo el spec anterior en formato de instrucción directa para generación de código.
