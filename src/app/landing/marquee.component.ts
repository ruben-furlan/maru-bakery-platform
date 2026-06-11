import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiteTextsService } from '../core/site-texts.service';

@Component({
  selector: 'app-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-hidden bg-dorado py-3" aria-hidden="true">
      <div class="marquee-track flex w-max gap-8">
        <!-- contenido duplicado para el loop continuo -->
        @for (copia of [0, 1]; track copia) {
          <ul class="flex shrink-0 items-center gap-8">
            @for (frase of frases(); track frase) {
              <li class="font-display font-semibold tracking-wide text-cacao">{{ frase }}</li>
              <li class="text-bordo">✦</li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class MarqueeComponent {
  readonly frases = inject(SiteTextsService).frasesMarquee;
}
