# AGENTS.md — Contexto del proyecto para agentes de IA

> Este archivo lo leen automáticamente **OpenAI Codex**, **OpenCode** y otros agentes.
> **Claude Code** lo importa desde `CLAUDE.md`. Mantenelo actualizado: es la fuente
> única de verdad sobre cómo trabajar en este repo.

## Qué es este proyecto

Landing page + panel de administración de **Marü Bakery**, pastelería artesanal de
Montevideo. Los clientes ven la vitrina de productos, arman un pedido en el carrito y
lo envían como consulta; la dueña gestiona productos, textos y pedidos desde `/admin`.

## Stack

- **Angular 20** — componentes standalone, signals, `ChangeDetectionStrategy.OnPush`,
  lazy loading por rutas. **Sin NgModules.**
- **Tailwind CSS 4** — tokens definidos en `src/styles.css` con `@theme`.
- **Supabase** — Postgres + Auth + Storage con Row Level Security. Edge Function
  `notify-pedido` (Deno) envía emails vía Resend.
- **Netlify** — deploy de SPA (`netlify.toml`, `public/_redirects`).
- **Tests:** Karma + Jasmine (`npm test`).

## Comandos

```bash
npm start            # dev server en http://localhost:4200
npm run build        # genera environment.ts (scripts/set-env.mjs) + ng build
npm test             # tests con Karma (necesita Chrome)
npx ng build         # build directo sin regenerar environment.ts
npx prettier --write <archivo>   # formateo (config en package.json: 100 cols, comillas simples)
```

## Estructura

```
src/app/
├── core/        # modelos, cliente Supabase, servicios (signals), auth.guard, fallback-data
├── shared/      # directivas (reveal, parallax, tilt, scroll-lock), logo SVG, scroll-progress
├── landing/     # header, hero, marquee, showcase (vitrina), steps, testimonials,
│                # cart (drawer del carrito), mobile-nav (botón flotante + bottom bar), footer
└── admin/       # login, layout con sidebar, productos, destacados, textos, testimonios, pedidos
supabase/
├── schema.sql                        # esquema completo + RLS + seed (fuente de verdad)
├── migration-*.sql                   # migraciones incrementales ya aplicadas
└── functions/notify-pedido/index.ts  # Edge Function: email vía Resend
```

## Convenciones del código (respetarlas siempre)

1. **Idioma:** UI, comentarios e identificadores de dominio en **español**
   (`carrito`, `cerrar()`, `cantidadTotal`). Nombres de archivos en inglés kebab-case
   (`mobile-nav.component.ts`).
2. **Componentes:** standalone, template **inline** en el decorador (no hay archivos
   `.html` separados), `changeDetection: ChangeDetectionStrategy.OnPush`, inyección con
   `inject()` (no constructor injection).
3. **Estado:** signals de Angular (`signal`, `computed`); los servicios de `core/`
   exponen signals, no Subjects. RxJS solo donde ya existe.
4. **Control de flujo:** sintaxis nueva (`@if`, `@for`), no `*ngIf`/`*ngFor`.
5. **Estilos:** solo clases de Tailwind con la paleta de la marca definida en
   `src/styles.css`: `bordo` #7c0f2a · `bordo-dark` #5c0a1f · `crema` #f2e3bc ·
   `dorado` #e3b970 · `cacao` #2a1216. No inventar colores hex sueltos.
6. **Mobile primero:** la landing se usa sobre todo desde Instagram en el teléfono.
   Respetar `env(safe-area-inset-*)` (iOS), `prefers-reduced-motion` y contraste AA.
7. **Supabase:** todo acceso pasa por los servicios de `core/`. La landing debe seguir
   funcionando **sin** Supabase usando `core/fallback-data.ts`.
8. **Cambios de esquema:** nunca editar la base directamente. Crear un
   `supabase/migration-<tema>.sql` nuevo Y reflejar el cambio en `schema.sql`.

## Límites de seguridad

- **No comitear credenciales**: `src/environments/environment.ts` se genera en el
  build con variables de Netlify (`NG_APP_SUPABASE_URL`, `NG_APP_SUPABASE_ANON_KEY`).
- No tocar `dist/` a mano; es artefacto de build.
- La escritura en Supabase está protegida por RLS: lectura pública, escritura solo
  autenticada. No debilitar políticas sin avisar.
- La Edge Function valida su propio secret (`WEBHOOK_SECRET`); se deploya con
  `--no-verify-jwt` a propósito.

## Definición de "terminado"

Antes de dar una tarea por cerrada:

1. `npm run build` compila sin errores.
2. El código nuevo sigue las convenciones de arriba (verificar punto por punto).
3. Si tocaste UI: probar mentalmente mobile (375px) y desktop, y estados vacíos.
4. Si tocaste el esquema: migración + `schema.sql` + README actualizados.
