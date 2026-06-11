import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiteTextsService } from '../core/site-texts.service';

@Component({
  selector: 'app-mobile-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Botón flotante de WhatsApp -->
    <a
      [href]="whatsApp()"
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp"
      class="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-bordo-lg transition-transform duration-300 hover:-translate-y-1 md:bottom-6 md:right-6"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" class="h-7 w-7" aria-hidden="true">
        <path
          d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3.2-.5 0-.2 0-.4-.1-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7a11 11 0 0 0 4.2 3.7c.6.3 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3Z"
        />
      </svg>
    </a>

    <!-- Barra inferior fija (solo mobile) -->
    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-bordo/10 bg-white/95 backdrop-blur md:hidden"
      aria-label="Navegación inferior"
    >
      <ul class="grid grid-cols-4">
        <li>
          <a href="#inicio" class="flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-cacao/80">
            <span class="text-lg" aria-hidden="true">🏠</span>
            Inicio
          </a>
        </li>
        <li>
          <a href="#productos" class="flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-cacao/80">
            <span class="text-lg" aria-hidden="true">🧁</span>
            Vitrina
          </a>
        </li>
        <li>
          <a
            [href]="whatsApp()"
            target="_blank"
            rel="noopener"
            class="flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold text-bordo"
          >
            <span class="text-lg" aria-hidden="true">💬</span>
            Encargar
          </a>
        </li>
        <li>
          <a href="#contacto" class="flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-cacao/80">
            <span class="text-lg" aria-hidden="true">📍</span>
            Contacto
          </a>
        </li>
      </ul>
    </nav>
  `,
})
export class MobileNavComponent {
  private readonly textos = inject(SiteTextsService);

  whatsApp(): string {
    return this.textos.whatsAppConMensaje('¡Hola Marü Bakery! Quiero hacer un pedido 🍰');
  }
}
