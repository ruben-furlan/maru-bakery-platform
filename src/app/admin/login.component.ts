import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { LogoComponent } from '../shared/logo.component';

@Component({
  selector: 'app-admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, LogoComponent],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-bordo px-4">
      <div class="w-full max-w-sm rounded-vitrina bg-crema p-8 shadow-bordo-lg">
        <div class="mb-6 flex flex-col items-center text-bordo">
          <span class="block h-14 w-14"><app-logo /></span>
          <h1 class="mt-2 text-2xl">Administración</h1>
          <p class="text-sm text-cacao/60">Marü Bakery</p>
        </div>

        <form class="space-y-4" (ngSubmit)="ingresar()">
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-cacao">Email</span>
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              autocomplete="email"
              class="w-full rounded-xl border border-cacao/20 bg-white px-4 py-2.5"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-cacao">Contraseña</span>
            <input
              type="password"
              name="password"
              [(ngModel)]="password"
              required
              autocomplete="current-password"
              class="w-full rounded-xl border border-cacao/20 bg-white px-4 py-2.5"
            />
          </label>

          @if (error()) {
            <p class="rounded-xl bg-bordo/10 p-3 text-sm text-bordo" role="alert">{{ error() }}</p>
          }

          <button
            type="submit"
            [disabled]="cargando()"
            class="w-full rounded-full bg-bordo py-3 font-bold text-crema transition-colors hover:bg-bordo-dark disabled:opacity-60"
          >
            {{ cargando() ? 'Ingresando…' : 'Ingresar' }}
          </button>
        </form>

        <a routerLink="/" class="mt-6 block text-center text-sm text-cacao/60 hover:text-cacao"
          >← Volver al sitio</a
        >
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  async ingresar(): Promise<void> {
    this.error.set(null);
    this.cargando.set(true);
    const error = await this.auth.iniciarSesion(this.email.trim(), this.password);
    this.cargando.set(false);

    if (error) {
      this.error.set(error);
    } else {
      await this.router.navigate(['/admin']);
    }
  }
}
