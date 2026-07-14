import { computed, inject, Injectable, signal } from '@angular/core';
import { ZonaEnvio, ZonaEnvioNueva } from './models';
import { ZONAS_ENVIO_FALLBACK } from './fallback-data';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ShippingZonesService {
  private readonly supabase = inject(SupabaseService);

  readonly zonas = signal<ZonaEnvio[]>(ZONAS_ENVIO_FALLBACK);
  readonly cargando = signal(false);

  /** Las que ve el cliente en el selector de zona del carrito. */
  readonly activas = computed(() => this.zonas().filter((z) => z.activa));

  constructor() {
    void this.recargar();
  }

  async recargar(): Promise<void> {
    const client = this.supabase.client;
    if (!client) return;

    this.cargando.set(true);
    const { data, error } = await client
      .from('zonas_envio')
      .select('*')
      .order('orden', { ascending: true })
      .order('costo', { ascending: true });
    this.cargando.set(false);

    if (!error && data) {
      this.zonas.set(data as ZonaEnvio[]);
    }
  }

  async crear(zona: ZonaEnvioNueva): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('zonas_envio').insert(zona);
    if (error) return error.message;
    await this.recargar();
    return null;
  }

  async actualizar(id: string, cambios: Partial<ZonaEnvioNueva>): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('zonas_envio').update(cambios).eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }

  async eliminar(id: string): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('zonas_envio').delete().eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }
}
