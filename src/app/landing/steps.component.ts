import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="como-encargar" class="bg-bordo py-16 text-crema lg:py-24">
      <div class="mx-auto max-w-6xl px-4 lg:px-8">
        <div appReveal class="mb-12 text-center">
          <p class="font-script text-2xl text-dorado">Así de fácil</p>
          <h2 class="mt-1 text-3xl sm:text-4xl">Cómo encargar</h2>
        </div>

        <ol class="grid gap-8 sm:grid-cols-3">
          @for (paso of pasos; track paso.numero) {
            <li appReveal>
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
