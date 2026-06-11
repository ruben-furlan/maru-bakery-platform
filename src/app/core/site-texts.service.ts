import { computed, inject, Injectable, signal } from '@angular/core';
import { TextosSitio } from './models';
import { TEXTOS_FALLBACK } from './fallback-data';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SiteTextsService {
  private readonly supabase = inject(SupabaseService);

  readonly textos = signal<TextosSitio>(TEXTOS_FALLBACK);

  readonly frasesMarquee = computed(() =>
    this.textos()
      .marquee.split('·')
      .map((f) => f.trim())
      .filter(Boolean),
  );

  readonly linkWhatsApp = computed(() => `https://wa.me/${this.textos().whatsapp}`);
  readonly linkInstagram = computed(() => `https://instagram.com/${this.textos().instagram}`);

  constructor() {
    void this.recargar();
  }

  whatsAppConMensaje(mensaje: string): string {
    return `${this.linkWhatsApp()}?text=${encodeURIComponent(mensaje)}`;
  }

  async recargar(): Promise<void> {
    const client = this.supabase.client;
    if (!client) return;

    const { data, error } = await client.from('textos_sitio').select('clave, valor');
    if (error || !data) return;

    const desdeDb = Object.fromEntries(data.map((fila) => [fila.clave, fila.valor]));
    this.textos.set({ ...TEXTOS_FALLBACK, ...desdeDb });
  }

  async guardar(cambios: Partial<TextosSitio>): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const filas = Object.entries(cambios).map(([clave, valor]) => ({ clave, valor }));
    const { error } = await client.from('textos_sitio').upsert(filas, { onConflict: 'clave' });
    if (error) return error.message;
    await this.recargar();
    return null;
  }
}
