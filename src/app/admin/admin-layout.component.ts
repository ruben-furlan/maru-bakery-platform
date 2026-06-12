import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { LogoComponent } from '../shared/logo.component';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LogoComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-[#fdf8ec] md:flex-row">
      <!-- Sidebar (header sticky en mobile) -->
      <aside
        class="sticky top-0 z-40 flex shrink-0 flex-col bg-bordo text-crema shadow-bordo md:static md:min-h-screen md:w-64 md:shadow-none"
      >
        <div class="flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2 px-4 py-3 md:px-5 md:py-4">
            <span class="block h-9 w-9"><app-logo /></span>
            <span class="leading-none">
              <span class="font-script text-xl">Marü</span>
              <span class="block font-display text-[0.6rem] uppercase tracking-[0.35em] text-dorado"
                >Admin</span
              >
            </span>
          </a>
          <button
            type="button"
            (click)="salir()"
            class="mr-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-bordo-dark md:hidden"
          >
            <span aria-hidden="true">🚪</span>
            Salir
          </button>
        </div>

        <nav class="px-3 pb-2 md:flex-1 md:pb-4" aria-label="Navegación del panel">
          <ul
            class="scrollbar-none -mx-3 flex gap-1 overflow-x-auto px-3 md:mx-0 md:flex-col md:overflow-visible md:px-0"
          >
            @for (item of menu; track item.ruta) {
              <li>
                <a
                  [routerLink]="item.ruta"
                  routerLinkActive="bg-bordo-dark text-dorado"
                  [routerLinkActiveOptions]="{ exact: item.exacto }"
                  class="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 font-medium transition-colors hover:bg-bordo-dark md:gap-3 md:px-4"
                >
                  <span aria-hidden="true">{{ item.icono }}</span>
                  {{ item.titulo }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="hidden border-t border-crema/15 p-3 md:block">
          <button
            type="button"
            (click)="salir()"
            class="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 font-medium transition-colors hover:bg-bordo-dark"
          >
            <span aria-hidden="true">🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main class="flex-1 p-4 pb-10 sm:p-5 md:p-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menu = [
    { ruta: '/admin', titulo: 'Productos', icono: '🧁', exacto: true },
    { ruta: '/admin/destacados', titulo: 'Destacados', icono: '⭐', exacto: false },
    { ruta: '/admin/textos', titulo: 'Textos del sitio', icono: '✏️', exacto: false },
    { ruta: '/admin/testimonios', titulo: 'Testimonios', icono: '💬', exacto: false },
    { ruta: '/admin/pedidos', titulo: 'Pedidos', icono: '📋', exacto: false },
  ];

  async salir(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigate(['/admin/login']);
  }
}
