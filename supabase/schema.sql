-- =====================================================================
-- Marü Bakery — Esquema de Supabase
-- Ejecutar en el SQL Editor del proyecto (una sola vez).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabla: productos
-- ---------------------------------------------------------------------
create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  precio numeric not null check (precio >= 0),
  categoria text not null default 'Tortas',
  imagen_url text not null default '',
  disponible boolean not null default true,
  destacado boolean not null default false,
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tabla: textos_sitio (clave / valor)
-- ---------------------------------------------------------------------
create table if not exists public.textos_sitio (
  clave text primary key,
  valor text not null default ''
);

-- ---------------------------------------------------------------------
-- Tabla: pedidos (pedidos del carrito y consultas desde la landing)
-- Las consultas simples solo completan nombre/contacto/mensaje; los
-- pedidos del carrito completan además los campos de checkout e items.
-- ---------------------------------------------------------------------
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text not null,
  mensaje text not null,
  producto text,
  estado text not null default 'pendiente',
  creado_en timestamptz not null default now(),
  apellido text,
  email text,
  telefono text,
  entrega text check (entrega in ('envio', 'punto_encuentro')),
  direccion text,
  pago text check (pago in ('transferencia', 'efectivo')),
  fecha_entrega date,
  preferencias text,
  items jsonb,
  total numeric check (total >= 0)
);

-- ---------------------------------------------------------------------
-- Tabla: testimonios (comentarios de clientes para la landing)
-- ---------------------------------------------------------------------
create table if not exists public.testimonios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  comentario text not null,
  estrellas int not null default 5 check (estrellas between 1 and 5),
  visible boolean not null default true,
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security
-- Lectura pública de productos y textos; escritura solo autenticados.
-- Pedidos: cualquiera puede crear (formulario público), solo
-- autenticados pueden leer/actualizar.
-- ---------------------------------------------------------------------
alter table public.productos enable row level security;
alter table public.textos_sitio enable row level security;
alter table public.pedidos enable row level security;
alter table public.testimonios enable row level security;

-- productos
create policy "productos: lectura publica"
  on public.productos for select
  using (true);

create policy "productos: escritura autenticada"
  on public.productos for insert
  to authenticated
  with check (true);

create policy "productos: actualizacion autenticada"
  on public.productos for update
  to authenticated
  using (true);

create policy "productos: borrado autenticado"
  on public.productos for delete
  to authenticated
  using (true);

-- textos_sitio
create policy "textos: lectura publica"
  on public.textos_sitio for select
  using (true);

create policy "textos: escritura autenticada"
  on public.textos_sitio for insert
  to authenticated
  with check (true);

create policy "textos: actualizacion autenticada"
  on public.textos_sitio for update
  to authenticated
  using (true);

-- pedidos
create policy "pedidos: creacion publica"
  on public.pedidos for insert
  to anon, authenticated
  with check (true);

create policy "pedidos: lectura autenticada"
  on public.pedidos for select
  to authenticated
  using (true);

create policy "pedidos: actualizacion autenticada"
  on public.pedidos for update
  to authenticated
  using (true);

-- testimonios
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

-- ---------------------------------------------------------------------
-- Storage: bucket público para fotos de productos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "storage productos: lectura publica"
  on storage.objects for select
  using (bucket_id = 'productos');

create policy "storage productos: subida autenticada"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'productos');

create policy "storage productos: borrado autenticado"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'productos');

-- ---------------------------------------------------------------------
-- Datos iniciales
-- ---------------------------------------------------------------------
insert into public.textos_sitio (clave, valor) values
  ('eslogan', 'Donde el sabor habla por sí solo'),
  ('hero_subtitulo', 'Pastelería artesanal hecha en casa, por encargo y con entrega en Montevideo. Tortas, postres y box dulces para tus momentos especiales.'),
  ('marquee', 'Pedidos por encargo · Hecho en casa · Entregas en Montevideo · Tortas personalizadas'),
  ('whatsapp', '59899000000'),
  ('instagram', 'marubakery.uy'),
  ('email', 'hola@marubakery.uy'),
  ('direccion', 'Montevideo, Uruguay'),
  ('stat_1_numero', '+100'),
  ('stat_1_texto', 'pedidos entregados'),
  ('stat_2_numero', '5★'),
  ('stat_2_texto', 'de clientes felices'),
  ('stat_3_numero', '100%'),
  ('stat_3_texto', 'horneado en casa')
on conflict (clave) do nothing;

insert into public.testimonios (nombre, comentario, estrellas, visible) values
  ('Lucía', 'La torta de chocolate fue el centro del cumple. ¡Húmeda, intensa y hermosa! Repetimos seguro.', 5, true),
  ('Federico', 'Pedí un box dulce para sorprender a mi novia y llegó impecable. Se nota lo casero en cada bocado.', 5, true),
  ('Carla', 'El cheesecake de frutos rojos es de otro planeta. Atención súper cálida y entrega puntual.', 5, true);

insert into public.productos (nombre, descripcion, precio, categoria, imagen_url, disponible, destacado) values
  ('Torta de chocolate intenso', 'Bizcochuelo húmedo de cacao, ganache de chocolate semiamargo y un toque de dulce de leche.', 1450, 'Tortas', '/img/producto-torta.svg', true, true),
  ('Box dulce para compartir', 'Selección de 12 mini postres: brownies, alfajores de maicena, mini lemon pie y trufas.', 990, 'Box dulces', '/img/producto-box.svg', true, false),
  ('Cheesecake de frutos rojos', 'Base de galleta artesanal, crema suave de queso y coulis casero de frutos rojos.', 1250, 'Postres individuales', '/img/producto-cheesecake.svg', true, false),
  ('Torta personalizada', 'Diseñada a medida para tu evento: elegí sabor, relleno y decoración. Pedinos un presupuesto.', 2200, 'Tortas personalizadas', '/img/producto-personalizada.svg', true, false);

-- ---------------------------------------------------------------------
-- Usuario administrador
-- Crearlo desde el panel: Authentication → Users → Add user
-- (email + contraseña). Con eso ya puede entrar a /admin.
-- ---------------------------------------------------------------------
