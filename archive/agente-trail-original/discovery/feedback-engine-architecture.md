# Feedback Engine Architecture — Ritmo Real

Fecha: 2026-03-13

---

## Concepto Core

El producto es un **post-run coach** (interpretación + educación). El tracking lo "subcontratás" al reloj/app que ya usan.

Dos carriles:
- **Carril Data**: cuando hay datos post-carrera
- **Carril Sensaciones**: cuando no hay datos o son pobres

---

## Cómo Conseguir Datos Post-Carrera (Sin Competir con el Reloj)

### A) Conectores "hub"
- **Strava** (mejor primer paso: muchos relojes vuelcan ahí)
- Apple Health / HealthKit (iOS)
- Google Fit / Health Connect (Android)

Propuesta: "Conectá lo que ya usás"

### B) Importación manual (backup universal)
- Subir FIT / GPX / TCX
- Salva de: gente sin OAuth, sin Strava, mercados donde Strava no domina

**Estrategia**: Strava + Import desde el día 1. HealthKit/Health Connect después.

---

## Niveles de Calidad de Datos

### Nivel 0 — Solo sensaciones (sin datos)
- Duración (manual)
- RPE / "cómo se sintió" (1–5)
- Talk test (sí/no)
- Respiración (nasal / mixta / agitada)
- Dolor o molestia (sí/no + dónde)
- **Feedback**: progreso por esfuerzo sostenible y prevención

### Nivel 1 — Resumen de actividad (sin HR)
- Duración, distancia, desnivel, ritmo promedio
- **Feedback**: consistencia + detección de "te pasaste" por patrones

### Nivel 2 — Resumen + HR promedio/máxima
- **Feedback**: diferenciar "easy" vs "tempo" aunque el pace engañe

### Nivel 3 — Streams (pace/HR/grade)
- **Feedback**: deriva, tiempo en rango, "en qué minuto te fuiste"

**Clave: MVP NO requiere nivel 3.**

---

## Check-in Post-Run (20–30s, obligatorio)

Existe siempre, aunque haya Strava, porque:
- Trail rompe el pace
- HR puede estar ausente o ruidosa
- La marca es "aprender a sentir el esfuerzo"

### Campos:
1. ¿Cómo se sintió? (1 fácil – 5 duro)
2. ¿Podías hablar en frases? (sí / a veces / no)
3. Respiración (nasal / mixta / agitada)
4. Piernas (frescas / cargadas / "destruidas")
5. ¿Molestia/dolor? (no / sí)

---

## Feedback Engine v1 (Sin ML)

### Conceptos internos (que el usuario NO ve)
- **Ritmo Real** = rango sostenible (pace si hay, o "sensación" si no)
- **Sesión sostenible** = RPE ≤2 y Talk test = sí (o HR baja si existe)
- **Bandera de riesgo** = dolor + intensidad + carga reciente

### Reglas simples
- RPE alto + duración corta → "te fuiste de intensidad"
- RPE bajo + duración media/larga → "esto es tu base"
- Trail (desnivel alto) → priorizar talk test / HR sobre pace
- 2+ sesiones con piernas "destruidas" → sugerir bajar carga + fuerza excéntrica

### Métricas que retienen (sin ego)
- % de corridas disfrutables por semana
- Minutos sostenibles por semana
- Tendencia (4 semanas): sube/baja

---

## Plantillas de Feedback v1 (Copy Listo)

**Te pasaste:**
"Hoy se sintió más duro de lo necesario para construir base. Mañana probá salir más fácil los primeros 10–15 min y mantener conversación."

**Perfecto:**
"Esto fue Ritmo Real: controlado y sostenible. Repetí 1–2 salidas así esta semana y vas a progresar sin sobrecargar."

**Trail:**
"En subidas el pace engaña. Hoy el objetivo era sostener esfuerzo conversacional. Si querés mejorar sin lesiones, priorizá respiración/talk test sobre ritmo."

---

## MVP sin Integraciones (3 pantallas)

### 1) Conectar fuente
Strava / Import FIT-GPX-TCX / "Manual"

### 2) Check-in (siempre)
La "capa humana" que da datos cuando el resto falla.

### 3) Dashboard
- "Esta semana: 3 corridas disfrutables (70%)"
- "Minutos sostenibles: 124"
- 1 insight: "Cuando salís muy fuerte, cortás antes. Tu cuerpo hoy progresa más con salidas de 35–50 min en esfuerzo conversacional."
