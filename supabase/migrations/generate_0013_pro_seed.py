#!/usr/bin/env python3
"""
Parsea discovery/pro-plans/sarah-mccormack-plans.md y genera
migrations/0013_seed_sarah_plans.sql con los 5 planes pro.
"""

import re
import sys
import yaml
from pathlib import Path

SPEC = Path(__file__).resolve().parent.parent.parent / "discovery" / "pro-plans" / "sarah-mccormack-plans.md"
OUT = Path(__file__).resolve().parent / "0013_seed_sarah_plans.sql"

DAYS_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

# Mapping de type del spec → workout_block.code
TYPE_TO_BLOCK = {
    "easy":         "RS",
    "hill_reps":    "SF",
    "fartlek":      "FK",
    "tempo":        "TE",
    "progression":  "PR",
    "surges":       "SU",
    "hill_fartlek": "HF",
    "long_run":     "TLM",
    "race":         "RC",
    "hike":         "HK",
}

SESSION_NAME = {
    "easy":         "Rodaje Easy",
    "hill_reps":    "Cuestas",
    "fartlek":      "Fartlek",
    "tempo":        "Tempo",
    "progression":  "Progresivo",
    "surges":       "Aceleraciones",
    "hill_fartlek": "Hill Fartlek",
    "long_run":     "Tirada Larga",
    "race":         "¡Tu carrera!",
    "hike":         "Caminata Larga",
}


def estimate_minutes(stype: str, distance: str | None, description: str | None) -> int:
    """Estimación cruda de duración total en minutos."""
    if stype == "easy":
        if distance:
            return distance_to_min(distance, pace_per_mi=10, pace_per_km=6)
        return 40
    if stype == "long_run":
        if distance:
            return distance_to_min(distance, pace_per_mi=11, pace_per_km=7)
        return 90
    if stype == "hill_reps":
        return 45
    if stype == "fartlek":
        return 45
    if stype == "tempo":
        # Intentar capturar minutos sostenidos del description
        m = re.search(r"(\d+)\s*min", description or "")
        if m:
            return int(m.group(1)) + 25
        return 45
    if stype == "progression":
        m = re.findall(r"(\d+)\s*min", description or "")
        if m:
            return sum(int(x) for x in m) + 20
        return 45
    if stype == "surges":
        return 45
    if stype == "hill_fartlek":
        m = re.search(r"(\d+)\s*min", description or "")
        if m:
            return int(m.group(1)) + 25
        return 50
    if stype == "race":
        return 60
    if stype == "hike":
        # Ej: "Caminata en cerro de 4-5 h" → tomar el máximo
        m = re.findall(r"(\d+)", description or "")
        if m:
            return max(int(x) for x in m) * 60
        return 240
    return 30


def distance_to_min(distance: str, pace_per_mi: int, pace_per_km: int) -> int:
    """ '5 mi' → 50 (10 min/mi), '10K' → 60 (6 min/km), '7.5K' → 45."""
    s = distance.lower().strip()
    m = re.match(r"^([\d.]+)\s*(mi|k|km)?", s)
    if not m:
        return 40
    qty = float(m.group(1))
    unit = m.group(2) or "mi"
    if unit == "mi":
        return int(round(qty * pace_per_mi))
    return int(round(qty * pace_per_km))


def build_note(session: dict) -> str | None:
    parts: list[str] = []
    if session.get("description"):
        parts.append(session["description"])
    if session.get("effort"):
        parts.append(f"Esfuerzo: {session['effort'].replace('_', ' ')}")
    if session.get("optional"):
        note = session.get("note") or "opcional"
        parts.append(f"({note})")
    if session.get("fuelling"):
        parts.append("Buen día para probar tu estrategia de combustible (*).")
    return " · ".join(parts) if parts else None


def sql_escape(s: str | None) -> str:
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def parse_plans(md_text: str) -> list[dict]:
    """Extrae los plan blocks del markdown."""
    yaml_blocks = re.findall(r"```yaml\n(.*?)\n```", md_text, re.DOTALL)
    plans: list[dict] = []
    for block in yaml_blocks:
        data = yaml.safe_load(block)
        if not isinstance(data, dict):
            continue
        if "id" not in data or "schedule" not in data:
            continue  # skip common_rules
        plans.append(data)
    return plans


def gen_plan_sql(plan: dict, out: list[str]) -> None:
    code = plan["id"].replace("-", "_")
    name = plan["name"]
    description = plan.get("description", "")
    if plan.get("prerequisites"):
        description = f"{description}. Prerequisito: {plan['prerequisites']}"

    weeks = plan["weeks"]
    days = plan["days_per_week"]
    goal_type = "trail"
    # En el catálogo pro asumimos advanced. Aunque advanced × calle_trail
    # mapearía a calle_trail_avanzado_4d, los planes pro se eligen por código
    # explícito desde "Planes pro" en cambiar-plan.
    experience = "advanced"

    out.append("-- " + "-" * 70)
    out.append(f"-- {plan['id'].upper()} — {name}")
    out.append("-- " + "-" * 70)
    out.append("insert into public.plan_templates")
    out.append("  (code, name, description, goal_type, experience_level, weekly_days, total_weeks, is_pro)")
    out.append("values")
    out.append(f"  ({sql_escape(code)}, {sql_escape(name)}, {sql_escape(description)}, "
               f"'{goal_type}', '{experience}', {days}, {weeks}, true)")
    out.append("on conflict (code) do nothing;\n")

    out.append(f"with t as (select id from public.plan_templates where code = {sql_escape(code)})")
    out.append("insert into public.template_sessions")
    out.append("  (template_id, week_number, day_index, session_name, blocks, total_duration_min, distance_label, is_deload)")
    out.append("select t.id, w, d, name, b::jsonb, dur, dist, false from t,")
    out.append("(values")

    values_rows: list[str] = []
    for week_entry in plan["schedule"]:
        week_num = week_entry["week"]
        day_index = 0
        for day_name in DAYS_ORDER:
            session = week_entry.get(day_name)
            if not session or session.get("type") == "rest":
                continue
            day_index += 1
            stype = session["type"]
            code_block = TYPE_TO_BLOCK.get(stype)
            if not code_block:
                continue
            distance = session.get("distance")
            description = session.get("description")
            duration = estimate_minutes(stype, distance, description)
            note = build_note(session)
            block_json = (
                "[{"
                f'"code":"{code_block}",'
                f'"duration_min":{duration}'
                + (f',"note":{json_str(note)}' if note else "")
                + "}]"
            )
            session_name = SESSION_NAME.get(stype, stype.title())
            dist_label = distance or None
            values_rows.append(
                f"  ({week_num}, {day_index}, {sql_escape(session_name)}, "
                f"{sql_escape(block_json)}, {duration}, {sql_escape(dist_label)})"
            )
    out.append(",\n".join(values_rows))
    out.append(") as s(w, d, name, b, dur, dist)")
    out.append("on conflict (template_id, week_number, day_index) do nothing;\n")


def json_str(s: str) -> str:
    """JSON-string para meter dentro de un literal SQL."""
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main() -> None:
    md = SPEC.read_text(encoding="utf-8")
    plans = parse_plans(md)
    print(f"Planes encontrados: {len(plans)}", file=sys.stderr)
    for p in plans:
        sessions = sum(
            1
            for w in p["schedule"]
            for day in DAYS_ORDER
            if w.get(day) and w[day].get("type") != "rest"
        )
        print(f"  {p['id']}: {p['weeks']} sem × ~{p['days_per_week']}d → {sessions} sesiones", file=sys.stderr)

    out: list[str] = []
    out.append("-- " + "=" * 78)
    out.append("-- FlowRun — Migration 0013: Seed planes pro Sarah McCormack (5 planes)")
    out.append("-- " + "=" * 78)
    out.append("-- Generado automáticamente desde discovery/pro-plans/sarah-mccormack-plans.md")
    out.append("-- por supabase/migrations/generate_0013_pro_seed.py")
    out.append("-- " + "=" * 78)
    out.append("")
    for p in plans:
        gen_plan_sql(p, out)
    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"OK → {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
