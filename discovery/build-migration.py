#!/usr/bin/env python3
"""Compile session-note-overrides.json + block descriptions + title overrides
into a single Supabase migration SQL file.

Run: python3 discovery/build-migration.py
Out: supabase/migrations/0016_session_content_clarifications.sql
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OVR_PATH = HERE / "session-note-overrides.json"
OUT = ROOT / "supabase" / "migrations" / "0016_session_content_clarifications.sql"


def sql_escape(s: str) -> str:
    return s.replace("'", "''")


# ---- 1. Block descriptions (from approved concrete versions in gen-catalog.py) ----
BLOCK_DESCRIPTIONS = {
    "RW": "Alterná 2 min trote suave + 1 min caminata. Si te cuesta sostener el trote, invertí: 1 min trote / 2 min caminata.",
    "RS": "Trote a ritmo conversacional — podés hablar en frases completas todo el rato. Si tenés que cortar a respirar, bajá una marcha.",
    "RP": 'Empezás conversacional. En los últimos 5-15 min subís a "firme": respiración cargada pero sostenible. La transición es gradual, sin saltos bruscos.',
    "IU": "Intervalos donde la respiración es fuerte pero podés mantenerla unos minutos. Trotá suave entre cada uno, sin pausas paradas — el objetivo es entrenar el umbral, no la velocidad pura.",
    "ST": "Pasadas de 20-30s. Acelerá los primeros 5s, mantené rápido al medio, desacelerá los últimos 5s. Caminá 60-90s entre cada una para recuperar.",
    "TL": "Trote largo a ritmo conversacional. El reloj manda, no el ritmo. Si te cuesta llegar al final, bajá una marcha — no acortes.",
    "RA": "Trote muy suave o caminata rápida — el ritmo donde podés cantar, no solo hablar. Sin pausas planeadas, movimiento continuo.",
    "SC": "Buscá una cuesta moderada (5-8% pendiente). Subí controlado a esfuerzo ~75%, respiración cargada pero podés sostenerla. Trotá la bajada de recuperación. Estructura definida por la sesión.",
    "SF": "Buscá una cuesta moderada-fuerte (~8-10%). Subí intenso (esfuerzo ~90%, respiración fuerte, no hablás). Trotá la bajada como recuperación completa.",
    "TB": "Bajadas en cuesta moderada con pasos cortos y rápidos, brazos abiertos para equilibrio. Mirá 3-4 metros adelante, no a los pies. Aterrizá con el medio del pie (no de talón). 4-6 bajadas de 30-60s, subiendo trotando suave.",
    "SMC": "Recorré la ciudad incluyendo escaleras, calles en pendiente y cambios de ritmo. Subí escaleras de dos en dos. Buscá superficies variadas (asfalto, tierra, plaza).",
    "TLM": "Tirada larga en terreno mixto: cuestas, sendero, ondulaciones. Ritmo conversacional pero el paso varía naturalmente con el terreno — mantené el esfuerzo, no el ritmo exacto.",
    "CF": "Caminata enérgica en terreno con desnivel. Pasos largos, brazos activos. Subiendo: inclinate ligeramente hacia adelante, manos en muslos si la pendiente es fuerte. Bajando: rodillas suaves, pasos cortos.",
    "FG": "Circuito: sentadillas, peso muerto a una pierna, lunges, plancha, puentes. 3 rondas de 8-12 reps por ejercicio, descansando 60-90s entre rondas.",
    "FE": "Énfasis en el descenso del movimiento: sentadillas búlgaras, step-downs, single-leg deadlift. Bajá contando 4 segundos, subí normal. 3-4 reps por lado, 3 rondas.",
    "PL": "Saltos cortos y precisos: brincos en el lugar, saltos a un cajón bajo (20-30cm), skipping. 3 series de 8-10 reps con descanso completo entre series. Aterrizá blando.",
    "MF": "Estiramientos estáticos 30s por grupo muscular: cadera, isquios, gemelos, cuádriceps, espalda baja. Sumá movilidad: rodillas al pecho, círculos de tobillo y cadera, gato-vaca.",
    "SU": "Rodaje easy con aceleraciones cortas (surges) intercaladas. Cada surge es una pasada fuerte pero relajada — la sesión define cuántas y qué duración.",
    "FK": "Alternancia de bloques rápidos seguidos de trote easy. La estructura específica (cuántos, qué duración, qué ritmo) viene en la sesión.",
    "TE": "Tempo sostenido a ritmo de umbral. Respiración fuerte pero podés sostenerla durante todo el bloque. La sesión te dice cuánto y cuántos bloques.",
    "PR": "Rodaje progresivo con subidas de intensidad por bloques. Cada bloque firme un poco más exigente que el anterior — terminás corriendo más rápido que como empezaste.",
    "HF": "Sesión en terreno ondulado: duro en las subidas, easy en los llanos y bajadas. Aprovechás el terreno para meter intensidad sin estructura rígida.",
}

# ---- 2. Session title overrides ----
SESSION_TITLE_OVERRIDES = {
    "Progresivo": "Rodaje Progresivo Pro",
    "Tempo": "Tempo Run",
}

# ---- 3. Read note overrides ----
overrides = json.loads(OVR_PATH.read_text())["overrides"]


# ---- Generate SQL ----
lines = []
lines.append("-- ============================================================================")
lines.append("-- FlowRun — Migration 0016: Aclarar contenido de sesiones")
lines.append("-- ============================================================================")
lines.append("-- Generada desde discovery/session-note-overrides.json + gen-catalog.py.")
lines.append("-- Cambios:")
lines.append("--   1) workout_blocks.description: descripciones concretas (qué hacer) por bloque.")
lines.append("--   2) template_sessions.session_name: renombres a versiones amigables.")
lines.append(f"--   3) template_sessions.blocks: {len(overrides)} notes revisadas (match por")
lines.append("--      name + duration + block_code + original_note).")
lines.append("-- Idempotente: condiciones de WHERE evitan re-aplicar.")
lines.append("-- ============================================================================\n")

# 1. workout_blocks descriptions
lines.append("-- 1) workout_blocks: descripciones concretas")
lines.append("-- ---------------------------------------------------------------------------\n")
for code, desc in BLOCK_DESCRIPTIONS.items():
    lines.append(
        f"update public.workout_blocks set description = '{sql_escape(desc)}' "
        f"where code = '{code}';"
    )
lines.append("")

# 2. session_name renames
lines.append("-- 2) template_sessions: renombrar sesiones a títulos amigables")
lines.append("-- ---------------------------------------------------------------------------\n")
for old, new in SESSION_TITLE_OVERRIDES.items():
    lines.append(
        f"update public.template_sessions set session_name = '{sql_escape(new)}' "
        f"where session_name = '{sql_escape(old)}';"
    )
lines.append("")

# 3. note overrides
lines.append(f"-- 3) template_sessions.blocks: {len(overrides)} notes revisadas")
lines.append("-- ---------------------------------------------------------------------------\n")
lines.append("-- Cada UPDATE matchea por (session_name + total_duration_min + blocks[0].code")
lines.append("-- + blocks[0].note actual) y reemplaza el note del primer bloque del JSONB.\n")

for i, o in enumerate(overrides, 1):
    m = o["match"]
    name = m["name"]
    # Apply title overrides too in case migration runs after step 2
    name_post = SESSION_TITLE_OVERRIDES.get(name, name)
    dur = m["duration"]
    code = m["block_code"]
    orig = m.get("original_note", "")
    new = o["new_note"]
    lines.append(f"-- {i}. {name} ({dur} min) — note revisada")
    lines.append(
        "update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', "
        f"to_jsonb('{sql_escape(new)}'::text), true) "
        f"where (session_name = '{sql_escape(name)}' or session_name = '{sql_escape(name_post)}') "
        f"and total_duration_min = {dur} "
        f"and blocks->0->>'code' = '{code}' "
        f"and blocks->0->>'note' = '{sql_escape(orig)}';"
    )
    lines.append("")

content = "\n".join(lines)
OUT.write_text(content)
print(f"Wrote: {OUT}")
print(f"Lines: {len(lines)}")
print(f"Block descriptions: {len(BLOCK_DESCRIPTIONS)}")
print(f"Session renames: {len(SESSION_TITLE_OVERRIDES)}")
print(f"Note overrides: {len(overrides)}")
