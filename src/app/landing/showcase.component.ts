import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Producto } from '../core/models';
import { ProductsService } from '../core/products.service';
import { SiteTextsService } from '../core/site-texts.service';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RevealDirective],
  template: `
    <section id="productos" class="mx-auto max-w-6xl px-4 py-16 lg:px-8 lg:py-24">
      <div appReveal class="mb-10 text-center">
        <p class="font-script text-2xl text-dorado">La vitrina</p>
        <h2 class="mt-1 text-3xl text-bordo sm:text-4xl">Dulces que enamoran</h2>
        <p class="mx-auto mt-3 max-w-xl text-cacao/70">
          Todo se hace por encargo, con ingredientes de verdad y mucho cariño. Elegí tu favorito y encargalo por WhatsApp.
        </p>
      </div>

      <!-- Carrusel con scroll-snap en mobile, grilla de 4 columnas en desktop -->
      <ul
        appReveal
        class="vitrina-scroll -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0"
      >
        @for (producto of productos(); track producto.id) {
          <li class="w-72 shrink-0 lg:w-auto">
            <article
              class="group flex h-full flex-col overflow-hidden rounded-vitrina bg-white shadow-bordo transition-all duration-300 hover:-translate-y-2 hover:shadow-bordo-lg"
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
                <p class="text-xs font-bold uppercase tracking-widest text-dorado">{{ producto.categoria }}</p>
                <h3 class="mt-1 text-xl text-bordo">{{ producto.nombre }}</h3>
                <p class="mt-1.5 line-clamp-3 flex-1 text-sm text-cacao/70">{{ producto.descripcion }}</p>
                <div class="mt-4 flex items-center justify-between gap-3">
                  <span class="font-display text-lg font-bold text-cacao">
                    {{ producto.precio | currency: 'UYU' : '$ ' : '1.0-0' }}
                  </span>
                  <a
                    [href]="linkEncargo(producto)"
                    target="_blank"
                    rel="noopener"
                    class="rounded-full bg-bordo px-5 py-2 text-sm font-bold text-crema transition-transform duration-300 hover:-translate-y-0.5 hover:bg-bordo-dark"
                  >
                    Encargar
                  </a>
                </div>
              </div>
            </article>
          </li>
        } @empty {
          <li class="w-full text-center text-cacao/60">Pronto vas a ver acá nuestras delicias 🧁</li>
        }
      </ul>
    </section>
  `,
})
export class ShowcaseComponent {
  private readonly textos = inject(SiteTextsService);

  readonly productos = inject(ProductsService).disponibles;

  linkEncargo(producto: Producto): string {
    return this.textos.whatsAppConMensaje(`¡Hola Marü Bakery! Quiero encargar: ${producto.nombre} 🍰`);
  }
}
