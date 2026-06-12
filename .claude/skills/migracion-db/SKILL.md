---
name: migracion-db
description: Crea una migración SQL de Supabase siguiendo el flujo del repo (archivo migration-*.sql + actualización de schema.sql + RLS). Usar para cualquier cambio de tablas, columnas, políticas o Storage.
---

# Crear una migración de base de datos

Argumento esperado: qué cambio se necesita (ej: "agregar columna precio_promo a productos").

## Contexto del flujo

Este repo NO usa el sistema de migraciones de la CLI de Supabase. El flujo es manual:

- `supabase/schema.sql` = estado completo deseado (para proyectos nuevos).
- `supabase/migration-<tema>.sql` = delta que la dueña ejecuta a mano en el
  SQL Editor del dashboard sobre la base ya existente.

## Pasos

1. **Leer primero** `supabase/schema.sql` y las `migration-*.sql` existentes para
   copiar el estilo (comentarios en español explicando qué hace y cómo ejecutarla).

2. **Crear** `supabase/migration-<tema-en-kebab>.sql`:
   - Idempotente siempre que se pueda: `add column if not exists`,
     `create table if not exists`, `on conflict do nothing`,
     `drop policy if exists` antes de `create policy`.
   - Si crea una tabla: habilitar RLS (`alter table ... enable row level security`)
     y definir políticas explícitas. Patrón del repo: SELECT para `anon` solo si la
     landing lo necesita; INSERT/UPDATE/DELETE solo para `authenticated`.
   - Encabezado comentado: qué hace, por qué, y "Ejecutar en SQL Editor de Supabase".

3. **Reflejar el cambio en `schema.sql`** para que un proyecto nuevo quede igual
   que producción después de la migración.

4. **Actualizar el frontend**:
   - Tipos en `src/app/core/models.ts`.
   - Servicio correspondiente en `src/app/core/`.
   - Si la landing lee el dato nuevo: agregar valor de ejemplo en
     `core/fallback-data.ts` (la landing debe funcionar sin Supabase).

5. **Verificar** con `npm run build` y cerrar recordando el orden de deploy:
   primero la migración en Supabase, después el push del frontend.
