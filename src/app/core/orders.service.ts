import { inject, Injectable, signal } from '@angular/core';
import { DatosCheckout, ItemCarrito, Pedido } from './models';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly supabase = inject(SupabaseService);

  readonly pedidos = signal<Pedido[]>([]);
  readonly cargando = signal(false);

  /** Registra una consulta enviada desde la landing. */
  async enviar(pedido: Pedido): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('pedidos').insert({
      nombre: pedido.nombre,
      contacto: pedido.contacto,
      mensaje: pedido.mensaje,
      producto: pedido.producto,
    });
    return error ? error.message : null;
  }

  /** Registra un pedido completo armado desde el carrito de la landing. */
  async enviarPedidoCarrito(datos: DatosCheckout, items: ItemCarrito[]): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const total = items.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);
    const { error } = await client.from('pedidos').insert({
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      telefono: datos.telefono,
      contacto: datos.telefono,
      mensaje: datos.preferencias,
      producto: items.map((i) => `${i.producto.nombre} x${i.cantidad}`).join(', '),
      entrega: datos.entrega,
      direccion: datos.direccion || null,
      pago: datos.pago,
      preferencias: datos.preferencias || null,
      items: items.map((i) => ({
        nombre: i.producto.nombre,
        precio: i.producto.precio,
        cantidad: i.cantidad,
      })),
      total,
    });
    return error ? error.message : null;
  }

  /** Lista las consultas recibidas (solo visible con sesión de admin por RLS). */
  async recargar(): Promise<void> {
    const client = this.supabase.client;
    if (!client) return;

    this.cargando.set(true);
    const { data, error } = await client
      .from('pedidos')
      .select('*')
      .order('creado_en', { ascending: false });
    this.cargando.set(false);

    if (!error && data) {
      this.pedidos.set(data as Pedido[]);
    }
  }

  async eliminar(id: string): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('pedidos').delete().eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }

  async marcarEstado(id: string, estado: string): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('pedidos').update({ estado }).eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }
}
