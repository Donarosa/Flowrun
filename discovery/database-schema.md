# Database Schema — Ritmo Real

Fecha: 2026-03-13

---

## Versión Simplificada (Planes + Check-ins, Sin Integraciones)

### users
```sql
id              UUID PRIMARY KEY
email           VARCHAR NOT NULL UNIQUE
name            VARCHAR
age             INTEGER
experience_level ENUM('new', 'base', 'advanced')
goal_type       ENUM('calle', 'calle_trail', 'trail')
weekly_days     INTEGER (2, 3, 4)
created_at      TIMESTAMP DEFAULT NOW()
```

### user_profile_metrics
```sql
user_id              UUID REFERENCES users
perceived_base       ENUM('low', 'medium', 'solid')
injury_history       BOOLEAN DEFAULT false
preferred_effort_mode ENUM('hr', 'rpe', 'talk_test')
zone2_hr_min         INTEGER (nullable)
zone2_hr_max         INTEGER (nullable)
```

### plans (plantillas base)
```sql
id                UUID PRIMARY KEY
goal_type         ENUM('calle', 'calle_trail', 'trail')
experience_level  ENUM('new', 'base', 'advanced')
weekly_days       INTEGER
title             VARCHAR
description       TEXT
```

### workouts (bloques reutilizables)
```sql
id                UUID PRIMARY KEY
type              ENUM('RS', 'RPC', 'SC', 'TSL', 'TT', 'SMC')
base_duration_min INTEGER
intensity_profile JSONB
trail_specific    BOOLEAN DEFAULT false
```

### plan_weeks
```sql
id          UUID PRIMARY KEY
plan_id     UUID REFERENCES plans
week_number INTEGER
is_deload   BOOLEAN DEFAULT false
```

### plan_sessions
```sql
id                  UUID PRIMARY KEY
plan_week_id        UUID REFERENCES plan_weeks
workout_id          UUID REFERENCES workouts
order_in_week       INTEGER
duration_modifier   DECIMAL  -- percentage
intensity_modifier  DECIMAL  -- percentage
```

### user_sessions (instancia real del usuario)
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES users
plan_week_id        UUID REFERENCES plan_weeks
workout_id          UUID REFERENCES workouts
scheduled_date      DATE
adjusted_duration   INTEGER  -- minutes
adjusted_intensity  DECIMAL
status              ENUM('pending', 'completed', 'skipped')
```

### session_checkins
```sql
id                UUID PRIMARY KEY
user_session_id   UUID REFERENCES user_sessions
rpe               INTEGER CHECK (rpe BETWEEN 1 AND 5)
talk_test         ENUM('yes', 'partial', 'no')
breathing         ENUM('easy', 'medium', 'hard')
leg_fatigue       ENUM('low', 'medium', 'high')
pain_flag         BOOLEAN DEFAULT false
pain_location     VARCHAR (nullable)
completed_full    BOOLEAN
created_at        TIMESTAMP DEFAULT NOW()
```

### weekly_metrics (calculado automáticamente)
```sql
user_id             UUID REFERENCES users
week_number         INTEGER
year                INTEGER
avg_rpe             DECIMAL
sustainable_ratio   DECIMAL  -- 0.0 to 1.0
adherence_rate      DECIMAL  -- 0.0 to 1.0
pain_flag           BOOLEAN
adaptation_decision ENUM('increase', 'maintain', 'deload', 'reduce')
message             TEXT
created_at          TIMESTAMP DEFAULT NOW()
```

---

## Versión Completa (Con Integraciones — Fase 2+)

### connections
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users
provider        ENUM('strava')
access_token    TEXT  -- encrypted
refresh_token   TEXT  -- encrypted
expires_at      TIMESTAMP
```

### activities
```sql
id                    UUID PRIMARY KEY
user_id               UUID REFERENCES users
provider              ENUM('strava', 'import', 'manual')
provider_activity_id  VARCHAR (nullable)
start_time            TIMESTAMP
duration_sec          INTEGER
distance_m            INTEGER (nullable)
elevation_gain_m      INTEGER (nullable)
avg_speed_mps         DECIMAL (nullable)
avg_hr                INTEGER (nullable)
sport                 ENUM('run', 'trail_run', 'treadmill')
created_at            TIMESTAMP DEFAULT NOW()
```

### activity_checkins
```sql
id            UUID PRIMARY KEY
activity_id   UUID REFERENCES activities
rpe_1_5       INTEGER
talk_test     ENUM('phrases', 'words', 'none')
breathing     ENUM('easy', 'medium', 'hard')
intent        ENUM('enjoy', 'improve', 'trail')
notes         TEXT (nullable)
created_at    TIMESTAMP DEFAULT NOW()
```

### derived_metrics
```sql
activity_id                 UUID PRIMARY KEY REFERENCES activities
sustainable_score           INTEGER  -- 0-100
intensity_bucket            ENUM('easy', 'moderate', 'hard')
pacing_hint                 TEXT
real_pace_estimate_sec_km   INTEGER (nullable)
created_at                  TIMESTAMP DEFAULT NOW()
```
