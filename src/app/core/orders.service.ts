import { inject, Injectable, signal } from '@angular/core';
import { Pedido } from './models';
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

  async marcarEstado(id: string, estado: string): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('pedidos').update({ estado }).eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }
}
