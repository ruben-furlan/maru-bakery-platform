import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ProductsService } from '../core/products.service';

@Component({
  selector: 'app-featured-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-2xl text-bordo">Destacados</h1>
    <p class="mt-1 text-sm text-cacao/60">
      Elegí el "producto de la semana": es el que aparece en la tarjeta polaroid del hero.
    </p>

    @if (mensaje(); as msg) {
      <p class="mt-4 rounded-xl bg-dorado/20 p-3 text-sm text-cacao" role="status">{{ msg }}</p>
    }

    <ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @for (producto of productos.productos(); track producto.id) {
        <li>
          <article
            class="flex h-full flex-col overflow-hidden rounded-vitrina bg-white shadow-bordo"
            [class.ring-4]="producto.destacado"
            [class.ring-dorado]="producto.destacado"
          >
            <img [src]="producto.imagen_url" [alt]="producto.nombre" class="aspect-video w-full object-cover" />
            <div class="flex flex-1 flex-col p-4">
              <h2 class="font-display font-bold text-bordo">{{ producto.nombre }}</h2>
              <p class="mt-1 flex-1 text-sm text-cacao/60">{{ producto.categoria }}</p>
              @if (producto.destacado) {
                <p class="mt-3 rounded-full bg-dorado px-4 py-2 text-center text-sm font-bold text-cacao">
                  ⭐ Producto de la semana
                </p>
              } @else {
                <button
                  type="button"
                  (click)="destacar(producto.id)"
                  [disabled]="guardando()"
                  class="mt-3 rounded-full border border-bordo px-4 py-2 text-sm font-bold text-bordo transition-colors hover:bg-bordo hover:text-crema disabled:opacity-60"
                >
                  Marcar como destacado
                </button>
              }
            </div>
          </article>
        </li>
      } @empty {
        <li class="rounded-vitrina bg-white p-6 text-center text-cacao/60 shadow-bordo">
          Cargá productos primero para poder destacar uno.
        </li>
      }
    </ul>
  `,
})
export class FeaturedAdminComponent {
  readonly productos = inject(ProductsService);

  readonly guardando = signal(false);
  readonly mensaje = signal<string | null>(null);

  async destacar(id: string): Promise<void> {
    this.guardando.set(true);
    const error = await this.productos.marcarDestacado(id);
    this.guardando.set(false);
    this.mensaje.set(error ?? 'Producto de la semana actualizado ✔');
  }
}
