-- ============================================================================
-- FlowRun — Migration 0016: Aclarar contenido de sesiones
-- ============================================================================
-- Generada desde discovery/session-note-overrides.json + gen-catalog.py.
-- Cambios:
--   1) workout_blocks.description: descripciones concretas (qué hacer) por bloque.
--   2) template_sessions.session_name: renombres a versiones amigables.
--   3) template_sessions.blocks: 56 notes revisadas (match por
--      name + duration + block_code + original_note).
-- Idempotente: condiciones de WHERE evitan re-aplicar.
-- ============================================================================

-- 1) workout_blocks: descripciones concretas
-- ---------------------------------------------------------------------------

update public.workout_blocks set description = 'Alterná 2 min trote suave + 1 min caminata. Si te cuesta sostener el trote, invertí: 1 min trote / 2 min caminata.' where code = 'RW';
update public.workout_blocks set description = 'Trote a ritmo conversacional — podés hablar en frases completas todo el rato. Si tenés que cortar a respirar, bajá una marcha.' where code = 'RS';
update public.workout_blocks set description = 'Empezás conversacional. En los últimos 5-15 min subís a "firme": respiración cargada pero sostenible. La transición es gradual, sin saltos bruscos.' where code = 'RP';
update public.workout_blocks set description = 'Intervalos donde la respiración es fuerte pero podés mantenerla unos minutos. Trotá suave entre cada uno, sin pausas paradas — el objetivo es entrenar el umbral, no la velocidad pura.' where code = 'IU';
update public.workout_blocks set description = 'Pasadas de 20-30s. Acelerá los primeros 5s, mantené rápido al medio, desacelerá los últimos 5s. Caminá 60-90s entre cada una para recuperar.' where code = 'ST';
update public.workout_blocks set description = 'Trote largo a ritmo conversacional. El reloj manda, no el ritmo. Si te cuesta llegar al final, bajá una marcha — no acortes.' where code = 'TL';
update public.workout_blocks set description = 'Trote muy suave o caminata rápida — el ritmo donde podés cantar, no solo hablar. Sin pausas planeadas, movimiento continuo.' where code = 'RA';
update public.workout_blocks set description = 'Buscá una cuesta moderada (5-8% pendiente). Subí controlado a esfuerzo ~75%, respiración cargada pero podés sostenerla. Trotá la bajada de recuperación. Estructura definida por la sesión.' where code = 'SC';
update public.workout_blocks set description = 'Buscá una cuesta moderada-fuerte (~8-10%). Subí intenso (esfuerzo ~90%, respiración fuerte, no hablás). Trotá la bajada como recuperación completa.' where code = 'SF';
update public.workout_blocks set description = 'Bajadas en cuesta moderada con pasos cortos y rápidos, brazos abiertos para equilibrio. Mirá 3-4 metros adelante, no a los pies. Aterrizá con el medio del pie (no de talón). 4-6 bajadas de 30-60s, subiendo trotando suave.' where code = 'TB';
update public.workout_blocks set description = 'Recorré la ciudad incluyendo escaleras, calles en pendiente y cambios de ritmo. Subí escaleras de dos en dos. Buscá superficies variadas (asfalto, tierra, plaza).' where code = 'SMC';
update public.workout_blocks set description = 'Tirada larga en terreno mixto: cuestas, sendero, ondulaciones. Ritmo conversacional pero el paso varía naturalmente con el terreno — mantené el esfuerzo, no el ritmo exacto.' where code = 'TLM';
update public.workout_blocks set description = 'Caminata enérgica en terreno con desnivel. Pasos largos, brazos activos. Subiendo: inclinate ligeramente hacia adelante, manos en muslos si la pendiente es fuerte. Bajando: rodillas suaves, pasos cortos.' where code = 'CF';
update public.workout_blocks set description = 'Circuito: sentadillas, peso muerto a una pierna, lunges, plancha, puentes. 3 rondas de 8-12 reps por ejercicio, descansando 60-90s entre rondas.' where code = 'FG';
update public.workout_blocks set description = 'Énfasis en el descenso del movimiento: sentadillas búlgaras, step-downs, single-leg deadlift. Bajá contando 4 segundos, subí normal. 3-4 reps por lado, 3 rondas.' where code = 'FE';
update public.workout_blocks set description = 'Saltos cortos y precisos: brincos en el lugar, saltos a un cajón bajo (20-30cm), skipping. 3 series de 8-10 reps con descanso completo entre series. Aterrizá blando.' where code = 'PL';
update public.workout_blocks set description = 'Estiramientos estáticos 30s por grupo muscular: cadera, isquios, gemelos, cuádriceps, espalda baja. Sumá movilidad: rodillas al pecho, círculos de tobillo y cadera, gato-vaca.' where code = 'MF';
update public.workout_blocks set description = 'Rodaje easy con aceleraciones cortas (surges) intercaladas. Cada surge es una pasada fuerte pero relajada — la sesión define cuántas y qué duración.' where code = 'SU';
update public.workout_blocks set description = 'Alternancia de bloques rápidos seguidos de trote easy. La estructura específica (cuántos, qué duración, qué ritmo) viene en la sesión.' where code = 'FK';
update public.workout_blocks set description = 'Tempo sostenido a ritmo de umbral. Respiración fuerte pero podés sostenerla durante todo el bloque. La sesión te dice cuánto y cuántos bloques.' where code = 'TE';
update public.workout_blocks set description = 'Rodaje progresivo con subidas de intensidad por bloques. Cada bloque firme un poco más exigente que el anterior — terminás corriendo más rápido que como empezaste.' where code = 'PR';
update public.workout_blocks set description = 'Sesión en terreno ondulado: duro en las subidas, easy en los llanos y bajadas. Aprovechás el terreno para meter intensidad sin estructura rígida.' where code = 'HF';

-- 2) template_sessions: renombrar sesiones a títulos amigables
-- ---------------------------------------------------------------------------

update public.template_sessions set session_name = 'Rodaje Progresivo Pro' where session_name = 'Progresivo';
update public.template_sessions set session_name = 'Tempo Run' where session_name = 'Tempo';

-- 3) template_sessions.blocks: 56 notes revisadas
-- ---------------------------------------------------------------------------

-- Cada UPDATE matchea por (session_name + total_duration_min + blocks[0].code
-- + blocks[0].note actual) y reemplaza el note del primer bloque del JSONB.

-- 1. Rodaje + Progresivo (55 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional la mayor parte. Los últimos 10 min subí a ritmo "firme": respiración más cargada pero todavía sostenible — el límite donde podés decir 3-4 palabras seguidas. No esprintes ni acelerones bruscos.'::text), true) where (session_name = 'Rodaje + Progresivo' or session_name = 'Rodaje + Progresivo') and total_duration_min = 55 and blocks->0->>'code' = 'RP' and blocks->0->>'note' = 'Bloque firme controlado al final';

-- 2. Rodaje + Progresivo (55 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote suave los primeros 40 min, después 15 min de cierre firme (respiración cargada, todavía controlada). Es el mismo formato que la semana pasada pero con más tramo firme — empezás a aguantar más tiempo cerca del umbral.'::text), true) where (session_name = 'Rodaje + Progresivo' or session_name = 'Rodaje + Progresivo') and total_duration_min = 55 and blocks->0->>'code' = 'RP' and blocks->0->>'note' = 'Último bloque firme al final';

-- 3. Rodaje Celebración (30 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Última sesión del plan — trotá cómodo y reconocé el trabajo de las 8 semanas. Sin presión de ritmo ni duración. Si te quedan ganas de más, eso es señal de motor sano: lo guardás para el próximo plan.'::text), true) where (session_name = 'Rodaje Celebración' or session_name = 'Rodaje Celebración') and total_duration_min = 30 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Cierre del plan';

-- 4. Rodaje Celebración (40 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Última sesión del plan — corré con la satisfacción del trabajo hecho. Aprovechá los 40 min para chequear cómo cambió tu cuerpo desde la semana 1: ¿la respiración se siente más fácil? ¿las piernas más livianas? Ese es el progreso real.'::text), true) where (session_name = 'Rodaje Celebración' or session_name = 'Rodaje Celebración') and total_duration_min = 40 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Cierre del plan, sentí lo logrado';

-- 5. Rodaje Creciendo (35 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Mismo trote conversacional que la semana pasada, pero 5 min más largo. Así crece la base aeróbica: agregando tiempo, no ritmo. Si te cuesta llegar al final, bajá el ritmo — no acortes.'::text), true) where (session_name = 'Rodaje Creciendo' or session_name = 'Rodaje Creciendo') and total_duration_min = 35 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = '+5 vs semana pasada';

-- 6. Rodaje Easy (30 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional + 4 strides al final. Un stride es una pasada de 10 segundos a paso largo y suelto (rápido pero sin esprintar). Recuperá 60s caminando entre cada una. Despiertan las piernas y mejoran técnica sin sumar fatiga.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 30 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Con 4 x 10s strides relajados';

-- 7. Rodaje Easy (40 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional + 6 strides al final. Un stride es una pasada de 20 segundos a paso largo y suelto (rápido pero sin esprintar). Entre cada uno, 2-3 minutos de trote muy suave para recuperar. Despiertan las piernas y mejoran técnica sin sumar fatiga.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 40 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Con 6 x 20s strides, 2-3 min trote easy entre cada aceleración';

-- 8. Rodaje Easy (60 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional + 6 strides al final. Un stride es una pasada de 20 segundos a paso largo y suelto (rápido pero sin esprintar). Entre cada uno, 2-3 minutos de trote muy suave para recuperar. Despiertan las piernas y mejoran técnica sin sumar fatiga.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 60 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Con 6 x 20s strides, 2-3 min trote easy entre';

-- 9. Rodaje Easy (40 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional + 6 strides al final. Un stride es una pasada de 20 segundos a paso largo y suelto (rápido pero sin esprintar). Entre cada uno, 2-3 minutos de trote muy suave para recuperar. Despiertan las piernas y mejoran técnica sin sumar fatiga.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 40 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Con 6 x 20s strides, 2-3 min trote easy entre';

-- 10. Rodaje Easy (30 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional + 6 strides al final. Un stride es una pasada de 20 segundos a paso largo y rápido pero no extenuante (sentís la zancada abrirse, no que te falta el aire). Entre cada uno, 2-3 minutos de trote muy suave. Despiertan las piernas sin sumar fatiga.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 30 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Con 6 x 20s strides rápidos pero no extenuantes, 2-3 min trote easy entre';

-- 11. Rodaje Easy (48 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional + 6 strides al final, en terreno llano. Un stride es una pasada de 20 segundos a paso largo y suelto (rápido pero sin esprintar). Recuperá 60-90s caminando o con trote muy suave entre cada uno. Despiertan las piernas y mejoran técnica sin sumar fatiga.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 48 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Con 6 x 20s strides (llano)';

-- 12. Rodaje Easy (48 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional + 6 strides al final. Un stride es una pasada de 20 segundos a paso largo y suelto (rápido pero sin esprintar). Recuperá 60-90s caminando o con trote muy suave entre cada uno. Despiertan las piernas y mejoran técnica sin sumar fatiga.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 48 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Con 6 x 20s strides';

-- 13. Rodaje Easy (60 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional + 6 strides al final. Un stride es una pasada de 20 segundos a paso largo y suelto (rápido pero sin esprintar). Recuperá 60-90s caminando o con trote muy suave entre cada uno. Despiertan las piernas y mejoran técnica sin sumar fatiga.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 60 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Con 6 x 20s strides';

-- 14. Rodaje Easy (36 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional + 4 strides relajados al final, en terreno llano. Un stride es una pasada de 20 segundos a paso largo y rápido pero suelto (sin esprintar). Recuperá 60-90s caminando o con trote muy suave entre cada uno. Despiertan las piernas sin sumar fatiga.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 36 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Con 4 x 20s strides relajados (llano)';

-- 15. Rodaje Easy (40 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Probá la estrategia de comida y bebida que vas a usar el día de la carrera. Cada 30 min comé/bebé algo de lo que pensás consumir (gel, fruta, isotónica). Es entrenamiento del estómago — más importante que el ritmo en este rodaje.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 40 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'Buen día para probar tu estrategia de combustible (*).';

-- 16. Rodaje Easy (48 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional la primera parte. En los últimos 20 min metés 10 minutos a ritmo firme controlado: respiración cargada pero todavía sostenible (esfuerzo ~65-70% del máximo, como si fueras a correr 3 horas). Cerrás los últimos 10 min volviendo a easy.'::text), true) where (session_name = 'Rodaje Easy' or session_name = 'Rodaje Easy') and total_duration_min = 48 and blocks->0->>'code' = 'RS' and blocks->0->>'note' = 'En los últimos 20 min: 10 min @ 3h race pace (65-70%)';

-- 17. Cuestas (45 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('5 × (1 min duro cuesta arriba + 1 min de bajada easy). Después 3 min de trote suave de transición. Cerrás con 15 min de tempo firme: ritmo controlado, respiración cargada pero todavía sostenible (esfuerzo ~65-70%, como ritmo de carrera de 3 horas).'::text), true) where (session_name = 'Cuestas' or session_name = 'Cuestas') and total_duration_min = 45 and blocks->0->>'code' = 'SF' and blocks->0->>'note' = '5 x (1 min duro cuesta arriba / 1 min bajada easy) + 3 min trote easy + 15 min tempo @ 3h race pace (65-70%)';

-- 18. Cuestas (45 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('4 × 2 min duro cuesta arriba, con trote suave de bajada como recuperación. Después 25 min de tempo más exigente: ritmo de umbral, respiración fuerte pero podés sostenerlo (esfuerzo ~80-85%, como ritmo de carrera de 2 horas).'::text), true) where (session_name = 'Cuestas' or session_name = 'Cuestas') and total_duration_min = 45 and blocks->0->>'code' = 'SF' and blocks->0->>'note' = '4 x 2 min duro cuesta arriba con trote bajada + 25 min tempo @ 2h race pace (80-85%)';

-- 19. Tirada Larga (88 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Tirada larga con un tramo firme intercalado. Hacé la mayor parte (aprox los primeros 50 min) en trote conversacional. Después ~20 min a ritmo firme controlado: respiración cargada pero sostenible (esfuerzo ~80%, ritmo de umbral). Cerrás los últimos ~15 min volviendo a easy.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 88 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'Con pickup: 5 mi easy + 2 mi @ 1.5h race pace (80%) + 1 mi easy';

-- 20. Tirada Larga (121 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Misma estructura que la sesión más corta, pero más larga. Arrancás cómodo en trote conversacional (aprox los primeros 85 min). Después ~20 min a ritmo firme controlado: respiración cargada pero sostenible (esfuerzo ~80%, ritmo de umbral). Cerrás los últimos ~15 min volviendo a easy.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 121 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'Con pickup: 8 mi easy + 2 mi @ 1.5h race pace (80%) + 1 mi easy';

-- 21. Tirada Larga (99 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('En los últimos 10-15 min del rodaje metés 5 surges. Un surge es una aceleración corta de 30 segundos a ritmo fuerte pero controlado — no más rápido del ritmo al que correrías un 10k. Entre cada surge, 2-3 min de trote suave. Hacelos en terreno llano y firme, no en cuesta.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 99 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'En los últimos 10-15 min: 5 x 30s surges (no más rápido que 10k race pace) con 2-3 min trote entre, en llano firme';

-- 22. Tirada Larga (132 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('En los últimos 25-30 min del rodaje metés un tramo firme de 10 minutos: ritmo de umbral, respiración fuerte pero sostenible (esfuerzo ~75-80%, como ritmo de carrera de 2 horas). Después cerrás los minutos restantes en easy.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 132 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'En las últimas 3 mi: 10 min @ 2h race pace (75-80%)';

-- 23. Tirada Larga (110 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Incluí 3 × 10 minutos a ritmo firme (de umbral, respiración fuerte pero sostenible — esfuerzo ~75-80%, como ritmo de carrera de 2 horas). Entre cada bloque, 5 min de trote suave para recuperar. También probá la estrategia de comida y bebida que vas a usar el día de la carrera: cada 30 min algo de lo que pensás consumir (gel, fruta, isotónica).'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 110 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'Incluí 3 x 10 min @ 2h race pace (75-80%) con 5 min trote entre reps · Buen día para probar tu estrategia de combustible (*).';

-- 24. Tirada Larga (110 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Incluí 3 × 15 minutos a ritmo firme controlado (respiración cargada pero sostenible, esfuerzo ~65-70%, como ritmo de carrera de 3 horas). Entre cada bloque, 5 min de trote suave. Alternativa: reemplazá el rodaje por una carrera de trail de 10 mi (~16 km) o media maratón como prueba de carga. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 110 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'Incluí 3 x 15 min @ 3h race pace (65-70%) con 5 min trote entre reps. ALTERNATIVA: 10-mile o half marathon de trail como carrera de preparación · Buen día para probar tu estrategia de combustible (*).';

-- 25. Tirada Larga (154 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Incluí 2 × 20 minutos a ritmo firme controlado (respiración cargada pero sostenible, esfuerzo ~65-70%, como ritmo de carrera de 3 horas). Entre cada bloque, 5 min de trote suave. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 154 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'Incluí 2 x 20 min @ 3h race pace (65-70%) con 5 min trote entre reps · Buen día para probar tu estrategia de combustible (*).';

-- 26. Tirada Larga (140 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Trote conversacional la mayor parte. En los últimos 20 minutos metés un tramo firme de 10 minutos a ritmo de umbral (respiración fuerte pero sostenible, esfuerzo ~80%, como ritmo de carrera de 2 horas). Cerrás los últimos 10 min volviendo a easy.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 140 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'En los últimos 20 min: 10 min @ 2h race pace (80%)';

-- 27. Tirada Larga (140 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Incluí 45 minutos a ritmo firme controlado (respiración cargada pero sostenible, esfuerzo ~65%, como ritmo de carrera de 3 horas) en el medio del rodaje. El resto en trote conversacional. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 140 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'Incluí 45 min @ 3h race pace (65%) · Buen día para probar tu estrategia de combustible (*).';

-- 28. Tirada Larga (140 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Incluí 60 minutos a ritmo firme controlado (respiración cargada pero sostenible, esfuerzo ~65%, como ritmo de carrera de 3 horas) en el medio del rodaje. El resto en trote conversacional. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 140 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'Incluí 60 min @ 3h race pace (65%) · Buen día para probar tu estrategia de combustible (*).';

-- 29. Tirada Larga (175 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Incluí 75 minutos a ritmo de ultra (levemente más rápido que conversacional, esfuerzo ~60-65%, como ritmo de carrera de 4 horas). El resto en trote conversacional. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 175 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'Incluí 75 min @ 4h race pace · Buen día para probar tu estrategia de combustible (*).';

-- 30. Tirada Larga (210 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Incluí 90 minutos a ritmo de ultra (levemente más rápido que conversacional, esfuerzo ~60-65%, como ritmo de carrera de 4 horas). El resto en trote conversacional. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 210 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'Incluí 90 min @ 4h race pace · Buen día para probar tu estrategia de combustible (*).';

-- 31. Tirada Larga (175 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Incluí 60 minutos a ritmo de ultra (levemente más rápido que conversacional, esfuerzo ~60-65%, como ritmo de carrera de 4 horas). El resto en trote conversacional. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tirada Larga' or session_name = 'Tirada Larga') and total_duration_min = 175 and blocks->0->>'code' = 'TLM' and blocks->0->>'note' = 'Incluí 60 min @ 4h race pace · Buen día para probar tu estrategia de combustible (*).';

-- 32. Aceleraciones (45 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Rodaje easy con aceleraciones relajadas. Incluí 4 × 2 minutos a ritmo de umbral (respiración fuerte pero sostenible, esfuerzo ~80%, como ritmo de carrera de 1.5 horas). Entre cada bloque, 3 minutos de trote suave para recuperar.'::text), true) where (session_name = 'Aceleraciones' or session_name = 'Aceleraciones') and total_duration_min = 45 and blocks->0->>'code' = 'SU' and blocks->0->>'note' = 'Relaxed surges run: incluí 4 x 2 min @ 1.5h race pace con 3 min trote easy entre';

-- 33. Fartlek (45 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('2 × 4 min duro cuesta arriba, con trote suave de bajada como recuperación. Después 20 min de tempo en terreno ondulado: ritmo de umbral (respiración fuerte pero sostenible, esfuerzo ~80-90%, como ritmo de carrera de 1.5 horas). El terreno hace que el paso varíe — mantené el esfuerzo, no el ritmo exacto.'::text), true) where (session_name = 'Fartlek' or session_name = 'Fartlek') and total_duration_min = 45 and blocks->0->>'code' = 'FK' and blocks->0->>'note' = '2 x 4 min duro cuesta arriba con trote bajada. Después: 20 min de tempo ondulado @ 1.5h race pace (80-90%)';

-- 34. Fartlek (45 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Alternancia de ritmos: 5 × (1 minuto fuerte a ritmo de 10k — esfuerzo ~90%, respiración casi al máximo / 5 minutos a ritmo firme controlado — esfuerzo ~65%, como ritmo de carrera de 3 horas).'::text), true) where (session_name = 'Fartlek' or session_name = 'Fartlek') and total_duration_min = 45 and blocks->0->>'code' = 'FK' and blocks->0->>'note' = 'Alternation: 5 x (1 min @ 1h race pace 90% / 5 min @ 3h race pace 65%)';

-- 35. Fartlek (45 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Alternancia de ritmos: 3 × (5 minutos fuerte a ritmo de 10k — esfuerzo ~90%, respiración casi al máximo / 15 minutos steady a ritmo de ultra — esfuerzo ~60-65%, como ritmo de carrera de 4 horas, levemente más rápido que conversacional).'::text), true) where (session_name = 'Fartlek' or session_name = 'Fartlek') and total_duration_min = 45 and blocks->0->>'code' = 'FK' and blocks->0->>'note' = 'Alternation: 3 x (5 min @ 1h race pace 90% / 15 min steady @ 4h race pace)';

-- 36. Hill Fartlek (45 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('20 minutos de alternancia en terreno con cuestas: todas las subidas a ritmo duro (de 10k-15k, esfuerzo ~90-95%, respiración casi al máximo); los llanos y las bajadas a ritmo firme moderado (esfuerzo ~65-70%, como ritmo de carrera de 3 horas). También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Hill Fartlek' or session_name = 'Hill Fartlek') and total_duration_min = 45 and blocks->0->>'code' = 'HF' and blocks->0->>'note' = 'Hill alternations 20 min: todas las subidas duro (40-60 min race pace), llanos y bajadas moderado @ 3h race pace (65-70%) · Buen día para probar tu estrategia de combustible (*).';

-- 37. Hill Fartlek (50 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('25 minutos de alternancia en terreno con cuestas: todas las subidas a ritmo duro (de 10k-15k, esfuerzo ~90-95%, respiración casi al máximo); los llanos y las bajadas a ritmo firme moderado (esfuerzo ~65-70%, como ritmo de carrera de 3 horas). También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Hill Fartlek' or session_name = 'Hill Fartlek') and total_duration_min = 50 and blocks->0->>'code' = 'HF' and blocks->0->>'note' = 'Hill alternations 25 min: subidas duro (40-60 min race pace), llanos y bajadas @ 3h race pace (65-70%) · Buen día para probar tu estrategia de combustible (*).';

-- 38. Progresivo (95 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('10 minutos a ritmo de umbral (respiración fuerte pero sostenible, esfuerzo ~75-80%, como ritmo de carrera de 2 horas), seguido de 5 minutos a ritmo más exigente (de 10k-15k, esfuerzo ~90-95%, respiración casi al máximo).'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 95 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '10 min @ 2h race pace (75-80%) + 5 min @ 40-60 min race pace (90-95%)';

-- 39. Progresivo (40 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('10 minutos a ritmo de umbral (respiración fuerte pero sostenible, esfuerzo ~75-80%, como ritmo de carrera de 2 horas), seguido de 10 minutos a ritmo más exigente (de 10k, esfuerzo ~90-95%, respiración casi al máximo).'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 40 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '10 min @ 2h race pace (75-80%) + 10 min @ 1h race pace (90-95%)';

-- 40. Progresivo (50 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('15 minutos a ritmo de umbral (respiración fuerte pero sostenible, esfuerzo ~75-80%, como ritmo de carrera de 2 horas), seguido de 15 minutos a ritmo más exigente (de 10k, esfuerzo ~90-95%, respiración casi al máximo).'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 50 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '15 min @ 2h race pace (75-80%) + 15 min @ 1h race pace (90-95%)';

-- 41. Progresivo (60 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('20 min progresivos en el medio del rodaje: 10 minutos a ritmo de umbral (esfuerzo ~75-80%, como ritmo de carrera de 2 horas), después 10 minutos a ritmo más exigente (de 10k, esfuerzo ~90-95%, respiración casi al máximo).'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 60 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '20 min total: 10 min @ 2h race pace (75-80%) + 10 min @ 1h race pace (90-95%)';

-- 42. Progresivo (70 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('25 min progresivos en el medio: 10 minutos a ritmo firme controlado (esfuerzo ~65-70%, como ritmo de carrera de 3 horas), después 10 minutos a ritmo de umbral (esfuerzo ~75-80%, como ritmo de 2 horas), después 5 minutos a ritmo más exigente (de 10k, esfuerzo ~90-95%, respiración casi al máximo). También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 70 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '25 min total: 10 min @ 3h race pace (65-70%) + 10 min @ 2h race pace (75-80%) + 5 min @ 1h race pace (90-95%) · Buen día para probar tu estrategia de combustible (*).';

-- 43. Progresivo (80 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('30 min progresivos en el medio: 10 minutos a ritmo firme controlado (esfuerzo ~65-70%, como ritmo de carrera de 3 horas), después 10 minutos a ritmo de umbral (esfuerzo ~75-80%, como ritmo de 2 horas), después 10 minutos a ritmo más exigente (de 10k, esfuerzo ~90-95%, respiración casi al máximo). También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 80 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '30 min total: 10 min @ 3h race pace (65-70%) + 10 min @ 2h race pace (75-80%) + 10 min @ 1h race pace (90-95%) · Buen día para probar tu estrategia de combustible (*).';

-- 44. Progresivo (80 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('30 min progresivos en el medio: 20 minutos a ritmo firme controlado (esfuerzo ~65-70%, como ritmo de carrera de 3 horas), seguido de 10 minutos a ritmo más exigente (de 10k, esfuerzo ~90-95%, respiración casi al máximo). También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 80 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '30 min total: 20 min @ 3h race pace (65-70%) + 10 min @ 1h race pace (90-95%) · Buen día para probar tu estrategia de combustible (*).';

-- 45. Progresivo (50 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('20 minutos a ritmo firme controlado (esfuerzo ~65%, como ritmo de carrera de 3 horas), seguido de 10 minutos a ritmo de umbral (esfuerzo ~80%, como ritmo de 2 horas, respiración fuerte pero sostenible).'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 50 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '20 min @ 3h race pace (65%) + 10 min @ 2h race pace (80%)';

-- 46. Progresivo (60 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('20 minutos a ritmo firme controlado (esfuerzo ~65%, como ritmo de carrera de 3 horas), seguido de 20 minutos a ritmo de umbral (esfuerzo ~80%, como ritmo de 2 horas, respiración fuerte pero sostenible). También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 60 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '20 min @ 3h race pace (65%) + 20 min @ 2h race pace (80%) · Buen día para probar tu estrategia de combustible (*).';

-- 47. Progresivo (60 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('Pirámide ascendente: 20 minutos a ritmo firme controlado (esfuerzo ~65%, como ritmo de carrera de 3 horas), 15 minutos a ritmo de umbral (esfuerzo ~80%, como ritmo de 2 horas), 5 minutos a ritmo más exigente (de 10k, esfuerzo ~90%, respiración casi al máximo). También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 60 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '20 min @ 3h race pace (65%) + 15 min @ 2h race pace (80%) + 5 min @ 1h race pace (90%) · Buen día para probar tu estrategia de combustible (*).';

-- 48. Progresivo (70 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('40 minutos a ritmo de ultra (levemente más rápido que conversacional, esfuerzo ~60-65%, como ritmo de carrera de 4 horas), seguido de 10 minutos a ritmo de umbral (esfuerzo ~80%, respiración fuerte pero sostenible).'::text), true) where (session_name = 'Progresivo' or session_name = 'Rodaje Progresivo Pro') and total_duration_min = 70 and blocks->0->>'code' = 'PR' and blocks->0->>'note' = '40 min @ 4h race pace + 10 min @ 2h race pace (80%)';

-- 49. Tempo (37 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('2 × 12 minutos a ritmo de umbral (respiración fuerte pero sostenible, esfuerzo ~75-80%, como ritmo de carrera de 2 horas). Entre cada bloque, 3 min de trote suave para recuperar. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tempo' or session_name = 'Tempo Run') and total_duration_min = 37 and blocks->0->>'code' = 'TE' and blocks->0->>'note' = '2 x 12 min @ 2h race pace (75-80%) con 3 min trote entre reps · Buen día para probar tu estrategia de combustible (*).';

-- 50. Tempo (40 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('2 × 15 minutos a ritmo de umbral (respiración fuerte pero sostenible, esfuerzo ~75-80%, como ritmo de carrera de 2 horas). Entre cada bloque, 3 min de trote suave para recuperar. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tempo' or session_name = 'Tempo Run') and total_duration_min = 40 and blocks->0->>'code' = 'TE' and blocks->0->>'note' = '2 x 15 min @ 2h race pace (75-80%) con 3 min trote entre reps · Buen día para probar tu estrategia de combustible (*).';

-- 51. Tempo (45 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('En terreno trail ondulado: 20 minutos a ritmo más exigente (de 10k, esfuerzo ~90-95%, respiración casi al máximo). El terreno hace que el paso varíe — mantené el esfuerzo, no el ritmo exacto.'::text), true) where (session_name = 'Tempo' or session_name = 'Tempo Run') and total_duration_min = 45 and blocks->0->>'code' = 'TE' and blocks->0->>'note' = 'En trail ondulado, 20 min @ 1h race pace (90-95%)';

-- 52. Tempo (65 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('40 minutos a ritmo firme controlado (respiración cargada pero sostenible, esfuerzo ~65-75%, como ritmo de carrera de 3 horas). También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tempo' or session_name = 'Tempo Run') and total_duration_min = 65 and blocks->0->>'code' = 'TE' and blocks->0->>'note' = '40 min @ 3h race pace (65-75%) · Buen día para probar tu estrategia de combustible (*).';

-- 53. Tempo (40 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('2 × 15 minutos a ritmo firme controlado (respiración cargada pero sostenible, esfuerzo ~65-70%, como ritmo de carrera de 3 horas). Entre cada bloque, 5 min de trote suave para recuperar. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tempo' or session_name = 'Tempo Run') and total_duration_min = 40 and blocks->0->>'code' = 'TE' and blocks->0->>'note' = '2 x 15 min @ 3h race pace (65-70%) con 5 min trote easy entre reps · Buen día para probar tu estrategia de combustible (*).';

-- 54. Tempo (45 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('2 × 20 minutos a ritmo firme controlado (respiración cargada pero sostenible, esfuerzo ~65-70%, como ritmo de carrera de 3 horas). Entre cada bloque, 5 min de trote suave para recuperar. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tempo' or session_name = 'Tempo Run') and total_duration_min = 45 and blocks->0->>'code' = 'TE' and blocks->0->>'note' = '2 x 20 min @ 3h race pace (65-70%) con 5 min trote easy entre reps · Buen día para probar tu estrategia de combustible (*).';

-- 55. Tempo (55 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('30 minutos sostenidos a ritmo firme controlado (respiración cargada pero sostenible, esfuerzo ~60%, como ritmo de carrera de 3 horas).'::text), true) where (session_name = 'Tempo' or session_name = 'Tempo Run') and total_duration_min = 55 and blocks->0->>'code' = 'TE' and blocks->0->>'note' = '30 min steady @ 3h race pace (60%)';

-- 56. Tempo (45 min) — note revisada
update public.template_sessions set blocks = jsonb_set(blocks, '{0,note}', to_jsonb('2 × 20 minutos sostenidos a ritmo firme controlado (respiración cargada pero sostenible, esfuerzo ~60%, como ritmo de carrera de 3 horas). Entre cada bloque, 5 min de trote suave para recuperar. También probá la estrategia de comida y bebida del día de la carrera.'::text), true) where (session_name = 'Tempo' or session_name = 'Tempo Run') and total_duration_min = 45 and blocks->0->>'code' = 'TE' and blocks->0->>'note' = '2 x 20 min steady @ 3h race pace (60%) con 5 min trote easy entre reps · Buen día para probar tu estrategia de combustible (*).';
