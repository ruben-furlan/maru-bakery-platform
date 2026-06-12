import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductsService } from '../core/products.service';
import { SiteTextsService } from '../core/site-texts.service';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RevealDirective],
  template: `
    <section id="inicio" class="bg-bordo text-crema">
      <div class="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:pt-20">
        <div appReveal>
          <p class="mb-4 inline-block rounded-full border border-dorado/60 px-4 py-1 text-sm tracking-wide text-dorado">
            Pastelería artesanal · Montevideo
          </p>
          <h1 class="text-4xl leading-tight sm:text-5xl lg:text-6xl">
            {{ esloganPrincipio() }}
            <span class="font-script mt-2 inline-block -rotate-2 text-dorado">{{ esloganFinal() }}</span>
          </h1>
          <p class="mt-6 max-w-xl text-lg text-crema/85">{{ textos.textos().hero_subtitulo }}</p>

          <div class="mt-8 flex flex-wrap gap-4">
            <a
              href="#productos"
              class="rounded-full bg-crema px-7 py-3.5 font-bold text-bordo transition-transform duration-300 hover:-translate-y-1 hover:shadow-bordo-lg"
            >
              Ver la vitrina
            </a>
            <a
              href="#como-encargar"
              class="rounded-full border-2 border-dorado px-7 py-3.5 font-bold text-dorado transition-transform duration-300 hover:-translate-y-1 hover:bg-dorado hover:text-cacao"
            >
              ¿Cómo encargar?
            </a>
          </div>
        </div>

        <!-- Producto de la semana, tarjeta tipo polaroid -->
        @if (destacado(); as producto) {
          <div appReveal class="justify-self-center">
            <article
              class="relative w-72 rotate-3 rounded-2xl bg-crema p-4 pb-6 text-cacao shadow-bordo-lg transition-transform duration-300 hover:rotate-1"
            >
              <span
                class="font-script absolute -top-4 left-6 -rotate-6 rounded-full bg-dorado px-4 py-1.5 text-sm text-cacao shadow-bordo"
              >
                ¡Producto de la semana!
              </span>
              <img
                [src]="producto.imagen_url"
                [alt]="'Foto de ' + producto.nombre"
                class="aspect-square w-full rounded-xl object-cover"
                width="288"
                height="288"
                fetchpriority="high"
              />
              <h2 class="mt-4 text-xl">{{ producto.nombre }}</h2>
              <p class="mt-1 line-clamp-2 text-sm text-cacao/70">{{ producto.descripcion }}</p>
              <p class="mt-2 font-display text-lg font-bold text-bordo">
                {{ producto.precio | currency: 'UYU' : '$ ' : '1.0-0' }}
              </p>
            </article>
          </div>
        }
      </div>
    </section>
  `,
})
export class HeroComponent {
  readonly textos = inject(SiteTextsService);
  private readonly productos = inject(ProductsService);

  readonly destacado = this.productos.destacado;

  /** Divide el eslogan: la segunda mitad va en script dorada. */
  private readonly partes = computed(() => {
    const palabras = this.textos.textos().eslogan.split(' ');
    const corte = Math.floor(palabras.length / 2);
    return [palabras.slice(0, corte).join(' '), palabras.slice(corte).join(' ')];
  });

  readonly esloganPrincipio = computed(() => this.partes()[0]);
  readonly esloganFinal = computed(() => this.partes()[1]);
}
