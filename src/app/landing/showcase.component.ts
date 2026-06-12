import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService, MAX_POR_PRODUCTO } from '../core/cart.service';
import { Producto } from '../core/models';
import { ProductsService } from '../core/products.service';
import { ParallaxDirective } from '../shared/parallax.directive';
import { RevealDirective } from '../shared/reveal.directive';
import { TiltDirective } from '../shared/tilt.directive';

@Component({
  selector: 'app-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, ParallaxDirective, RevealDirective, TiltDirective],
  template: `
    <section id="productos" class="relative overflow-hidden py-16 lg:py-24">
      <!-- Profundidad de fondo -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <span
          [appParallax]="0.25"
          class="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-dorado/15 blur-3xl"
        ></span>
        <span
          [appParallax]="-0.2"
          class="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-bordo/10 blur-3xl"
        ></span>
        <span
          [appParallax]="-0.3"
          [parallaxMovil]="true"
          class="flotante absolute right-[10%] top-16 text-xl text-dorado/50"
          >✦</span
        >
      </div>

      <div class="relative mx-auto max-w-6xl px-4 lg:px-8">
        <div appReveal class="mb-10 text-center">
          <p class="font-script text-2xl text-dorado">La vitrina</p>
          <h2 class="mt-1 text-3xl text-bordo sm:text-4xl">Dulces que enamoran</h2>
          <p class="mx-auto mt-3 max-w-xl text-cacao/70">
            Todo se hace por encargo, con ingredientes de verdad y mucho cariño. Agregá tus
            favoritos al pedido y completá tus datos.
          </p>
        </div>

        <!-- Carrusel con scroll-snap en mobile, grilla de 4 columnas en desktop -->
        <ul
          class="vitrina-scroll -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0"
        >
          @for (producto of productos(); track producto.id; let i = $index) {
            <li class="w-72 shrink-0 lg:w-auto" appReveal="3d" [revealDelay]="(i % 4) * 100">
              <article
                appTilt
                class="group flex h-full flex-col overflow-hidden rounded-vitrina bg-white shadow-bordo transition-shadow duration-300 hover:shadow-bordo-lg"
              >
                <img
                  [src]="producto.imagen_url"
                  [alt]="'Foto de ' + producto.nombre"
                  class="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  width="288"
                  height="288"
                  loading="lazy"
                />
                <div class="flex flex-1 flex-col p-5">
                  <p class="text-xs font-bold uppercase tracking-widest text-dorado">
                    {{ producto.categoria }}
                  </p>
                  <h3 class="mt-1 text-xl text-bordo">{{ producto.nombre }}</h3>
                  <p class="mt-1.5 line-clamp-3 flex-1 text-sm text-cacao/70">
                    {{ producto.descripcion }}
                  </p>
                  <div class="mt-4 flex items-center justify-between gap-3">
                    <span class="font-display text-lg font-bold text-cacao">
                      {{ producto.precio | currency: 'UYU' : '$ ' : '1.0-0' }}
                    </span>
                    @let enMaximo = carrito.cantidadDe(producto.id) >= maxPorProducto;
                    <button
                      type="button"
                      (click)="agregar(producto)"
                      [disabled]="enMaximo"
                      class="rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed"
                      [class]="
                        enMaximo
                          ? 'bg-cacao/10 text-cacao/60'
                          : recienAgregado() === producto.id
                            ? 'bg-dorado text-cacao'
                            : 'bg-bordo text-crema hover:bg-bordo-dark'
                      "
                    >
                      {{
                        enMaximo
                          ? 'Máximo ' + maxPorProducto
                          : recienAgregado() === producto.id
                            ? '✓ Agregado'
                            : 'Agregar'
                      }}
                    </button>
                  </div>
                </div>
              </article>
            </li>
          } @empty {
            <li class="w-full text-center text-cacao/60">
              Pronto vas a ver acá nuestras delicias 🧁
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class ShowcaseComponent {
  protected readonly carrito = inject(CartService);
  protected readonly maxPorProducto = MAX_POR_PRODUCTO;

  readonly productos = inject(ProductsService).disponibles;

  /** Id del último producto agregado, para el feedback "✓ Agregado". */
  readonly recienAgregado = signal<string | null>(null);
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  agregar(producto: Producto): void {
    // Si ya está en el máximo no hay feedback de "agregado": el botón queda deshabilitado
    if (!this.carrito.agregar(producto)) return;
    this.recienAgregado.set(producto.id);
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.recienAgregado.set(null), 1500);
  }
}
