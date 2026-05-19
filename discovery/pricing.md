# Pricing & Monetización — FlowRun

Fecha: 2026-05-18

---

## Modelo

**Free trial de 15 días → paywall obligatorio el día 15.**

Sin pedir tarjeta para arrancar. Día 15 se bloquea el uso hasta suscripción activa.

---

## Tiers de precio

### Mensual (renovación automática)
| Moneda | Precio | Equivalente |
|---|---|---|
| ARS | $7.000 / mes | ~5 USD al tipo de cambio oficial |
| USD | $5 / mes | — |

### Pack 3 meses (pago único, sin renovación automática)
| Moneda | Precio total | Por mes | Descuento vs mensual |
|---|---|---|---|
| ARS | $18.000 (3 meses) | $6.000 | **14% off** (ahorra $3.000) |
| USD | $12 (3 meses) | $4 | **20% off** (ahorra $3) |

**Tope**: máximo 3 meses por compra. No hay packs anuales (por ahora).

---

## Routing de pago por geografía

| Origen del usuario | Método de pago |
|---|---|
| 🇦🇷 Argentina | Transferencia bancaria (ARS) |
| 🌎 Resto del mundo | **Una sola pasarela internacional** con tarjeta en USD |

**Detección**: por IP + idioma del dispositivo. Usuario puede forzar manualmente la moneda.

**Confirmado 2026-05-18**: para usuarios fuera de Argentina sólo se ofrece tarjeta internacional (sin transferencia, sin alternativas locales tipo SEPA o iDEAL). Esto simplifica el setup técnico y legal a costa de algo de conversión en mercados como Europa donde la tarjeta es menos usada.

---

## Paywall — UX

### Disparador
- Día 15 desde el signup (no desde el primer plan generado)
- Soft warning a partir del día 12: banner "Te quedan 3 días de prueba" en home

### Pantalla de paywall (día 15)
Contenido a mostrar:
- Resumen del valor entregado en 15 días ("Llevás X sesiones, Y disfrutables, mejoraste tu ritmo Real en Z%")
- Tier mensual destacado
- Pack 3 meses con badge "Ahorrás 14% / 20%"
- Botón principal: pagar
- Link secundario: "Cancelar" (mantiene cuenta pero sin acceso a plan)

### Bloqueo
- No puede ver el plan ni hacer check-in
- Sí puede ver su historial de las 2 primeras semanas
- Sí puede cambiar de pista (volver a onboarding) — pero al salir vuelve al paywall

---

## Decisiones tomadas (2026-05-18)

### Plataforma
- **PWA** (no nativa). Esquiva fee de App Store/Play Store (15-30%). Trade-off: fricción de instalación más alta, hay que educar al usuario para "agregar a pantalla de inicio".

### Producto
- **Free trial = producto completo durante 15 días.** No hay features bloqueadas en el trial; el muro es de tiempo, no de features.
- **Planes Avanzados de Sarah McCormack están incluidos en el pricing base.** No son add-on ni tier superior. Un usuario que paga tiene acceso a todo el catálogo (Cero / Calle→Trail / Mejorar Trail / Avanzados). El label "PRO" fue descartado el 2026-05-18 por confusión (sugería tier premium pago vs. nivel del corredor) — usar "Avanzados" en todo lo nuevo.
- **Cancelación inmediata.** Apenas el usuario cancela, pierde acceso al plan en el momento. No esperamos al fin del ciclo de facturación.
- **Sin ajuste cambiario.** El precio en ARS queda fijo independiente del tipo de cambio. Si el dólar se mueve, se reevalúa manualmente cada tanto pero no hay auto-ajuste.

### Reactivación (usuario que canceló y vuelve)
Al volver, antes de pedir pago, mostrar prompt:
```
¡Bienvenido de vuelta!
¿Querés…
  ○ Continuar donde lo dejaste (seguir tu plan, historial intacto)
  ○ Empezar de cero (nuevo onboarding, nuevo plan)
```
Después del prompt → paywall directo (no hay nuevo trial de 15 días para usuarios que ya consumieron el suyo).

---

## Preguntas abiertas (no bloquean dev, definir más adelante)

### Pagos (post-MVP de lógica)
1. **Procesador AR**: MercadoPago vs Modo vs transferencia manual. Pendiente.
2. **Procesador internacional**: Stripe vs Paddle / LemonSqueezy (merchant-of-record manejan IVA/sales tax). Pendiente.

### Negocio
3. **IVA Argentina** (21%): ¿precio final con IVA incluido o pre-IVA? Para consumidor final suele ser final — confirmar con contador.
4. **Política de refunds**: importante para chargebacks de tarjeta. Definir antes del primer mes pago.

---

## Análisis rápido de unit economics

Para un usuario mensual en USD:
- Ingreso: $5/mes
- Stripe fee (~3% + $0.30): ~$0.45
- Hosting/AI per usuario activo: ~$0.50-1 (depende de uso de AI feedback)
- **Margen aprox: $3.5/mes/usuario USD**

Para un usuario mensual en ARS:
- Ingreso: $7.000 ARS (~$5 USD al oficial)
- Comisión transferencia: variable (si es bank-to-bank manual ~0%, si MercadoPago ~6%)
- Costos: similares en USD
- **Margen aprox: ~$3-4 USD equivalente**

Pack 3 meses mejora el margen por menor churn admin pero baja el ARPU mensual efectivo.

---

## Decisiones pendientes (priorizadas)

1. **Procesador de pago** (Stripe vs Paddle vs LemonSqueezy para intl, MercadoPago vs manual para AR)
2. **Política de refund** (importante antes del primer cobro real)
3. **IVA Argentina**: precio final con IVA o pre-IVA
