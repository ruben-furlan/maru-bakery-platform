import { computed, inject, Injectable, signal } from '@angular/core';
import { Producto, ProductoNuevo } from './models';
import { PRODUCTOS_FALLBACK } from './fallback-data';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly supabase = inject(SupabaseService);

  readonly productos = signal<Producto[]>(PRODUCTOS_FALLBACK);
  readonly cargando = signal(false);

  readonly disponibles = computed(() => this.productos().filter((p) => p.disponible));
  readonly destacado = computed(
    () => this.disponibles().find((p) => p.destacado) ?? this.disponibles()[0] ?? null,
  );

  constructor() {
    void this.recargar();
  }

  async recargar(): Promise<void> {
    const client = this.supabase.client;
    if (!client) return;

    this.cargando.set(true);
    const { data, error } = await client
      .from('productos')
      .select('*')
      .order('creado_en', { ascending: false });
    this.cargando.set(false);

    if (!error && data) {
      this.productos.set(data as Producto[]);
    }
  }

  async crear(producto: ProductoNuevo): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('productos').insert(producto);
    if (error) return error.message;
    await this.recargar();
    return null;
  }

  async actualizar(id: string, cambios: Partial<ProductoNuevo>): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('productos').update(cambios).eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }

  async eliminar(id: string): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error } = await client.from('productos').delete().eq('id', id);
    if (error) return error.message;
    await this.recargar();
    return null;
  }

  /** Marca un producto como "producto de la semana" y desmarca el resto. */
  async marcarDestacado(id: string): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado.';

    const { error: e1 } = await client
      .from('productos')
      .update({ destacado: false })
      .eq('destacado', true);
    if (e1) return e1.message;
    const { error: e2 } = await client.from('productos').update({ destacado: true }).eq('id', id);
    if (e2) return e2.message;
    await this.recargar();
    return null;
  }

  /** Sube una imagen al bucket "productos" y devuelve su URL pública. */
  async subirImagen(archivo: File): Promise<{ url?: string; error?: string }> {
    const client = this.supabase.client;
    if (!client) return { error: 'Supabase no está configurado.' };

    const extension = archivo.name.split('.').pop() ?? 'jpg';
    const ruta = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const { error } = await client.storage.from('productos').upload(ruta, archivo, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) return { error: error.message };

    const { data } = client.storage.from('productos').getPublicUrl(ruta);
    return { url: data.publicUrl };
  }
}
