# Motor de Adaptación Semanal — Ritmo Real

Fecha: 2026-03-18 (v2 — gate criteria, nivel cero, Z1/Z2)

---

## Variables de Input (Post-Sesión)

Después de cada sesión el usuario ingresa:

**Nivel Cero (check-in simplificado v2):**
1. **¿Completó bloques de trote?** (sí / casi / no) → mapea a RPE 2/3/4
2. **¿Cómo se sintió?** (bien / regular / mal) → mapea a RPE 2/3/4
3. **¿Dolor o molestia?** (no / sí)

**Nivel Nuevo y superior:**
1. **RPE** (1–5)
2. **Talk test** (sí / no)
3. **Fatiga piernas** (baja / media / alta)
4. **Dolor** (sí / no)
5. **¿Terminó la sesión?** (sí / parcial / no)

---

## Métricas Internas (Calculadas por Semana)

| Métrica | Cálculo |
|---------|---------|
| % sesiones sostenibles | RPE ≤2 + talk sí / total sesiones |
| RPE promedio | promedio de todos los RPE de la semana |
| Adherencia | % sesiones completadas vs planificadas |
| Dolor acumulado | cantidad de sesiones con dolor = sí |
| **Pain-free 48h (v2)** | **Últimas 2 sesiones sin dolor reportado** |
| **Block completion count (v2)** | **Sesiones completadas en el bloque actual** |

---

## Reglas de Ajuste

### 🔴 Regla 1 — Fatiga Alta
**Si**: 2 sesiones RPE ≥4 **o** dolor reportado
**Entonces**:
- Reducir volumen semana siguiente -15%
- Eliminar intensidad
- Insertar 1 sesión fuerza suave

### 🟡 Regla 2 — Carga Moderada
**Si**: RPE promedio = 3, adherencia >75%
**Entonces**: Mantener volumen igual

### 🟢 Regla 3 — Adaptación Positiva
**Si**: ≥70% sesiones sostenibles, sin dolor, RPE promedio ≤2.5
**Entonces**:
- Aumentar volumen +5–8%
- O agregar 5 min a TSL

### 🔵 Regla 4 — Baja Adherencia
**Si**: <50% completado
**Entonces**:
- Reducir frecuencia
- Simplificar semana siguiente

---

## Ciclo Estructural

- **3 semanas** progresión
- **1 semana** descarga automática (-20%)
- Independiente del usuario

---

## Pseudocódigo del Motor

```python
# Ejecutar cada domingo
def adapt_next_week(weekly_metrics, current_plan, current_block):

    # ─── PASO 0: Gate Criteria — ¿avanza de bloque? (v2) ───
    # Solo aplica si el plan tiene gate_criteria definido
    # (desde_cero_3d, y fases iniciales de nuevo_*)
    # Ref: Gabbett (2016), Foster et al. (2001)

    if current_block.has_gate_criteria and is_end_of_block(current_week):
        gate = current_block.gate_criteria

        passes_gate = (
            weekly_metrics.avg_rpe <= gate.max_rpe_avg
            and weekly_metrics.pain_free_48h == True
            and current_block.sessions_completed >= gate.min_sessions_completed
            and weekly_metrics.adherence_rate >= gate.min_completion_pct
        )

        weeks_in_block = current_week - current_block.start_week
        forced_advance = weeks_in_block >= gate.override_after_weeks

        if passes_gate:
            advance_to_next_block()
            message = "Tu cuerpo respondió bien. Avanzamos al siguiente bloque."
        elif forced_advance:
            advance_to_next_block(reduced=True)  # avanza pero con volumen reducido
            message = "Avanzamos con un poco menos de carga. Tu cuerpo va a su ritmo."
        else:
            repeat_current_block()
            message = gate.fail_message_es
            # "Repetimos este bloque. Tu cuerpo necesita más tiempo y eso está perfecto."

        return next_week, message

    # ─── PASO 1: Adaptación semanal de volumen ───

    if weekly_metrics.pain_flag == True:
        next_week.volume *= 0.85
        remove_intensity()
        mark_deload()
        message = "Detectamos fatiga acumulada. Vamos a priorizar recuperación para sostener tu progreso."

    elif weekly_metrics.avg_rpe >= 4:
        next_week.volume *= 0.90
        reduce_intensity()
        message = "Tu cuerpo está acumulando carga. Bajamos un poco para que sigas progresando sin riesgo."

    elif weekly_metrics.sustainable_ratio >= 0.7 and weekly_metrics.avg_rpe <= 2.5:
        next_week.volume *= 1.05
        message = "Tu cuerpo está adaptándose bien. Aumentamos ligeramente tu volumen esta semana."

    elif weekly_metrics.adherence_rate < 0.5:
        reduce_sessions_by_one()
        message = "Ajustamos tu plan para que vuelva a sentirse sostenible."

    else:
        maintain()
        message = "Semana equilibrada. Seguimos construyendo base."

    # Deload automático cada 4 semanas
    if current_week % 4 == 0:
        next_week.volume *= 0.80
        message = "Semana de descarga: tu cuerpo necesita absorber el entrenamiento."

    return next_week, message
```

### Lógica de graduación nivel Cero → Nuevo (v2)

```python
def check_graduation(user_plan, weekly_metrics):
    """
    Al completar Bloque D de desde_cero_3d:
    Si completó 30 min continuos con RPE ≤ 5 → gradúa
    """
    if user_plan.template == 'desde_cero_3d' and current_block == 'D':
        last_session = get_last_completed_session(user_plan)

        if (last_session.continuous_run_min >= 25
            and last_session.rpe <= 5
            and not last_session.pain_flag):

            # Mostrar pantalla de celebración + elegir camino
            trigger_graduation_flow()
            # → usuario elige: calle / montaña
            # → se asigna nuevo_calle_3d o nuevo_montana_3d
```

---

## Motor de Combinación Plan A ↔ Plan B

Cada grupo tiene 2 modelos fisiológicos:
- **Plan A**: más base, más conservador
- **Plan B**: introduce intensidad moderada

### Reglas de transición:
- RPE bajo + alta adherencia → **aumentar componente B** (más intensidad moderada)
- Dolor o fatiga → **volver a componente A** (más base)

---

## Mensajes de Adaptación (Copy)

| Situación | Mensaje |
|-----------|---------|
| Fatiga alta | "Detectamos fatiga acumulada. Vamos a priorizar recuperación para sostener tu progreso." |
| Carga alta | "Tu cuerpo está acumulando carga. Bajamos un poco para que sigas progresando sin riesgo." |
| Progresión | "Tu cuerpo está adaptándose bien. Aumentamos ligeramente tu volumen esta semana." |
| Baja adherencia | "Ajustamos tu plan para que vuelva a sentirse sostenible." |
| Deload | "Semana de descarga: tu cuerpo necesita absorber el entrenamiento." |
| Estable | "Semana equilibrada. Seguimos construyendo base." |
| **Gate: avanza (v2)** | **"Tu cuerpo respondió bien. Avanzamos al siguiente bloque."** |
| **Gate: repite (v2)** | **"Repetimos este bloque una semana más. Tu cuerpo necesita más tiempo y eso está perfecto."** |
| **Gate: forzado (v2)** | **"Avanzamos con un poco menos de carga. Cada cuerpo tiene su ritmo."** |
| **Graduación cero (v2)** | **"Ya podés correr 30 minutos. Eso es enorme. Ahora elegí tu camino: calle o montaña."** |

---

## Scoring Visual para el Usuario

### Score semanal
- **Semana sostenible**: 3/4 sesiones conversacionales ✅
- **Carga percibida**: moderada ✅
- **Riesgo lesión**: bajo / medio / alto (por dolor + fatiga)

### Métricas de retención (no ego)
- % de corridas disfrutables por semana
- Minutos sostenibles por semana
- Tendencia (4 semanas): sube/baja
