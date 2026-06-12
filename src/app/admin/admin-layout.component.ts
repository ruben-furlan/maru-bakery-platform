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
      <!-- Sidebar -->
      <aside class="flex shrink-0 flex-col bg-bordo text-crema md:min-h-screen md:w-64">
        <a routerLink="/" class="flex items-center gap-2 px-5 py-4">
          <span class="block h-9 w-9"><app-logo /></span>
          <span class="leading-none">
            <span class="font-script text-xl">Marü</span>
            <span class="block font-display text-[0.6rem] uppercase tracking-[0.35em] text-dorado">Admin</span>
          </span>
        </a>

        <nav class="flex-1 px-3 pb-4" aria-label="Navegación del panel">
          <ul class="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            @for (item of menu; track item.ruta) {
              <li>
                <a
                  [routerLink]="item.ruta"
                  routerLinkActive="bg-bordo-dark text-dorado"
                  [routerLinkActiveOptions]="{ exact: item.exacto }"
                  class="flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 font-medium transition-colors hover:bg-bordo-dark"
                >
                  <span aria-hidden="true">{{ item.icono }}</span>
                  {{ item.titulo }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="border-t border-crema/15 p-3">
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

      <main class="flex-1 p-5 md:p-8">
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
