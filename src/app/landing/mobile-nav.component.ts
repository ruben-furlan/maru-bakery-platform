import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-mobile-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Botón flotante del carrito -->
    <button
      type="button"
      (click)="carrito.abrir()"
      aria-label="Ver mi pedido"
      class="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-bordo text-2xl text-crema shadow-bordo-lg transition-transform duration-300 hover:-translate-y-1 md:bottom-6 md:right-6"
    >
      🧺
      @if (carrito.cantidadTotal() > 0) {
        <span
          class="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-dorado px-1.5 text-xs font-bold text-cacao"
          aria-live="polite"
        >
          {{ carrito.cantidadTotal() }}
        </span>
      }
    </button>

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
          <button
            type="button"
            (click)="carrito.abrir()"
            class="flex w-full flex-col items-center gap-0.5 py-2.5 text-xs font-bold text-bordo"
          >
            <span class="text-lg" aria-hidden="true">🧺</span>
            Mi pedido
          </button>
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
  readonly carrito = inject(CartService);
}
