import { computed, inject, Injectable, signal } from '@angular/core';
import { PuntoEntrega, PuntoEntregaNuevo } from './models';
import { PUNTOS_ENTREGA_FALLBACK } from './fallback-data';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class MeetingPointsService {
  private readonly supabase = inject(SupabaseService);

  readonly puntos = signal<PuntoEntrega[]>(PUNTOS_ENTREGA_FALLBACK);
  readonly cargando = signal(false);

  /** Los que ve el cliente al elegir "Punto de encuentro" en el carrito. */
  readonly activos = computed(() => this.puntos().filter((p) => p.activo));

  constructor() {
    void this.recargar();
  }

  async recargar(): Promise<void> {
    const client = this.supabase.client;
    if (!client) return;

    this.cargando.set(true);
    const { data, error } = await client
      .from('puntos_entrega')
      .select('*')
      .order('orden', { ascending: true })
      .order('nombre', { ascending: true });
    this.cargando.set(false);

    if (!error && data) {
      this.puntos.set(data as PuntoEntrega[]);
    } else if (error) {
      // Con Supabase configurado pero la tabla inaccesible (p. ej. la
      // migración no se aplicó), no inventar puntos con el fallback: el
      // carrito vuelve al campo libre y el pedido sigue siendo honesto.
      this.puntos.set([]);
    }
  }

  async crear(punto: PuntoEntregaNuevo): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('puntos_entrega').insert(punto);
    if (error) return error.message;
    await this.recargar();
    return null;
  }

  async actualizar(id: string, cambios: Partial<PuntoEntregaNuevo>): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('puntos_entrega').update(cambios).eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }

  async eliminar(id: string): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('puntos_entrega').delete().eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }
}
