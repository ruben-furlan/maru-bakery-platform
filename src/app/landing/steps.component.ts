import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParallaxDirective } from '../shared/parallax.directive';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParallaxDirective, RevealDirective],
  template: `
    <section id="como-encargar" class="relative overflow-hidden bg-bordo py-16 text-crema lg:py-24">
      <!-- Profundidad de fondo -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <span [appParallax]="0.3" class="absolute -right-28 top-0 h-80 w-80 rounded-full bg-dorado/15 blur-3xl"></span>
        <span [appParallax]="-0.25" class="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-crema/10 blur-3xl"></span>
        <span [appParallax]="0.4" class="flotante absolute left-[8%] top-20 hidden h-12 w-12 rounded-full border-2 border-dorado/25 lg:block"></span>
        <span [appParallax]="-0.3" class="flotante-lento absolute right-[12%] bottom-24 text-xl text-dorado/40">✦</span>
      </div>

      <div class="relative mx-auto max-w-6xl px-4 lg:px-8">
        <div appReveal class="mb-12 text-center">
          <p class="font-script text-2xl text-dorado">Así de fácil</p>
          <h2 class="mt-1 text-3xl sm:text-4xl">Cómo encargar</h2>
        </div>

        <ol class="grid gap-8 sm:grid-cols-3">
          @for (paso of pasos; track paso.numero; let i = $index) {
            <li appReveal="3d" [revealDelay]="i * 130">
              <article class="h-full rounded-vitrina border border-crema/15 bg-bordo-dark/60 p-7 text-center">
                <span
                  class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-dorado font-display text-2xl font-bold text-cacao"
                  aria-hidden="true"
                >
                  {{ paso.numero }}
                </span>
                <span class="mt-4 block text-3xl" aria-hidden="true">{{ paso.icono }}</span>
                <h3 class="mt-3 text-xl">{{ paso.titulo }}</h3>
                <p class="mt-2 text-sm text-crema/80">{{ paso.detalle }}</p>
              </article>
            </li>
          }
        </ol>

        <div appReveal class="mt-12 text-center">
          <a
            href="#productos"
            class="inline-block rounded-full bg-dorado px-8 py-3.5 font-bold text-cacao transition-transform duration-300 hover:-translate-y-1 hover:shadow-bordo-lg"
          >
            Empezar mi pedido
          </a>
        </div>
      </div>
    </section>
  `,
})
export class StepsComponent {
  readonly pasos = [
    {
      numero: 1,
      icono: '🧺',
      titulo: 'Armá tu pedido',
      detalle: 'Recorré la vitrina y agregá al carrito tus tortas, postres o box dulces favoritos.',
    },
    {
      numero: 2,
      icono: '📋',
      titulo: 'Completá tus datos',
      detalle: 'Contanos cómo lo recibís y cómo pagás. Te llega el resumen por correo y coordinamos juntos el día de entrega.',
    },
    {
      numero: 3,
      icono: '🎀',
      titulo: 'Recibilo fresquito',
      detalle: 'Horneamos todo el mismo día. Te lo llevamos a tu casa o lo coordinamos en un punto de encuentro.',
    },
  ];
}
