# Identificación de Supuestos Riesgosos — "Ritmo Real"

Fecha: 2026-03-13

---

## Perspectivas de Fallo

### Product Manager — ¿Por qué podría fallar?
- **Demanda real cuestionable**: Zone 2 training es un concepto de nicho. La mayoría de runners recreativos no saben qué es y pueden no interesarles aprenderlo. Los que sí lo saben, ya tienen coach o usan TrainingPeaks.
- **Willingness to pay**: Los principiantes (segmento 1) históricamente pagan poco por apps de running. Los segmentos 2 y 3 son más pequeños y ya están servidos por herramientas existentes.
- **Competencia silenciosa**: Garmin, COROS y Apple Watch ya dan feedback de zona 2 en el reloj. Strava está agregando features de training. ¿Por qué ir a otra app?

### Designer — ¿Por qué podría fallar?
- **Fricción post-run**: Después de correr, la gente quiere ducharse, no abrir otra app para hacer un check-in de 20 segundos. Incluso "20 segundos" puede ser demasiado si no hay recompensa inmediata clara.
- **Onboarding bifurcado**: Tres segmentos muy distintos (principiante / street-to-trail / ultra) requieren experiencias de onboarding diferentes. Si es genérico, no conecta con nadie. Si es específico, la complejidad explota.
- **El "momento wow" tarda**: El valor real (ver tu evolución, bajar tu % de sobresfuerzo) requiere semanas de datos. ¿Qué engancha al usuario en la primera sesión?

### Engineer — ¿Por qué podría fallar?
- **Dependencia de Strava**: Los rate limits de Strava (200 req/15min, 2000/día) son restrictivos. Un spike de usuarios puede bloquear la ingesta. Y Strava puede cambiar las reglas de su API sin aviso.
- **Parsing de archivos FIT/GPX/TCX**: Cada formato tiene variantes según fabricante. El parsing robusto es más trabajo del que parece (campos faltantes, datos corruptos, timezone hell).
- **Sin CTO**: Construir con AI tools es viable para un MVP, pero debugging, performance, seguridad OAuth y mantenimiento a largo plazo requieren expertise que las herramientas no cubren solas.

---

## Supuestos por Categoría de Riesgo

### 1. VALUE (Valor)

| # | Supuesto | Confianza | Test sugerido |
|---|----------|-----------|---------------|
| V1 | Los runners quieren saber su "Ritmo Real" y cambiarían su comportamiento al conocerlo | Media | Entrevistar 15 runners (mix de niveles). Preguntarles: "¿Sabés a qué ritmo deberías correr tus rodajes fáciles? ¿Cómo lo decidís?" Si >60% no tiene respuesta clara → hay dolor |
| V2 | El feedback post-run basado en sensaciones (sin HR) es percibido como valioso y creíble | Baja | Crear un bot de WhatsApp/Telegram que después de cada corrida pregunte RPE + talk test y devuelva un insight. Medir si lo siguen usando después de 2 semanas |
| V3 | Los usuarios volverán a hacer el check-in de 20s repetidamente (no solo 1-2 veces) | Baja | Mismo test del bot. Medir tasa de check-in en semana 1 vs semana 3. Si cae >50% → la fricción es real |
| V4 | "Corridas disfrutables / semana" es una métrica que motiva (vs. km, pace, PRs) | Media | A/B test con landing pages: una con "mejorá tu ritmo" vs otra con "disfrutá más corriendo". Medir cuál genera más signups |
| V5 | Los tres segmentos (principiante / street-to-trail / ultra) encuentran valor en el mismo producto core | Baja | Entrevistas separadas por segmento. Si las necesidades divergen mucho → hay que elegir uno para MVP |

### 2. USABILITY (Usabilidad)

| # | Supuesto | Confianza | Test sugerido |
|---|----------|-----------|---------------|
| U1 | El usuario entiende qué es "Ritmo Real" sin explicación técnica larga | Media | Test de 5 segundos: mostrar la pantalla de resultado a 10 personas. ¿Entienden qué significa y qué hacer con eso? |
| U2 | El check-in post-run no se siente como "trabajo" | Media | Prototipo clickeable. Medir tiempo real de completado y NPS del momento. Si >25 segundos o NPS <7 → rediseñar |
| U3 | Los usuarios sin Strava (modo manual/sensaciones) obtienen suficiente valor | Baja | Comparar retención semana 4: usuarios Strava vs usuarios manuales. Si manual cae >70% → el modo manual no sostiene |
| U4 | El onboarding bifurcado (3 perfiles) no confunde al usuario | Media | Test de usabilidad con 6 personas (2 por segmento). ¿Eligen el perfil correcto? ¿Se sienten identificados? |

### 3. VIABILITY (Viabilidad)

| # | Supuesto | Confianza | Test sugerido |
|---|----------|-----------|---------------|
| B1 | Los principiantes pagarán por análisis de umbral + planes premium | Baja | Encuesta con precio: "¿Pagarías $5/mes por saber tu ritmo ideal y tener un plan adaptado?" Necesitás >30% "sí definitivo" |
| B2 | Los planes de atletas profesionales generan conversión a premium | Media | Landing page con "Seguí el plan de [atleta famoso] adaptado a tu nivel" → medir CTR y email capture vs landing genérica |
| B3 | El modelo freemium genera suficiente conversión (>3-5%) para ser sustentable | Media | Benchmark contra apps similares. Si Strava convierte ~2% y tu base es más chica → los números pueden no cerrar |
| B4 | Los atletas/coaches famosos querrán asociarse y abrir sus planes | Baja | Contactar 5 atletas/coaches de trail LATAM. ¿Están dispuestos? ¿Qué piden a cambio? Esto puede ser blocker legal y económico |
| B5 | El costo de infraestructura (Strava API + hosting + AI) es manejable con ingresos freemium | Media | Calcular costo por usuario activo mensual (API calls + compute + storage). Si >$0.50/user y conversion <3% → no cierra |

### 4. FEASIBILITY (Factibilidad)

| # | Supuesto | Confianza | Test sugerido |
|---|----------|-----------|---------------|
| F1 | El feedback engine v1 (sin ML, basado en reglas) da insights suficientemente buenos | Media | Correr el algoritmo con 20 actividades reales (tuyas y de amigos). ¿El feedback suena útil o genérico? Evaluar con los propios runners |
| F2 | Parsing de FIT/GPX/TCX funciona confiablemente con archivos de distintos dispositivos | Baja | Recolectar 30 archivos de distintos relojes (Garmin, COROS, Suunto, Apple Watch, Polar). Parsear todos. Medir % de éxito |
| F3 | La integración Strava se mantiene estable (no cambian API/TOS) | Media | Riesgo de plataforma no testeable. Mitigación: siempre tener fallback de import + manual. No depender 100% de Strava |
| F4 | Un solo founder sin background técnico puede mantener y evolucionar el producto post-MVP | Baja | Spike: después del MVP, intentar agregar una feature nueva solo con AI tools. Si toma >3x lo esperado → necesitás co-founder técnico |
| F5 | PWA es suficiente para la experiencia mobile (vs app nativa) | Media | Testear en 5 dispositivos Android/iOS distintos. ¿Push notifications funcionan? ¿Se siente nativa? En iOS las PWA tienen limitaciones |

### 5. ETHICS (Ética)

| # | Supuesto | Confianza | Test sugerido |
|---|----------|-----------|---------------|
| E1 | Dar recomendaciones de ritmo/intensidad sin ser profesional de salud no genera riesgo legal | Baja | Consultar con abogado. En USA hay regulaciones sobre "medical advice". Disclaimer no siempre alcanza. Especialmente si alguien se lesiona siguiendo la app |
| E2 | Los datos de salud (HR, actividad) se manejan correctamente bajo GDPR/regulaciones de datos de salud | Media | Si operás en USA → HIPAA puede aplicar si manejás datos de salud. En EU → GDPR. Necesitás política de privacidad sólida desde día 1 |
| E3 | El "anti-Strava" positioning no genera problemas con Strava (TOS, API access) | Media | Revisar TOS de Strava API. Si tu marketing ataca a Strava directamente, podrían revocar acceso. Ser "alternativa" es distinto a ser "anti" |

### 6. GO-TO-MARKET

| # | Supuesto | Confianza | Test sugerido |
|---|----------|-----------|---------------|
| G1 | Los runners de trail encuentran la app orgánicamente (sin budget de marketing) | Baja | Crear contenido en Instagram/TikTok sobre "por qué corrés demasiado rápido" durante 30 días. Medir engagement y signups. Si <100 signups → necesitás paid |
| G2 | El mensaje "corré a tu ritmo real" resuena más que "mejorá tu tiempo" | Media | A/B test en ads (puede ser orgánico): dos copies distintos, medir CTR. Lo contraintuitivo ("corré más lento") puede ser viral o puede no conectar |
| G3 | LATAM y USA pueden servirse con el mismo producto (solo cambiando idioma) | Media | El runner estadounidense tiene más datos (wearables, HR), paga más, y espera más polish. El latinoamericano puede necesitar más educación y menor precio. Entrevistar 5 de cada mercado |
| G4 | Podemos adquirir usuarios sin estar en App Store / Play Store (solo PWA) | Baja | Mucha gente busca "running app" en stores, no en Google. Sin presencia en stores, perdés el canal de descubrimiento más grande. Medir: ¿cuántos de tus primeros 100 usuarios vienen de búsqueda web vs referral? |
| G5 | El boca a boca funciona ("mirá mi Ritmo Real") como loop viral | Media | ¿Hay algo compartible? En Strava compartís un mapa/PR. ¿Qué compartís de Ritmo Real? Diseñar un "share card" y medir si la gente lo comparte |

### 7. STRATEGY & OBJECTIVES

| # | Supuesto | Confianza | Test sugerido |
|---|----------|-----------|---------------|
| S1 | "Zona 2 / Ritmo Real" es una categoría sustentable, no solo una feature que cualquiera puede copiar | Baja | Si Garmin/COROS agregan "Real Pace" como feature nativa en el reloj → tu diferencial desaparece. ¿Qué tenés que no puedan copiar en 6 meses? |
| S2 | Servir 3 segmentos distintos es mejor que dominar 1 | Baja | La mayoría de startups exitosas empiezan dominando 1 nicho. Tres segmentos diluyen foco, mensaje y prioridades. Validar cuál tiene más dolor y empezar ahí |
| S3 | El timing es correcto (2026) para esta categoría | Media | Zone 2 training está en tendencia (podcasts, Huberman, Inigo San Millán). Pero las tendencias fitness son cíclicas. ¿Es hype o cambio permanente? Monitorear Google Trends |
| S4 | Un producto sin comunidad puede retener usuarios de running | Baja | Strava retiene por lo social. Si tu app es solo "feedback individual" sin conexión social → ¿por qué vuelve el usuario cuando ya sabe su ritmo? |

### 8. TEAM

| # | Supuesto | Confianza | Test sugerido |
|---|----------|-----------|---------------|
| T1 | Un solo founder puede llevar producto + tech + marketing + operaciones | Baja | Esto es el riesgo más subestimado. Planificar: ¿en qué punto necesitás ayuda? ¿Podés llegar a 100 usuarios solo? ¿Y a 1000? |
| T2 | AI tools (Claude Code, Codex) son suficientes para mantener el producto a largo plazo | Media | Funciona para MVP. Pero debugging en producción, migraciones de DB, seguridad, performance → requieren criterio técnico. Evaluar después de 3 meses de MVP en producción |
| T3 | El founder tiene suficiente expertise en fisiología del running para que el feedback sea creíble | Media | Sos runner avanzado (nivel 71.2), pero ¿tenés base científica para diseñar algoritmos de entrenamiento? Considerar advisory board con fisiólogo deportivo |

---

## Top 5 Supuestos Más Riesgosos (Priorizar Validación)

| Prioridad | Supuesto | Por qué es crítico |
|-----------|----------|-------------------|
| 1 | **V3** — Los usuarios harán check-in repetidamente | Sin check-in no hay datos → no hay feedback → no hay producto. Es el punto de fallo más probable |
| 2 | **S1** — Zona 2 es categoría, no feature | Si es solo una feature, Garmin/COROS la agregan y te quedás sin diferencial. Necesitás algo más profundo |
| 3 | **G4** — Adquirir usuarios sin App Store | PWA es técnicamente elegante pero comercialmente limitante. La mayoría busca apps en stores |
| 4 | **S2** — 3 segmentos diluyen foco | Principiante, street-to-trail y ultra son mundos distintos. Elegí uno para MVP |
| 5 | **T1** — Solo founder sin técnico | El MVP se puede construir, pero ¿quién lo mantiene cuando se rompa en producción a las 3am? |

---

## Experimentos Recomendados (Orden de Ejecución)

1. **Semana 1-2**: Entrevistar 15 runners (5 por segmento). Validar V1, V5, S2. Elegir segmento ganador.
2. **Semana 2-3**: Bot de WhatsApp que simule el check-in + feedback. Validar V2, V3, U2.
3. **Semana 3-4**: Landing page con 2 copies distintos + email capture. Validar G2, V4, B1.
4. **Semana 4-5**: Parsear 30 archivos FIT/GPX de distintos relojes. Validar F2.
5. **Semana 5-6**: Correr feedback engine v1 con datos reales (tuyos + 10 testers). Validar F1, T3.
