#!/usr/bin/env python3
"""Generate FlowRun session catalog HTML with phone-mockup cards per session.

Reads notes from supabase/migrations/*seed*.sql and applies overrides from
session-note-overrides.json so the catalog reflects approved revisions
before they're committed to the DB.

Run:  python3 discovery/gen-catalog.py
Out:  discovery/sesiones-catalogo.html
"""
import json
import re
from pathlib import Path
from html import escape as h

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent / "supabase" / "migrations"
OVERRIDES_PATH = HERE / "session-note-overrides.json"
OUT = HERE / "sesiones-catalogo.html"

# ---- 1. Load overrides ----
overrides = []
if OVERRIDES_PATH.exists():
    overrides = json.loads(OVERRIDES_PATH.read_text()).get("overrides", [])

def find_override(name, duration, block_code, original_note):
    for o in overrides:
        m = o["match"]
        if (m.get("name") == name
                and m.get("duration") == duration
                and m.get("block_code") == block_code
                and m.get("original_note", "") == (original_note or "")):
            return o["new_note"]
    return None

# ---- 2. Parse blocks library (every migration that defines workout_blocks) ----
blocks_lookup = {}
BLOCK_INSERT_PAT = re.compile(
    r"\(\s*'([A-Z]+)'\s*,\s*'([^']+)'\s*,\s*'(\w+)'\s*,\s*'([^']+)'\s*,\s*(true|false)\s*\)"
)
for migration in sorted(ROOT.glob("*.sql")):
    text = migration.read_text()
    if "workout_blocks" not in text:
        continue
    # Only consider tuples that follow an `insert into ... workout_blocks` clause
    for chunk in re.split(r"insert\s+into\s+public\.workout_blocks", text, flags=re.IGNORECASE)[1:]:
        # Limit to the values list (until the closing `;` or `on conflict`)
        end = re.search(r";|on\s+conflict", chunk, flags=re.IGNORECASE)
        scope = chunk[: end.start()] if end else chunk
        for m in BLOCK_INSERT_PAT.finditer(scope):
            code, name, cat, desc, _ = m.groups()
            blocks_lookup[code] = {"name": name, "category": cat, "description": desc}

# ---- 3. Parse sessions ----
with_pat = re.compile(
    r"with\s+t\s+as\s*\(\s*select\s+id\s+from\s+public\.plan_templates\s+where\s+code\s*=\s*'([^']+)'",
    re.IGNORECASE,
)
row_pat = re.compile(
    r"\(\s*(\d+)\s*,\s*(\d+)\s*,\s*'([^']*)'\s*,\s*'(\[[^']*\])'\s*,\s*(\d+)\s*,\s*([^)]+?)\s*\)",
    re.DOTALL,
)
SEED_FILES = sorted(p for p in ROOT.glob("*seed*.sql"))
sessions = []
for path in SEED_FILES:
    text = path.read_text()
    chunks = re.split(r"(?=with\s+t\s+as\s*\()", text, flags=re.IGNORECASE)
    for chunk in chunks:
        m = with_pat.search(chunk)
        plan_code = m.group(1) if m else "?"
        for r in row_pat.finditer(chunk):
            wk, day, name, blocks_json, dur, last = r.groups()
            try:
                blocks = json.loads(blocks_json)
            except json.JSONDecodeError:
                continue
            ls = last.strip()
            is_deload = ls.lower() == "true"
            sessions.append({
                "plan_code": plan_code,
                "week": int(wk), "day": int(day),
                "name": name, "blocks": blocks,
                "duration": int(dur), "is_deload": is_deload,
            })

# ---- 4. Apply overrides to each session's first-block note ----
override_count = 0
for s in sessions:
    if not s["blocks"]:
        continue
    b0 = s["blocks"][0]
    original = (b0.get("note") or "")
    new = find_override(s["name"], s["duration"], b0.get("code"), original)
    if new is not None:
        b0["note"] = new
        b0["__overridden"] = True
        override_count += 1

# ---- 5. Dedupe by (name, blocks-sig, duration) — using the (possibly overridden) note ----
def sig(s):
    bk = tuple((b.get("code"), b.get("duration_min"), b.get("note","")) for b in s["blocks"])
    return (s["name"], bk, s["duration"])

unique = {}
for s in sessions:
    k = sig(s)
    if k not in unique:
        unique[k] = {**s, "appearances": 1, "appears_in": [s["plan_code"]]}
    else:
        unique[k]["appearances"] += 1
        if s["plan_code"] not in unique[k]["appears_in"]:
            unique[k]["appears_in"].append(s["plan_code"])

unique_list = list(unique.values())
CAT_ORDER = {"carrera":1,"trail":2,"fuerza":3,"movilidad":4,"?":9}
def primary_cat(s):
    if not s["blocks"]: return "?"
    return blocks_lookup.get(s["blocks"][0].get("code"), {}).get("category","?")
unique_list.sort(key=lambda s: (CAT_ORDER.get(primary_cat(s),9), s["name"].lower()))

# ---- 6. Why / step descriptions / tips ----
BLOCK_WHY = {
    'RW': ("Por qué run-walk", "Alternar trote y caminata construye base aeróbica sin romper. Es la forma más segura de empezar a correr."),
    'RS': ("Por qué rodaje sostenible", "El trote conversacional es la base de todo. Construye motor aeróbico y resistencia sin acumular fatiga."),
    'RP': ("Por qué rodaje progresivo", "Terminar firme te enseña a sostener ritmo cuando ya estás cansado — la habilidad clave de las carreras."),
    'IU': ("Por qué intervalos al umbral", "Empujar el techo de lo cómodo y sostenerlo mueve todos los ritmos para arriba."),
    'ST': ("Por qué strides", "Pasadas cortas a alta velocidad mejoran economía y técnica sin sumar fatiga."),
    'TL': ("Por qué tirada larga", "La resistencia se construye con tiempo en pie. Más larga, más fuerte el motor aeróbico."),
    'RA': ("Por qué recuperación activa", "El movimiento suave después de un esfuerzo grande acelera la regeneración más que quedarse quieto."),
    'SC': ("Por qué subidas conversacionales", "Fuerza y potencia con menos impacto que el llano. La cuesta hace de gimnasio."),
    'SF': ("Por qué cuestas fuertes", "Construyen fuerza y potencia con bajo impacto. Subí fuerte, recuperá bien — esa es la fórmula."),
    'TB': ("Por qué técnica de bajada", "Bajar es el otro 50% del trail. Sin práctica, las bajadas destrozan piernas y tiempos."),
    'SMC': ("Por qué simulación trail en ciudad", "Escaleras, cambios de ritmo, terreno mixto — sin salir del barrio. Aproximación al trail."),
    'TLM': ("Por qué tirada larga en montaña", "Resistencia específica para trail. Tiempo en terreno mixto que el llano nunca replica."),
    'CF': ("Por qué caminata fuerte", "En cuestas largas la caminata es estrategia, no debilidad. Te ahorra para terminar."),
    'FG': ("Por qué fuerza general", "Más fuerza = menos lesiones y mejor economía. El runner que entrena fuerza dura más."),
    'FE': ("Por qué fuerza excéntrica", "Bajadas controladas. Lo que prepara las piernas para descender sin destruirse."),
    'PL': ("Por qué pliometría suave", "Los saltos enseñan al sistema elástico a devolver energía. Más eficiencia con el mismo esfuerzo."),
    'MF': ("Por qué movilidad", "El rango de movimiento es libertad para correr bien. Sin esto, todo lo demás cuesta más."),
    'SU': ("Por qué surges", "Aceleraciones cortas dentro de un rodaje easy despiertan velocidad y técnica sin sumar la fatiga de un workout duro."),
    'FK': ("Por qué fartlek", "Alternar ritmos te enseña a cambiar de marcha — clave en carreras de trail con terreno variado."),
    'TE': ("Por qué tempo", "Ritmo sostenido en umbral entrena al cuerpo a tolerar el lactato. Aguantás más tiempo en firme antes de romperte."),
    'PR': ("Por qué progresivo", "Subir intensidad por bloques te entrena a meter cambio cuando ya estás cansado — la habilidad clave de las carreras largas."),
    'HF': ("Por qué hill fartlek", "El terreno hace de cronómetro. Subís duro, recuperás en llanos. Entrenás cardio y técnica al mismo tiempo."),
}
BLOCK_STEP_DESC = {
    'RW': "Alterná 2 min trote suave + 1 min caminata. Si te cuesta sostener el trote, invertí: 1 min trote / 2 min caminata.",
    'RS': "Trote a ritmo conversacional — podés hablar en frases completas todo el rato. Si tenés que cortar a respirar, bajá una marcha.",
    'RP': "Empezás conversacional. En los últimos 5-15 min subís a \"firme\": respiración cargada pero sostenible. La transición es gradual, sin saltos bruscos.",
    'IU': "Intervalos donde la respiración es fuerte pero podés mantenerla unos minutos. Trotá suave entre cada uno, sin pausas paradas — el objetivo es entrenar el umbral, no la velocidad pura.",
    'ST': "Pasadas de 20-30s. Acelerá los primeros 5s, mantené rápido al medio, desacelerá los últimos 5s. Caminá 60-90s entre cada una para recuperar.",
    'TL': "Trote largo a ritmo conversacional. El reloj manda, no el ritmo. Si te cuesta llegar al final, bajá una marcha — no acortes.",
    'RA': "Trote muy suave o caminata rápida — el ritmo donde podés cantar, no solo hablar. Sin pausas planeadas, movimiento continuo.",
    'SC': "Buscá una cuesta moderada (5-8% pendiente). Subí controlado a esfuerzo ~75%, respiración cargada pero podés sostenerla. Trotá la bajada de recuperación. Estructura definida por la sesión.",
    'SF': "Buscá una cuesta moderada-fuerte (~8-10%). Subí intenso (esfuerzo ~90%, respiración fuerte, no hablás). Trotá la bajada como recuperación completa.",
    'TB': "Bajadas en cuesta moderada con pasos cortos y rápidos, brazos abiertos para equilibrio. Mirá 3-4 metros adelante, no a los pies. Aterrizá con el medio del pie (no de talón). 4-6 bajadas de 30-60s, subiendo trotando suave.",
    'SMC': "Recorré la ciudad incluyendo escaleras, calles en pendiente y cambios de ritmo. Subí escaleras de dos en dos. Buscá superficies variadas (asfalto, tierra, plaza).",
    'TLM': "Tirada larga en terreno mixto: cuestas, sendero, ondulaciones. Ritmo conversacional pero el paso varía naturalmente con el terreno — mantené el esfuerzo, no el ritmo exacto.",
    'CF': "Caminata enérgica en terreno con desnivel. Pasos largos, brazos activos. Subiendo: inclinate ligeramente hacia adelante, manos en muslos si la pendiente es fuerte. Bajando: rodillas suaves, pasos cortos.",
    'FG': "Circuito: sentadillas, peso muerto a una pierna, lunges, plancha, puentes. 3 rondas de 8-12 reps por ejercicio, descansando 60-90s entre rondas.",
    'FE': "Énfasis en el descenso del movimiento: sentadillas búlgaras, step-downs, single-leg deadlift. Bajá contando 4 segundos, subí normal. 3-4 reps por lado, 3 rondas.",
    'PL': "Saltos cortos y precisos: brincos en el lugar, saltos a un cajón bajo (20-30cm), skipping. 3 series de 8-10 reps con descanso completo entre series. Aterrizá blando.",
    'MF': "Estiramientos estáticos 30s por grupo muscular: cadera, isquios, gemelos, cuádriceps, espalda baja. Sumá movilidad: rodillas al pecho, círculos de tobillo y cadera, gato-vaca.",
    'SU': "Rodaje easy con aceleraciones cortas (surges) intercaladas. Cada surge es una pasada fuerte pero relajada — la sesión define cuántas y qué duración.",
    'FK': "Alternancia de bloques rápidos seguidos de trote easy. La estructura específica (cuántos, qué duración, qué ritmo) viene en la sesión.",
    'TE': "Tempo sostenido a ritmo de umbral. Respiración fuerte pero podés sostenerla durante todo el bloque. La sesión te dice cuánto y cuántos bloques.",
    'PR': "Rodaje progresivo con subidas de intensidad por bloques. Cada bloque firme un poco más exigente que el anterior — terminás corriendo más rápido que como empezaste.",
    'HF': "Sesión en terreno ondulado: duro en las subidas, easy en los llanos y bajadas. Aprovechás el terreno para meter intensidad sin estructura rígida.",
}
SOFT_BLOCKS = {'RA','RS','MF','CF','SC','TL','TLM','RW','SU'}
HARD_BLOCKS = {'IU','SF','PL','FE','TE','FK','HF'}
GENERIC_TIPS = {
    'carrera': "Quedate del lado del ritmo donde podés hablar. Si te falta el aire, bajá una marcha.",
    'trail':   "En subida acortá el paso y mirá 3-4 metros adelante. En bajada relajá los hombros.",
    'fuerza':  "Calidad > cantidad. Si la técnica se rompe, parás. Mejor 8 reps perfectas que 12 mediocres.",
    'movilidad': "Sin rebotes. Buscá la sensación de estiramiento, no el dolor.",
}
def effort_class(code):
    if code in HARD_BLOCKS: return ("hard","Fuerte")
    if code in SOFT_BLOCKS: return ("soft","Suave")
    return ("soft","Moderado")

INTERVAL_PAT = re.compile(r"(\d+)\s*[x×]\s*(\d+)\s*(s|min|seg)", re.IGNORECASE)
def parse_intervals(note):
    items = []
    for m in INTERVAL_PAT.finditer(note or ""):
        reps = int(m.group(1)); dur = int(m.group(2)); unit = m.group(3).lower()
        items.append((reps, dur, f"{dur} s" if unit.startswith("s") else f"{dur} min"))
    return items

def step_html(node_num, kind, name, dur, desc, effort=None, repeat=None, is_last=False):
    work_class = " work" if kind == "work" else ""
    line = "" if is_last else '<div class="step-line"></div>'
    effort_html = ""
    if effort and not repeat:
        cls, lbl = effort
        effort_html = f'<span class="effort {cls}"><span class="dots"><b></b><b></b><b></b></span> {h(lbl)}</span>'
    repeat_html = ""
    if repeat:
        lines = []
        for ln in repeat["lines"]:
            lines.append(f'''<div class="r-line {ln['kind']}"><span class="r-ic">{ln['ic']}</span><span class="r-tx"><div class="r-main">{h(ln['main'])}</div><div class="r-sub">{h(ln['sub'])}</div></span><span class="r-eff {ln['eff_cls']}">{h(ln['eff'])}</span></div>''')
        repeat_html = f'''
        <div class="repeat">
          <div class="repeat-head"><span class="rh-lbl">Repetir</span><span class="rh-x">×{repeat["reps"]} <small>veces</small></span></div>
          {"".join(lines)}
        </div>'''
    return f'''
    <div class="step{work_class}">
      <div class="step-rail"><div class="step-node">{node_num}</div>{line}</div>
      <div class="step-body">
        <div class="step-head"><span class="step-name">{h(name)}</span><span class="step-dur">{h(dur)}</span></div>
        <div class="step-desc">{h(desc)}</div>
        {effort_html}
        {repeat_html}
      </div>
    </div>'''

def build_steps(session):
    blocks = session["blocks"]; total = session["duration"]
    cats = {blocks_lookup.get(b.get("code"), {}).get("category","?") for b in blocks}
    is_pure_strength = cats.issubset({"fuerza","movilidad"})
    out = []
    if not is_pure_strength and total >= 15:
        warm_min = 5 if total < 35 else 10
        out.append(("warm","Entrada en calor",f"~{warm_min} min",
                    "Trote suave o caminata para activar. Sumá movilidad si lo necesitás.",
                    ("soft","Muy suave"), None))
    elif is_pure_strength:
        out.append(("warm","Activación","~3 min",
                    "Movilidad de tobillo, cadera y hombros. Movimientos lentos y controlados.",
                    ("soft","Muy suave"), None))
    for b in blocks:
        code = b.get("code","")
        blk = blocks_lookup.get(code, {"name": code, "category":"?", "description":""})
        dur_min = b.get("duration_min", 0)
        note = (b.get("note") or "").strip()
        name = blk["name"]
        # Step desc: short generic per block. Long/specific note lives only in
        # the note card at the bottom to avoid duplication.
        desc = BLOCK_STEP_DESC.get(code, blk["description"])
        eff = effort_class(code)
        ivs = parse_intervals(note)
        if ivs and code in {"IU","SF","SC","ST","TB"}:
            for j, (reps, dur, lbl) in enumerate(ivs, 1):
                series_name = f"{name} · serie {j}" if len(ivs) > 1 else name
                if code in ("SF","SC"):
                    rec_main = "Trote de vuelta al inicio"; rec_sub = "Recuperación · bajá suave"
                elif code == "IU":
                    rec_main = "Trote muy suave de recuperación"; rec_sub = "Hasta sentirte listo para la próxima"
                elif code == "ST":
                    rec_main = "Caminata de recuperación"; rec_sub = "Recuperación completa"
                else:
                    rec_main = "Recuperación suave"; rec_sub = "Tomate el tiempo que necesites"
                repeat = {"reps": reps, "lines": [
                    {"kind":"go","ic": "↑" if code in {"SF","SC"} else "→",
                     "main": f"{lbl} de trabajo","sub":"Ritmo exigente","eff":"Fuerte","eff_cls":"hard"},
                    {"kind":"rec","ic":"↻","main":rec_main,"sub":rec_sub,"eff":"Recup","eff_cls":"soft"},
                ]}
                out.append(("work", series_name, f"{reps} reps", desc if j==1 else "Misma estructura, distintas duraciones.", eff, repeat))
        else:
            out.append(("work", name, f"{dur_min} min", desc, eff, None))
    if not is_pure_strength and total >= 15:
        out.append(("cool","Vuelta a la calma","~5 min",
                    "Trote suave + estiramientos livianos para cerrar.",
                    ("soft","Suave"), None))
    elif is_pure_strength:
        out.append(("cool","Cierre","~3 min",
                    "Movilidad final, respiración profunda. Cerrá tranquilo.",
                    ("soft","Muy suave"), None))
    return out

def build_why(session):
    if not session["blocks"]:
        return ("Por qué esta sesión", "Una sesión más en tu camino.")
    code = session["blocks"][0].get("code")
    return BLOCK_WHY.get(code, ("Por qué esta sesión","Una sesión más en tu camino."))

def build_note(session):
    for b in session["blocks"]:
        note = (b.get("note") or "").strip()
        if note:
            return note
    return GENERIC_TIPS.get(primary_cat(session), "Confiá en el proceso. Cada sesión cuenta.")

SESSION_TITLE_OVERRIDES = {
    "Progresivo": "Rodaje Progresivo Pro",
    "Tempo": "Tempo Run",
}

def gen_card(session, idx):
    pcat = primary_cat(session)
    why_title, why_body = build_why(session)
    note_body = build_note(session)
    display_title = SESSION_TITLE_OVERRIDES.get(session["name"], session["name"])
    block_codes = " + ".join(b.get("code","?") for b in session["blocks"])
    block_names = " + ".join(blocks_lookup.get(b.get("code","?"), {"name": b.get("code","?")})["name"] for b in session["blocks"])
    # Tag visible: solo nombre amigable (sin código críptico). El código vive
    # en el meta de la card-head para referencia técnica.
    block_tag = block_names
    overridden = any(b.get("__overridden") for b in session["blocks"])
    badge = '<span class="rev-badge" title="Note revisada vs DB">REV</span>' if overridden else ""

    steps = build_steps(session)
    steps_html = []
    for i, (kind, name, dur, desc, effort, repeat) in enumerate(steps, 1):
        is_last = (i == len(steps))
        steps_html.append(step_html(i, kind, name, dur, desc, effort, repeat, is_last))

    deload_pill = '<span class="pill-deload">Deload</span>' if session["is_deload"] else ""
    appears = ", ".join(sorted(set(session["appears_in"])))
    CAT_LABEL = {"carrera":"Carrera","trail":"Trail","fuerza":"Fuerza","movilidad":"Movilidad","?":"—"}

    return f'''
<article class="catalog-item" id="s{idx}">
  <div class="item-head">
    <span class="item-num">#{idx}{badge}</span>
    <span class="item-title">{h(display_title)}</span>
    <span class="item-meta">{session["duration"]} min · {h(CAT_LABEL.get(pcat,"—"))} · {h(block_names)}</span>
  </div>
  <div class="phone">
    <div class="status-bar"><span class="status-time">9:41</span><div class="status-icons"><span class="signal">5G</span><div class="battery"><div class="battery-fill"></div></div></div></div>
    <div class="topbar">
      <button class="back-btn" aria-label="Volver">←</button>
      <span class="wm">flow<span class="acc">run</span></span>
      <span style="width:38px"></span>
    </div>
    <div class="screen">
      <div class="s-eyebrow">Sesión · Catálogo #{idx}</div>
      <h1 class="s-title">{h(display_title)}</h1>
      <div class="s-meta">
        <span class="m-fact">{session["duration"]} min</span><span class="m-dot"></span>
        <span class="m-fact">{h(CAT_LABEL.get(pcat,"—"))}</span>
        {deload_pill}
      </div>
      <div class="why">
        <span class="why-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 6a6 6 0 0 1 6 6M12 18a6 6 0 0 1-6-6"/></svg></span>
        <span class="why-tx"><strong>{h(why_title)}.</strong> {h(why_body)}</span>
      </div>
      <div class="block-label">
        <span>El entrenamiento</span>
        <span class="bl-type"><span class="bl-tag">{h(block_tag)}</span></span>
      </div>
      <div class="workout">{"".join(steps_html)}</div>
      <div class="note-card">
        <span class="nc-icon">i</span>
        <span class="nc-text">{h(note_body)}</span>
      </div>
      <nav class="tabbar">
        <div class="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" stroke-linecap="round"/></svg><span>Hoy</span></div>
        <div class="tab active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2.5"/><path d="M3 9h18M8 2v4M16 2v4" stroke-linecap="round"/></svg><span>Plan</span></div>
        <div class="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke-linecap="round"/></svg><span>Perfil</span></div>
      </nav>
    </div>
  </div>
  <div class="item-foot"><span class="muted">Aparece en: {h(appears)} · {session["appearances"]}x</span></div>
</article>
'''

# ---- CSS (inlined) ----
CSS = """
:root{
  --trail:#3D6B3F; --trail-deep:#2B4F2D; --trail-tint:oklch(96% 0.018 145);
  --pine:oklch(26% 0.08 145); --lichen:oklch(94% 0.018 145);
  --cream:oklch(98% 0.006 90); --paper:oklch(99.4% 0.004 90); --paper-2:#ffffff;
  --ink:#1B1F1B; --fg:oklch(20% 0.012 145); --muted:oklch(48% 0.012 145);
  --soft:oklch(72% 0.010 145); --border:oklch(89% 0.010 90); --hair:oklch(94% 0.008 90);
  --warn:oklch(78% 0.14 80); --warn-soft:oklch(96% 0.05 90); --warn-deep:#6a4a14;
  --alert:oklch(60% 0.18 25);
  --font:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,Menlo,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--cream);color:var(--fg);min-height:100vh;-webkit-font-smoothing:antialiased;font-feature-settings:'cv11','ss03';font-size:14px;line-height:1.55}
.brand-bar{position:sticky;top:0;z-index:50;display:grid;grid-template-columns:1fr auto;align-items:center;gap:24px;padding:18px 32px;border-bottom:1px solid var(--border);background:rgba(247,243,234,0.92);backdrop-filter:blur(10px)}
.brand-bar .lockup{display:flex;align-items:center;gap:12px}
.brand-bar .lockup .wm{font-size:22px;font-weight:600;letter-spacing:-.03em;line-height:1;color:var(--ink);text-transform:lowercase}
.brand-bar .lockup .wm .acc{color:var(--trail)}
.brand-bar .lockup .kicker{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--trail);margin-left:8px;font-weight:600;padding:4px 10px;background:var(--lichen);border-radius:20px}
.brand-bar .summary{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.04em}
.brand-bar .summary strong{color:var(--ink);font-weight:600}
.index-section{padding:24px 32px 8px;border-bottom:1px solid var(--border);background:var(--paper)}
.index-section h2{font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;font-weight:500}
.index-grid{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.index-grid a{display:inline-block;padding:5px 10px;background:var(--paper-2);border:1px solid var(--border);border-radius:8px;font-size:11.5px;color:var(--fg);text-decoration:none;font-variant-numeric:tabular-nums;letter-spacing:-.005em;transition:all .12s}
.index-grid a:hover{background:var(--trail);color:#fff;border-color:var(--trail)}
.index-grid a .num{font-family:var(--mono);color:var(--muted);font-weight:600;margin-right:5px;font-size:10.5px}
.index-grid a:hover .num{color:rgba(255,255,255,.7)}
.legend{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:18px;font-family:var(--mono);font-size:10.5px;color:var(--muted);letter-spacing:.04em}
.legend .lg-item{display:inline-flex;align-items:center;gap:6px}
.legend .dot{width:10px;height:10px;border-radius:50%}
main{padding:36px 24px 120px;display:grid;grid-template-columns:repeat(auto-fill, minmax(380px, 1fr));gap:32px;max-width:1600px;margin:0 auto}
.catalog-item{display:flex;flex-direction:column;align-items:center}
.item-head{width:100%;max-width:340px;margin-bottom:14px;text-align:center}
.item-num{display:inline-block;font-family:var(--mono);font-size:11px;font-weight:700;color:var(--trail);background:var(--lichen);padding:3px 9px;border-radius:6px;letter-spacing:.04em;margin-bottom:6px}
.rev-badge{display:inline-block;margin-left:6px;background:var(--warn-soft);color:var(--warn-deep);border:1px solid color-mix(in oklch, var(--warn) 35%, transparent);padding:1px 6px;border-radius:5px;font-size:8.5px;letter-spacing:.12em}
.item-title{display:block;font-size:18px;font-weight:700;color:var(--ink);letter-spacing:-.018em;line-height:1.15;margin-bottom:3px}
.item-meta{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:500}
.item-foot{width:100%;max-width:340px;margin-top:12px;text-align:center}
.item-foot .muted{font-family:var(--mono);font-size:10px;color:var(--soft);letter-spacing:.04em}
.phone{width:340px;background:var(--paper);border:1px solid var(--border);border-radius:38px;overflow:hidden;display:flex;flex-direction:column;box-shadow:inset 0 1px 0 rgba(255,255,255,0.7),0 1px 3px rgba(20,30,20,0.04),0 14px 28px -14px rgba(20,30,20,0.16),0 40px 72px -36px rgba(20,30,20,0.24)}
.status-bar{display:flex;justify-content:space-between;align-items:center;padding:16px 26px 4px;flex-shrink:0}
.status-time{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--ink);letter-spacing:-.01em}
.status-icons{display:flex;gap:5px;align-items:center;color:var(--ink)}
.status-icons .signal{font-family:var(--mono);font-size:9px;letter-spacing:.08em;font-weight:600}
.battery{width:18px;height:9px;border:1px solid currentColor;border-radius:2px;position:relative;padding:1px;display:inline-flex;align-items:center}
.battery::after{content:'';position:absolute;right:-3px;top:50%;transform:translateY(-50%);width:2px;height:5px;background:currentColor;border-radius:0 1px 1px 0}
.battery-fill{height:100%;background:currentColor;border-radius:.5px;width:78%}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:8px 20px 2px}
.back-btn{width:38px;height:38px;border-radius:12px;border:1px solid var(--border);background:var(--paper-2);display:flex;align-items:center;justify-content:center;font-size:16px;color:var(--fg);cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,0.5)}
.topbar .wm{font-size:19px;font-weight:600;letter-spacing:-.03em;color:var(--ink);text-transform:lowercase;display:flex;align-items:center;gap:7px}
.topbar .wm .acc{color:var(--trail)}
.screen{padding:14px 20px 0;display:flex;flex-direction:column}
.s-eyebrow{font-family:var(--mono);font-size:10px;color:var(--trail);letter-spacing:.2em;text-transform:uppercase;font-weight:600;display:flex;align-items:center;gap:10px;margin-bottom:8px}
.s-eyebrow::before{content:'';width:20px;height:1.5px;background:var(--trail);border-radius:1px}
.s-title{font-size:30px;font-weight:700;letter-spacing:-.03em;color:var(--ink);line-height:1.04;margin-bottom:10px}
.s-meta{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.s-meta .m-fact{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;font-weight:500}
.s-meta .m-dot{width:3px;height:3px;border-radius:50%;background:var(--soft)}
.pill-deload{margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--warn-deep);background:var(--warn-soft);padding:5px 9px;border-radius:20px;border:1px solid color-mix(in oklch, var(--warn) 30%, transparent)}
.why{display:grid;grid-template-columns:auto 1fr;gap:11px;align-items:start;background:var(--lichen);border-radius:14px;padding:12px 14px;margin-bottom:20px}
.why .why-ic{width:24px;height:24px;border-radius:8px;background:var(--paper);border:1px solid var(--trail);color:var(--trail);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.why .why-ic svg{width:13px;height:13px}
.why .why-tx{font-size:12.5px;line-height:1.45;color:var(--trail-deep);letter-spacing:-.005em}
.why .why-tx strong{color:var(--ink);font-weight:600}
.block-label{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px}
.block-label .bl-type{display:inline-flex;align-items:center;gap:6px;color:var(--trail);flex-shrink:1;min-width:0}
.block-label .bl-tag{font-size:8.5px;background:var(--lichen);color:var(--trail);padding:3px 7px;border-radius:5px;letter-spacing:.1em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px}
.workout{position:relative;margin-bottom:18px}
.step{display:grid;grid-template-columns:30px 1fr;gap:12px;position:relative}
.step-rail{display:flex;flex-direction:column;align-items:center}
.step-node{width:30px;height:30px;border-radius:50%;background:color-mix(in oklch, var(--warn) 22%, white);border:1.5px solid color-mix(in oklch, var(--warn) 55%, white);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;font-weight:700;color:var(--warn-deep);flex-shrink:0;z-index:1;box-shadow:0 0 0 4px color-mix(in oklch, var(--warn) 8%, white)}
.step.work .step-node{border-color:var(--trail);background:var(--trail);color:#fff;box-shadow:0 0 0 4px var(--trail-tint)}
.step-line{flex:1;width:1.5px;background:var(--hair);margin:2px 0}
.step:last-child .step-line{display:none}
.step-body{padding-bottom:16px;min-width:0}
.step-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.step-name{font-size:14px;font-weight:600;color:var(--ink);letter-spacing:-.015em;line-height:1.2}
.step-dur{font-family:var(--mono);font-size:11px;color:var(--muted);font-weight:600;letter-spacing:.02em;white-space:nowrap}
.step-desc{font-size:12px;color:var(--muted);line-height:1.4;margin-top:3px;letter-spacing:-.005em}
.effort{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:7px}
.effort .dots{display:inline-flex;gap:2.5px}
.effort .dots b{width:5px;height:5px;border-radius:50%;background:var(--border)}
.effort.soft .dots b:nth-child(1){background:var(--trail)}
.effort.soft{color:var(--trail)}
.effort.hard .dots b{background:var(--alert)}
.effort.hard{color:var(--alert)}
.repeat{margin-top:10px;border:1px solid var(--border);border-radius:13px;overflow:hidden;background:var(--paper-2);box-shadow:inset 0 1px 0 rgba(255,255,255,0.5)}
.repeat-head{display:flex;align-items:center;justify-content:space-between;padding:8px 13px;background:linear-gradient(to right, var(--trail-tint), var(--paper-2) 80%);border-bottom:1px solid var(--hair)}
.repeat-head .rh-lbl{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.repeat-head .rh-x{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);font-weight:700;color:var(--trail);font-size:15px;letter-spacing:.01em}
.repeat-head .rh-x small{font-size:9px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.r-line{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:9px 13px}
.r-line + .r-line{border-top:1px dashed var(--hair)}
.r-line .r-ic{width:22px;height:22px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;font-family:var(--mono);font-weight:700}
.r-line.go .r-ic{background:var(--trail);color:#fff}
.r-line.rec .r-ic{background:var(--cream);color:var(--soft);border:1px solid var(--border)}
.r-line .r-tx{min-width:0}
.r-line .r-tx .r-main{font-size:12.5px;font-weight:600;color:var(--ink);letter-spacing:-.012em;line-height:1.25}
.r-line.rec .r-tx .r-main{font-weight:500;color:var(--muted)}
.r-line .r-tx .r-sub{font-size:10.5px;color:var(--muted);margin-top:1px;letter-spacing:-.005em}
.r-line .r-eff{font-family:var(--mono);font-size:8.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 7px;border-radius:6px;white-space:nowrap}
.r-line .r-eff.hard{background:color-mix(in oklch, var(--alert) 14%, white);color:var(--alert)}
.r-line .r-eff.soft{background:var(--lichen);color:var(--trail)}
.note-card{background:var(--cream);border:1px solid var(--hair);border-radius:13px;padding:12px 14px;margin-bottom:22px;display:grid;grid-template-columns:auto 1fr;gap:11px;align-items:start}
.note-card .nc-icon{font-family:var(--mono);font-size:10px;font-weight:700;color:var(--trail);background:var(--paper);width:23px;height:23px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;border:1px solid var(--trail)}
.note-card .nc-text{font-size:12px;color:var(--fg);line-height:1.5;letter-spacing:-.005em}
.tabbar{display:flex;border-top:1px solid var(--border);background:var(--paper);margin-top:14px;padding:10px 0 18px}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;color:var(--soft);cursor:pointer}
.tab.active{color:var(--trail)}
.tab svg{width:22px;height:22px}
.tab span{font-size:10.5px;font-weight:500;letter-spacing:-.01em}
@media (max-width: 700px){.brand-bar{grid-template-columns:1fr;text-align:center}}
"""

index_html = []
for i, s in enumerate(unique_list, 1):
    overridden = any(b.get("__overridden") for b in s["blocks"])
    star = " ★" if overridden else ""
    index_html.append(f'<a href="#s{i}"><span class="num">#{i}</span>{h(s["name"])}{star}</a>')

cards_html = [gen_card(s, i) for i, s in enumerate(unique_list, 1)]

html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FlowRun · Catálogo de sesiones</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<header class="brand-bar">
  <div class="lockup">
    <span class="wm">flow<span class="acc">run</span></span>
    <span class="kicker">Catálogo · sesiones</span>
  </div>
  <div class="summary"><strong>{len(unique_list)}</strong> sesiones únicas · {len(sessions)} en total · {override_count} con note revisada (★)</div>
</header>
<section class="index-section">
  <h2>Índice — ★ = note revisada</h2>
  <div class="index-grid">{"".join(index_html)}</div>
  <div class="legend">
    <span class="lg-item"><span class="dot" style="background:color-mix(in oklch, var(--warn) 55%, white)"></span> Entrada / Vuelta a la calma</span>
    <span class="lg-item"><span class="dot" style="background:var(--trail)"></span> Trabajo principal</span>
    <span class="lg-item"><span class="dot" style="background:var(--warn-soft);border:1px solid var(--warn)"></span> Pill = deload · badge REV = note editada</span>
  </div>
</section>
<main>
{"".join(cards_html)}
</main>
</body>
</html>
"""

OUT.write_text(html)
print(f"Wrote: {OUT}")
print(f"Sessions: {len(unique_list)} unique, {override_count} with note overrides")
print(f"Size: {OUT.stat().st_size / 1024:.0f} KB")
