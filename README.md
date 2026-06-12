# Marü Bakery 🧁

Landing page + panel de administración de **Marü Bakery**, pastelería artesanal de Montevideo.
_"Donde el sabor habla por sí solo"_ · [@marubakery.uy](https://instagram.com/marubakery.uy)

## Stack

- **Frontend:** Angular 20 (componentes standalone, signals, lazy loading por rutas) + Tailwind CSS 4.
- **Backend/BaaS:** Supabase (Postgres + Auth + Storage, con Row Level Security).
- **Deploy:** Netlify (SPA con `_redirects`).

## Desarrollo local

```bash
npm install
npm start          # http://localhost:4200
```

Sin configurar Supabase, la landing funciona igual con datos de ejemplo locales
(`src/app/core/fallback-data.ts`). El login del admin requiere Supabase.

## Configurar Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecutá el contenido de [`supabase/schema.sql`](supabase/schema.sql).
   Crea las tablas `productos`, `textos_sitio` y `pedidos`, las políticas RLS
   (lectura pública / escritura autenticada), el bucket de Storage `productos` y datos iniciales.
3. En **Authentication → Users → Add user**, creá el usuario admin (email + contraseña).
4. Copiá la URL y la anon key del proyecto (**Settings → API**) en
   `src/environments/environment.ts`:

```ts
export const environment = {
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseAnonKey: 'TU-ANON-KEY',
};
```

> ⚠️ No comitees credenciales reales: en producción se inyectan desde Netlify.

## Panel de administración

- Ruta: `/admin` (link discreto "⚙ Acceso administración" en el footer).
- Protegido por guard de Angular (`src/app/core/auth.guard.ts`) + RLS en Supabase.
- Secciones: **Productos** (CRUD con foto vía Storage), **Destacados** (producto de la
  semana del hero), **Textos del sitio** (eslogan, marquee, WhatsApp, contacto) y
  **Pedidos** (consultas recibidas desde el formulario de la landing).

## Deploy en Netlify

1. Conectá el repositorio en Netlify. `netlify.toml` ya define:
   - Build command: `npm run build`
   - Publish directory: `dist/maru-bakery/browser`
2. En **Site settings → Environment variables**, agregá:
   - `NG_APP_SUPABASE_URL`
   - `NG_APP_SUPABASE_ANON_KEY`

   El script `scripts/set-env.mjs` (que corre antes de `ng build`) genera
   `environment.ts` con esos valores.

3. `public/_redirects` (`/* /index.html 200`) hace que las rutas de Angular
   funcionen al recargar la página.

## Notificaciones por email

Cada consulta nueva del formulario (INSERT en `pedidos`) dispara un email a la
dueña vía **Database Webhook → Edge Function (`notify-pedido`) → Resend**.
El frontend no envía emails ni conoce la API key: el email es un efecto
colateral asíncrono del lado de la base (si Resend falla, el pedido se guarda
igual y el error queda en los logs de la función).

### 1. CLI de Supabase (si no la tenés)

```bash
npm i -D supabase
npx supabase login
npx supabase link --project-ref <REF>   # Settings → General → Reference ID
```

### 2. Secrets de la función

```bash
npx supabase secrets set RESEND_API_KEY=<api-key-de-resend> WEBHOOK_SECRET=<secreto-largo-aleatorio> NOTIFY_EMAIL_TO=duena@ejemplo.com NOTIFY_EMAIL_FROM="Marü Bakery <pedidos@tudominio.com>"
```

> **Remitente:** para probar sin verificar dominio usá
> `NOTIFY_EMAIL_FROM=onboarding@resend.dev` (Resend solo entrega al email de
> tu propia cuenta). Para producción, verificá tu dominio en
> [Resend → Domains](https://resend.com/domains) y usá una casilla de ese dominio.

### 3. Deploy

```bash
npx supabase functions deploy notify-pedido --no-verify-jwt
```

Se deploya con `--no-verify-jwt` porque el webhook no manda un JWT de Supabase;
la función valida su propio secret (`Authorization: Bearer ${WEBHOOK_SECRET}`)
y responde 401 sin él.

### 4. Webhook

Crealo desde el dashboard siguiendo [`supabase/webhook-setup.md`](supabase/webhook-setup.md).

### 5. Probar la función deployada (sin tocar la base)

Con el secret correcto (espera 200 y el email):

```bash
curl -i -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/notify-pedido" \
  -H "Authorization: Bearer <WEBHOOK_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "pedidos",
    "record": {
      "id": "00000000-0000-0000-0000-000000000000",
      "nombre": "Cliente de Prueba",
      "contacto": "099 123 456",
      "mensaje": "Hola! Quería consultar por una torta para 20 personas.",
      "producto": "Torta de chocolate intenso",
      "estado": "pendiente",
      "creado_en": "2026-06-11T15:30:00Z"
    }
  }'
```

Sin `Authorization` (espera 401):

```bash
curl -i -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/notify-pedido" \
  -H "Content-Type: application/json" \
  -d '{"type":"INSERT","table":"pedidos","record":{"nombre":"x","contacto":"x","mensaje":"x","creado_en":"2026-06-11T15:30:00Z"}}'
```

## Estructura

```
src/app/
├── core/        # modelos, cliente Supabase, servicios (signals), guard, fallback
├── shared/      # directiva de revelado al scroll, logo (manga pastelera SVG)
├── landing/     # header, hero, marquee, vitrina, pasos, instagram, footer, bottom bar
└── admin/       # login, layout con sidebar, productos, destacados, textos, pedidos
supabase/
├── schema.sql                        # esquema completo + RLS + seed
├── webhook-setup.md                  # cómo crear el webhook pedidos-notify
└── functions/notify-pedido/index.ts  # Edge Function: email vía Resend
```

## Accesibilidad y rendimiento

- Contraste AA con la paleta bordó/crema, foco visible, `alt` en imágenes y navegación por teclado.
- `prefers-reduced-motion` desactiva el marquee y las animaciones de aparición.
- Bundle inicial ≈ 88 kB transferidos; `/admin` y Supabase se cargan de forma diferida.

## 🤖 Programar con agentes de IA (Claude Code · OpenCode · Codex)

El repo viene pre-configurado para las tres CLIs de agentes. Guía completa paso a
paso en **[`docs/GUIA-IA.md`](docs/GUIA-IA.md)**; resumen de las piezas:

| Pieza          | Qué hace                                                                                                                                                                                 | Dónde vive                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Contexto**   | El agente arranca conociendo stack, comandos y convenciones del repo.                                                                                                                    | `AGENTS.md` (universal) + `CLAUDE.md` (Claude Code, importa el anterior) |
| **Subagentes** | Especialistas a los que se delega: `revisor-codigo` (revisión de diffs, solo lectura), `experto-supabase` (esquema/RLS/Edge Function) y `ui-marca` (landing, mobile, paleta, a11y).      | `.claude/agents/` y `.opencode/agent/`                                   |
| **Skills**     | Procedimientos invocables: `/nuevo-componente`, `/pre-deploy` (checklist antes de pushear a main) y `/migracion-db`.                                                                     | `.claude/skills/` y `.opencode/command/`                                 |
| **Hooks**      | Automatizaciones garantizadas: Prettier tras cada edición, bloqueo de comandos destructivos (force-push a main, `rm -rf`…), notificación al terminar.                                    | `.claude/settings.json` + `.claude/hooks/`                               |
| **MCP**        | Herramientas externas: `context7` (docs actualizadas de Angular/Tailwind), `playwright` (navegador real para screenshots de la landing) y `supabase` (consultas read-only a producción). | `.mcp.json`, `opencode.json`, `docs/codex-config.example.toml`           |

Inicio rápido:

```bash
npm i -g @anthropic-ai/claude-code   # o: opencode-ai / @openai/codex
cd maru-bakery-platform
claude                               # el contexto se carga solo
# probá: "/pre-deploy"  o  "revisá mis cambios antes de comitear"
```

> Codex no lee config por proyecto (solo `AGENTS.md`): copiá
> `docs/codex-config.example.toml` a `~/.codex/config.toml` para los MCP.
