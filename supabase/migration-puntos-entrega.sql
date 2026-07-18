-- =====================================================================
-- Marü Bakery — Migración: puntos de entrega configurables
-- Ejecutar UNA VEZ en el SQL Editor de Supabase (proyectos existentes).
-- Para proyectos nuevos alcanza con schema.sql, que ya incluye esto.
--
-- Qué hace:
--   1. Crea la tabla puntos_entrega: la dueña define desde el panel
--      (/admin/envios) los puntos de encuentro donde entrega pedidos.
--      El carrito la lee cuando el cliente elige "Punto de encuentro":
--      si hay varios puntos activos muestra un selector; si hay uno
--      solo, lo muestra fijo sin selector. Si no hay ninguno, el
--      cliente escribe el punto a mano como hasta ahora.
--   2. Agrega a pedidos la columna punto_entrega: snapshot del nombre
--      del punto elegido al momento del pedido, así los cambios
--      posteriores no alteran los pedidos históricos.
--   3. Siembra un punto de ejemplo solo si la tabla está vacía.
-- =====================================================================

create table if not exists public.puntos_entrega (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean not null default true,
  orden int not null default 0,
  creado_en timestamptz not null default now()
);

alter table public.puntos_entrega enable row level security;

-- Lectura pública (el carrito de la landing necesita los puntos);
-- escritura solo autenticada, igual que el resto de las tablas.
drop policy if exists "puntos_entrega: lectura publica" on public.puntos_entrega;
create policy "puntos_entrega: lectura publica"
  on public.puntos_entrega for select
  using (true);

drop policy if exists "puntos_entrega: escritura autenticada" on public.puntos_entrega;
create policy "puntos_entrega: escritura autenticada"
  on public.puntos_entrega for insert
  to authenticated
  with check (true);

drop policy if exists "puntos_entrega: actualizacion autenticada" on public.puntos_entrega;
create policy "puntos_entrega: actualizacion autenticada"
  on public.puntos_entrega for update
  to authenticated
  using (true);

drop policy if exists "puntos_entrega: borrado autenticado" on public.puntos_entrega;
create policy "puntos_entrega: borrado autenticado"
  on public.puntos_entrega for delete
  to authenticated
  using (true);

alter table public.pedidos
  add column if not exists punto_entrega text;

-- Punto de ejemplo (la dueña lo ajusta desde /admin/envios).
insert into public.puntos_entrega (nombre, orden)
select semilla.nombre, semilla.orden
from (values
  ('Tres Cruces, explanada de la terminal', 1)
) as semilla(nombre, orden)
where not exists (select 1 from public.puntos_entrega);
