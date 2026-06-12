import { Producto, Testimonio, TextosSitio } from './models';

/**
 * Datos de respaldo que se muestran cuando Supabase todavía no está
 * configurado (o falla la conexión), para que la landing nunca quede vacía.
 */
export const TEXTOS_FALLBACK: TextosSitio = {
  eslogan: 'Donde el sabor habla por sí solo',
  hero_subtitulo:
    'Pastelería artesanal hecha en casa, por encargo y con entrega en Montevideo. Tortas, postres y box dulces para tus momentos especiales.',
  marquee: 'Pedidos por encargo · Hecho en casa · Entregas en Montevideo · Tortas personalizadas',
  whatsapp: '59899000000',
  instagram: 'marubakery.uy',
  email: 'hola@marubakery.uy',
  direccion: 'Montevideo, Uruguay',
  stat_1_numero: '+100',
  stat_1_texto: 'pedidos entregados',
  stat_2_numero: '5★',
  stat_2_texto: 'de clientes felices',
  stat_3_numero: '100%',
  stat_3_texto: 'horneado en casa',
};

export const TESTIMONIOS_FALLBACK: Testimonio[] = [
  {
    id: 'fb-t1',
    nombre: 'Lucía',
    comentario: 'La torta de chocolate fue el centro del cumple. ¡Húmeda, intensa y hermosa! Repetimos seguro.',
    estrellas: 5,
    visible: true,
  },
  {
    id: 'fb-t2',
    nombre: 'Federico',
    comentario: 'Pedí un box dulce para sorprender a mi novia y llegó impecable. Se nota lo casero en cada bocado.',
    estrellas: 5,
    visible: true,
  },
  {
    id: 'fb-t3',
    nombre: 'Carla',
    comentario: 'El cheesecake de frutos rojos es de otro planeta. Atención súper cálida y entrega puntual.',
    estrellas: 5,
    visible: true,
  },
];

export const PRODUCTOS_FALLBACK: Producto[] = [
  {
    id: 'fb-1',
    nombre: 'Torta de chocolate intenso',
    descripcion: 'Bizcochuelo húmedo de cacao, ganache de chocolate semiamargo y un toque de dulce de leche.',
    precio: 1450,
    categoria: 'Tortas',
    imagen_url: '/img/producto-torta.svg',
    disponible: true,
    destacado: true,
  },
  {
    id: 'fb-2',
    nombre: 'Box dulce para compartir',
    descripcion: 'Selección de 12 mini postres: brownies, alfajores de maicena, mini lemon pie y trufas.',
    precio: 990,
    categoria: 'Box dulces',
    imagen_url: '/img/producto-box.svg',
    disponible: true,
    destacado: false,
  },
  {
    id: 'fb-3',
    nombre: 'Cheesecake de frutos rojos',
    descripcion: 'Base de galleta artesanal, crema suave de queso y coulis casero de frutos rojos.',
    precio: 1250,
    categoria: 'Postres individuales',
    imagen_url: '/img/producto-cheesecake.svg',
    disponible: true,
    destacado: false,
  },
  {
    id: 'fb-4',
    nombre: 'Torta personalizada',
    descripcion: 'Diseñada a medida para tu evento: elegí sabor, relleno y decoración. Pedinos un presupuesto.',
    precio: 2200,
    categoria: 'Tortas personalizadas',
    imagen_url: '/img/producto-personalizada.svg',
    disponible: true,
    destacado: false,
  },
];
