-- =====================================================================
-- Marü Bakery — Migración: pedidos con carrito de compras
-- Ejecutar UNA VEZ en el SQL Editor de Supabase (proyectos existentes).
-- Para proyectos nuevos alcanza con schema.sql, que ya incluye esto.
-- =====================================================================

alter table public.pedidos
  add column if not exists apellido text,
  add column if not exists email text,
  add column if not exists telefono text,
  add column if not exists entrega text check (entrega in ('envio', 'punto_encuentro')),
  add column if not exists direccion text,
  add column if not exists pago text check (pago in ('transferencia', 'efectivo')),
  add column if not exists fecha_entrega date,
  add column if not exists preferencias text,
  add column if not exists items jsonb,
  add column if not exists total numeric check (total >= 0);

-- Las consultas simples del footer siguen usando contacto/mensaje;
-- los pedidos del carrito también los completan, así que no hace falta
-- relajar los NOT NULL existentes.
