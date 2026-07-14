-- =====================================================================
-- Marü Bakery — Migración: zonas de envío configurables
-- Ejecutar UNA VEZ en el SQL Editor de Supabase (proyectos existentes).
-- Para proyectos nuevos alcanza con schema.sql, que ya incluye esto.
--
-- Qué hace:
--   1. Crea la tabla zonas_envio: la dueña define desde el panel
--      (/admin/envios) las zonas de Montevideo donde hace envíos y el
--      costo aproximado de cada una. El carrito la lee para mostrar el
--      costo estimado cuando el cliente elige "Envío".
--   2. Agrega a pedidos las columnas zona_envio y costo_envio: snapshot
--      del nombre y el costo al momento del pedido, así los cambios de
--      precio posteriores no alteran los pedidos históricos.
--   3. Siembra zonas de ejemplo solo si la tabla está vacía.
-- =====================================================================

create table if not exists public.zonas_envio (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  costo numeric not null check (costo >= 0),
  activa boolean not null default true,
  orden int not null default 0,
  creado_en timestamptz not null default now()
);

alter table public.zonas_envio enable row level security;

-- Lectura pública (el carrito de la landing necesita las zonas);
-- escritura solo autenticada, igual que el resto de las tablas.
drop policy if exists "zonas_envio: lectura publica" on public.zonas_envio;
create policy "zonas_envio: lectura publica"
  on public.zonas_envio for select
  using (true);

drop policy if exists "zonas_envio: escritura autenticada" on public.zonas_envio;
create policy "zonas_envio: escritura autenticada"
  on public.zonas_envio for insert
  to authenticated
  with check (true);

drop policy if exists "zonas_envio: actualizacion autenticada" on public.zonas_envio;
create policy "zonas_envio: actualizacion autenticada"
  on public.zonas_envio for update
  to authenticated
  using (true);

drop policy if exists "zonas_envio: borrado autenticado" on public.zonas_envio;
create policy "zonas_envio: borrado autenticado"
  on public.zonas_envio for delete
  to authenticated
  using (true);

alter table public.pedidos
  add column if not exists zona_envio text,
  add column if not exists costo_envio numeric check (costo_envio >= 0);

-- Zonas de ejemplo (la dueña las ajusta desde /admin/envios).
insert into public.zonas_envio (nombre, costo, orden)
select semilla.nombre, semilla.costo, semilla.orden
from (values
  ('Centro, Cordón y Ciudad Vieja', 120, 1),
  ('Pocitos, Punta Carretas y Parque Rodó', 150, 2),
  ('Malvín, Buceo y La Blanqueada', 180, 3),
  ('Carrasco y alrededores', 250, 4)
) as semilla(nombre, costo, orden)
where not exists (select 1 from public.zonas_envio);