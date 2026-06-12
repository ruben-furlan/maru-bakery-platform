export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen_url: string;
  disponible: boolean;
  destacado: boolean;
  creado_en?: string;
}

export type ProductoNuevo = Omit<Producto, 'id' | 'creado_en'>;

export const CATEGORIAS = ['Tortas', 'Postres individuales', 'Box dulces', 'Tortas personalizadas'] as const;

export interface Pedido {
  id?: string;
  nombre: string;
  contacto: string;
  mensaje: string;
  producto: string | null;
  estado?: string;
  creado_en?: string;
  // Campos del pedido con carrito (null en consultas simples del footer)
  apellido?: string | null;
  email?: string | null;
  telefono?: string | null;
  entrega?: TipoEntrega | null;
  direccion?: string | null;
  pago?: TipoPago | null;
  fecha_entrega?: string | null;
  preferencias?: string | null;
  items?: ItemPedido[] | null;
  total?: number | null;
}

export type TipoEntrega = 'envio' | 'punto_encuentro';
export type TipoPago = 'transferencia' | 'efectivo';

/** Producto elegido dentro de un pedido (se guarda como JSON en la tabla pedidos). */
export interface ItemPedido {
  nombre: string;
  precio: number;
  cantidad: number;
}

/** Item del carrito en la landing, antes de confirmar el pedido. */
export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

/** Datos del formulario de checkout del carrito. */
export interface DatosCheckout {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  entrega: TipoEntrega;
  direccion: string;
  pago: TipoPago;
  preferencias: string;
}

/** Claves conocidas de la tabla textos_sitio. */
export interface TextosSitio {
  eslogan: string;
  hero_subtitulo: string;
  marquee: string; // frases separadas por "·"
  whatsapp: string; // número en formato internacional sin "+", ej: 59899123456
  instagram: string;
  email: string;
  direccion: string;
  // Sección "Dulce evidencia": estadísticas de marketing configurables
  stat_1_numero: string;
  stat_1_texto: string;
  stat_2_numero: string;
  stat_2_texto: string;
  stat_3_numero: string;
  stat_3_texto: string;
}

/** Comentario de un cliente que se muestra en la landing. */
export interface Testimonio {
  id: string;
  nombre: string;
  comentario: string;
  estrellas: number; // 1 a 5
  visible: boolean;
  creado_en?: string;
}

export type TestimonioNuevo = Omit<Testimonio, 'id' | 'creado_en'>;
