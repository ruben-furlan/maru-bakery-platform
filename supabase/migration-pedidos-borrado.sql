-- =====================================================================
-- Marü Bakery — Migración: permitir borrar pedidos desde el admin
-- Ejecutar UNA VEZ en el SQL Editor de Supabase (proyectos existentes).
-- Para proyectos nuevos alcanza con schema.sql, que ya incluye esto.
-- =====================================================================

create policy "pedidos: borrado autenticado"
  on public.pedidos for delete
  to authenticated
  using (true);
