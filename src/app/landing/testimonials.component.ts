import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SiteTextsService } from '../core/site-texts.service';
import { TestimonialsService } from '../core/testimonials.service';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-testimonials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="nosotros" class="mx-auto max-w-6xl px-4 py-16 lg:px-8 lg:py-24">
      <div appReveal class="mb-10 text-center">
        <p class="font-script text-2xl text-dorado">Dulce evidencia</p>
        <h2 class="mt-1 text-3xl text-bordo sm:text-4xl">Lo que dicen nuestros clientes</h2>
        <p class="mx-auto mt-3 max-w-2xl text-cacao/70">
          Marü Bakery nace en una cocina de Montevideo, de la mano de una pastelera que cree que lo casero no se negocia.
          Esto es lo que cuentan quienes ya probaron.
        </p>
      </div>

      <!-- Estadísticas de marketing (configurables desde el admin) -->
      <dl appReveal class="mb-12 grid grid-cols-3 gap-3 sm:gap-5">
        @for (stat of stats(); track stat.texto) {
          <div
            class="rounded-vitrina bg-bordo px-3 py-6 text-center text-crema shadow-bordo transition-transform duration-300 hover:-translate-y-1 sm:px-6 sm:py-8"
          >
            <dd class="font-script text-3xl text-dorado sm:text-5xl">{{ stat.numero }}</dd>
            <dt class="mt-2 text-xs font-medium text-crema/85 sm:text-sm">{{ stat.texto }}</dt>
          </div>
        }
      </dl>

      <!-- Comentarios: carrusel con scroll-snap en mobile, grilla en desktop -->
      <ul
        appReveal
        class="vitrina-scroll -mx-4 -mt-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 pt-4 lg:mx-0 lg:mt-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pt-0"
      >
        @for (testimonio of testimonios(); track testimonio.id) {
          <li class="w-80 shrink-0 lg:w-auto">
            <figure
              class="relative flex h-full flex-col rounded-vitrina border border-dorado/40 bg-white p-6 pt-8 shadow-bordo"
            >
              <span
                class="font-script absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-dorado text-2xl text-bordo shadow-bordo"
                aria-hidden="true"
              >
                “
              </span>
              <p class="text-sm text-dorado" [attr.aria-label]="testimonio.estrellas + ' de 5 estrellas'">
                <span aria-hidden="true">{{ estrellas(testimonio.estrellas) }}</span>
              </p>
              <blockquote class="mt-2 flex-1 text-sm leading-relaxed text-cacao/80">
                {{ testimonio.comentario }}
              </blockquote>
              <figcaption class="mt-4 font-script text-lg text-bordo">— {{ testimonio.nombre }}</figcaption>
            </figure>
          </li>
        } @empty {
          <li class="w-full text-center text-cacao/60">Pronto vas a leer acá lo que opinan nuestros clientes 💬</li>
        }
      </ul>

      <p appReveal class="mt-10 text-center text-cacao/70">
        ¿Querés ver lo último que salió del horno? Seguinos en
        <a
          [href]="linkInstagram()"
          target="_blank"
          rel="noopener"
          class="font-bold text-bordo underline decoration-dorado decoration-2 underline-offset-4"
        >
          &#64;{{ usuario() }}
        </a>
      </p>
    </section>
  `,
})
export class TestimonialsComponent {
  private readonly textos = inject(SiteTextsService);

  readonly testimonios = inject(TestimonialsService).visibles;
  readonly linkInstagram = this.textos.linkInstagram;
  readonly usuario = () => this.textos.textos().instagram;

  readonly stats = computed(() => {
    const t = this.textos.textos();
    return [
      { numero: t.stat_1_numero, texto: t.stat_1_texto },
      { numero: t.stat_2_numero, texto: t.stat_2_texto },
      { numero: t.stat_3_numero, texto: t.stat_3_texto },
    ].filter((s) => s.numero && s.texto);
  });

  estrellas(cantidad: number): string {
    return '★'.repeat(Math.max(1, Math.min(5, cantidad)));
  }
}
