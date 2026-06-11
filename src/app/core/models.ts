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
}
