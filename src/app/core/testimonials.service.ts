import { computed, inject, Injectable, signal } from '@angular/core';
import { Testimonio, TestimonioNuevo } from './models';
import { TESTIMONIOS_FALLBACK } from './fallback-data';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class TestimonialsService {
  private readonly supabase = inject(SupabaseService);

  readonly testimonios = signal<Testimonio[]>(TESTIMONIOS_FALLBACK);
  readonly cargando = signal(false);

  /** Los que se muestran en la landing (más recientes primero). */
  readonly visibles = computed(() => this.testimonios().filter((t) => t.visible));

  constructor() {
    void this.recargar();
  }

  async recargar(): Promise<void> {
    const client = this.supabase.client;
    if (!client) return;

    this.cargando.set(true);
    const { data, error } = await client
      .from('testimonios')
      .select('*')
      .order('creado_en', { ascending: false });
    this.cargando.set(false);

    if (!error && data) {
      this.testimonios.set(data as Testimonio[]);
    }
  }

  async crear(testimonio: TestimonioNuevo): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('testimonios').insert(testimonio);
    if (error) return error.message;
    await this.recargar();
    return null;
  }

  async actualizar(id: string, cambios: Partial<TestimonioNuevo>): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('testimonios').update(cambios).eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }

  async eliminar(id: string): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('testimonios').delete().eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }
}
