import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SiteTextsService } from '../core/site-texts.service';
import { LogoComponent } from '../shared/logo.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoComponent],
  template: `
    <header class="sticky top-0 z-40 bg-bordo text-crema shadow-bordo">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <a href="#inicio" class="flex items-center gap-2" aria-label="Marü Bakery, ir al inicio">
          <span class="block h-10 w-10 text-crema"><app-logo /></span>
          <span class="leading-none">
            <span class="font-script text-2xl">Marü</span>
            <span class="block font-display text-[0.65rem] uppercase tracking-[0.35em] text-dorado">Bakery</span>
          </span>
        </a>

        <nav class="hidden items-center gap-7 md:flex" aria-label="Navegación principal">
          <a href="#productos" class="nav-link font-medium">Productos</a>
          <a href="#como-encargar" class="nav-link font-medium">Cómo encargar</a>
          <a href="#nosotros" class="nav-link font-medium">Nosotros</a>
          <a href="#contacto" class="nav-link font-medium">Contacto</a>
          <a
            [href]="whatsAppPedido()"
            target="_blank"
            rel="noopener"
            class="rounded-full bg-dorado px-5 py-2.5 font-bold text-cacao transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-bordo-lg"
          >
            Hacer pedido
          </a>
        </nav>

        <!-- Hamburguesa animada (mobile) -->
        <button
          type="button"
          class="relative flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          [attr.aria-expanded]="menuAbierto()"
          aria-controls="menu-mobile"
          aria-label="Abrir o cerrar el menú"
          (click)="menuAbierto.set(!menuAbierto())"
        >
          <span
            class="block h-0.5 w-6 rounded bg-crema transition-transform duration-300"
            [class.translate-y-2]="menuAbierto()"
            [class.rotate-45]="menuAbierto()"
          ></span>
          <span
            class="block h-0.5 w-6 rounded bg-crema transition-opacity duration-300"
            [class.opacity-0]="menuAbierto()"
          ></span>
          <span
            class="block h-0.5 w-6 rounded bg-crema transition-transform duration-300"
            [class.-translate-y-2]="menuAbierto()"
            [class.-rotate-45]="menuAbierto()"
          ></span>
        </button>
      </div>

      <!-- Menú mobile desplegable -->
      <div
        id="menu-mobile"
        class="grid overflow-hidden bg-bordo-dark transition-[grid-template-rows] duration-300 md:hidden"
        [class.grid-rows-[1fr]]="menuAbierto()"
        [class.grid-rows-[0fr]]="!menuAbierto()"
      >
        <nav class="min-h-0 overflow-hidden" aria-label="Navegación mobile">
          <ul class="flex flex-col gap-1 px-6 py-4">
            <li><a href="#productos" class="block py-2.5 font-medium" (click)="menuAbierto.set(false)">Productos</a></li>
            <li><a href="#como-encargar" class="block py-2.5 font-medium" (click)="menuAbierto.set(false)">Cómo encargar</a></li>
            <li><a href="#nosotros" class="block py-2.5 font-medium" (click)="menuAbierto.set(false)">Nosotros</a></li>
            <li><a href="#contacto" class="block py-2.5 font-medium" (click)="menuAbierto.set(false)">Contacto</a></li>
            <li class="pt-2">
              <a
                [href]="whatsAppPedido()"
                target="_blank"
                rel="noopener"
                class="block rounded-full bg-dorado px-5 py-3 text-center font-bold text-cacao"
                (click)="menuAbierto.set(false)"
              >
                Hacer pedido
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private readonly textos = inject(SiteTextsService);

  readonly menuAbierto = signal(false);

  whatsAppPedido(): string {
    return this.textos.whatsAppConMensaje('¡Hola Marü Bakery! Quiero hacer un pedido 🍰');
  }
}
