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

## Estructura

```
src/app/
├── core/        # modelos, cliente Supabase, servicios (signals), guard, fallback
├── shared/      # directiva de revelado al scroll, logo (manga pastelera SVG)
├── landing/     # header, hero, marquee, vitrina, pasos, instagram, footer, bottom bar
└── admin/       # login, layout con sidebar, productos, destacados, textos, pedidos
supabase/schema.sql   # esquema completo + RLS + seed
```

## Accesibilidad y rendimiento

- Contraste AA con la paleta bordó/crema, foco visible, `alt` en imágenes y navegación por teclado.
- `prefers-reduced-motion` desactiva el marquee y las animaciones de aparición.
- Bundle inicial ≈ 88 kB transferidos; `/admin` y Supabase se cargan de forma diferida.
