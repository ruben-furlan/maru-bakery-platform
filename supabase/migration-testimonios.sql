-- =====================================================================
-- Marü Bakery — Migración: testimonios + estadísticas de marketing
-- Ejecutar UNA VEZ en el SQL Editor de Supabase (proyectos existentes).
-- Para proyectos nuevos alcanza con schema.sql, que ya incluye esto.
-- =====================================================================

-- Tabla de comentarios de clientes (sección "Lo que dicen nuestros clientes")
create table if not exists public.testimonios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  comentario text not null,
  estrellas int not null default 5 check (estrellas between 1 and 5),
  visible boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table public.testimonios enable row level security;

create policy "testimonios: lectura publica"
  on public.testimonios for select
  using (true);

create policy "testimonios: escritura autenticada"
  on public.testimonios for insert
  to authenticated
  with check (true);

create policy "testimonios: actualizacion autenticada"
  on public.testimonios for update
  to authenticated
  using (true);

create policy "testimonios: borrado autenticado"
  on public.testimonios for delete
  to authenticated
  using (true);

-- Estadísticas configurables (se editan en Admin → Textos del sitio)
insert into public.textos_sitio (clave, valor) values
  ('stat_1_numero', '+100'),
  ('stat_1_texto', 'pedidos entregados'),
  ('stat_2_numero', '5★'),
  ('stat_2_texto', 'de clientes felices'),
  ('stat_3_numero', '100%'),
  ('stat_3_texto', 'horneado en casa')
on conflict (clave) do nothing;

-- Testimonios de arranque (editalos o borralos desde el admin)
insert into public.testimonios (nombre, comentario, estrellas, visible) values
  ('Lucía', 'La torta de chocolate fue el centro del cumple. ¡Húmeda, intensa y hermosa! Repetimos seguro.', 5, true),
  ('Federico', 'Pedí un box dulce para sorprender a mi novia y llegó impecable. Se nota lo casero en cada bocado.', 5, true),
  ('Carla', 'El cheesecake de frutos rojos es de otro planeta. Atención súper cálida y entrega puntual.', 5, true);
