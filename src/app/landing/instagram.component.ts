import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiteTextsService } from '../core/site-texts.service';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-instagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="nosotros" class="mx-auto max-w-6xl px-4 py-16 lg:px-8 lg:py-24">
      <div appReveal class="mb-10 text-center">
        <p class="font-script text-2xl text-dorado">Detrás del horno</p>
        <h2 class="mt-1 text-3xl text-bordo sm:text-4xl">Nosotros, en cada bocado</h2>
        <p class="mx-auto mt-3 max-w-2xl text-cacao/70">
          Marü Bakery nace en una cocina de Montevideo, de la mano de una pastelera que cree que lo casero no se negocia.
          Cada torta sale del horno el día de tu evento. Seguinos en
          <a [href]="linkInstagram()" target="_blank" rel="noopener" class="font-bold text-bordo underline decoration-dorado decoration-2 underline-offset-4">
            &#64;{{ usuario() }}
          </a>
          para ver lo último de la vitrina.
        </p>
      </div>

      <ul appReveal class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        @for (tile of tiles; track tile.alt) {
          <li>
            <a
              [href]="linkInstagram()"
              target="_blank"
              rel="noopener"
              class="group relative block overflow-hidden rounded-2xl"
              [attr.aria-label]="'Ver ' + tile.alt + ' en Instagram'"
            >
              <img
                [src]="tile.src"
                [alt]="tile.alt"
                class="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                width="200"
                height="200"
                loading="lazy"
              />
              <span
                class="absolute inset-0 flex items-center justify-center bg-bordo/0 text-2xl text-crema opacity-0 transition-all duration-300 group-hover:bg-bordo/60 group-hover:opacity-100"
                aria-hidden="true"
              >
                ♥
              </span>
            </a>
          </li>
        }
      </ul>
    </section>
  `,
})
export class InstagramComponent {
  private readonly textos = inject(SiteTextsService);

  readonly linkInstagram = this.textos.linkInstagram;
  readonly usuario = () => this.textos.textos().instagram;

  readonly tiles = [
    { src: '/img/insta-1.svg', alt: 'torta decorada con frutas' },
    { src: '/img/insta-2.svg', alt: 'box dulce surtido' },
    { src: '/img/insta-3.svg', alt: 'cheesecake de frutos rojos' },
    { src: '/img/insta-4.svg', alt: 'cupcakes con crema' },
    { src: '/img/insta-5.svg', alt: 'torta personalizada de cumpleaños' },
    { src: '/img/insta-6.svg', alt: 'alfajores artesanales' },
  ];
}
