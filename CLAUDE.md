# FlowRun — Guía para Claude

Proyecto: Coach AI de trail running. Argentina.
Landing pública + app autenticada con planes adaptativos y check-ins post-carrera.

---

## Stack

### App (carpeta `app/`)
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Estilos**: Tailwind CSS
- **Backend / Auth / DB**: Supabase (Postgres + Auth + Storage)
- **Email (magic links, OTP, transaccional)**: Resend
- **Deploy**: Vercel

### Landing (carpeta `landing/`)
- HTML/CSS puro, self-contained, sin build.
- Deploy independiente en Vercel.
- **NO TOCAR sin pedido explícito del usuario.**

---

## Dominio y deploys

- `flowrun.site` → landing (`landing/index.html`)
- `app.flowrun.site` → app Next.js (`app/`)
- Dos proyectos Vercel separados, mismo repo, distinto Root Directory.

---

## Estructura de carpetas

```
flowrun-repo/
├── landing/              # HTML estático (intocable)
├── app/                  # App Next.js
│   ├── app/              # App Router (rutas, layouts, pages)
│   │   ├── (auth)/       # group: login, signup
│   │   ├── (app)/        # group: dashboard, perfil, etc. (protegidas)
│   │   └── auth/callback/ # OAuth + magic link callback
│   ├── components/       # Componentes UI reutilizables
│   ├── lib/              # Clients (supabase), utils, helpers
│   │   ├── supabase/     # client.ts, server.ts, middleware.ts
│   │   └── resend.ts
│   ├── hooks/            # Custom React hooks (useUser, useSession, etc.)
│   ├── types/            # TS types (incluye database.types.ts generado de Supabase)
│   ├── public/
│   ├── middleware.ts     # Refresh de sesión Supabase
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── brand/                # Brandbook + logos SVG
├── mockups/              # Prototipos HTML (referencia visual)
├── discovery/            # Docs producto (MVP spec, schemas, pricing, terms)
├── instagram/            # Contenido social
├── archive/              # Versiones previas
└── supabase/
    └── migrations/       # SQL migrations
```

---

## Convenciones de código

- **Archivos**: kebab-case (`user-profile.tsx`, `use-session.ts`)
- **Componentes React**: PascalCase (`<UserProfile />`)
- **Hooks**: prefijo `use` (`useSession`, `useCurrentUser`)
- **Server actions**: en `app/(app)/actions.ts` o `app/lib/actions/`
- **Tipos**: en `types/`, no mezclar con código
- **Imports**: absolutos vía `@/` (configurar en `tsconfig.json`)

---

## Decisiones de arquitectura

1. **Auth**: Supabase Auth (Google OAuth + Email magic link / OTP).
2. **DB**: Postgres en Supabase, con RLS activo en todas las tablas.
3. **Schema**: respeta el documento `discovery/database-schema.md` (planes adaptativos + check-ins, no GPS tracking).
4. **Email transaccional**: Resend como SMTP custom de Supabase.
5. **Deploy**: Vercel × 2 proyectos (landing + app), mismo repo.
6. **Idioma por defecto**: español argentino (voseo). Inglés disponible.

---

## Reglas para Claude

- **Antes de crear archivos nuevos**, verificar si ya existe algo similar y preguntar al usuario.
- **No modificar UI ni branding existentes** sin pedido explícito. La landing y los mockups son fuente visual de verdad.
- **Confirmar antes de cambios destructivos** o que afecten deploys/dominios.
- **No commitear `.env.local`** ni secrets.
- **El SQL no se ejecuta automáticamente** — siempre se lo paso al usuario para que corra manualmente en Supabase SQL Editor.
- **Respetar el MVP doc** (`discovery/mvp-spec.md`) como source of truth del scope.
