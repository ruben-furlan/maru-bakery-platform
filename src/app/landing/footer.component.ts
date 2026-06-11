import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../core/orders.service';
import { SiteTextsService } from '../core/site-texts.service';
import { LogoComponent } from '../shared/logo.component';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, LogoComponent, RevealDirective],
  template: `
    <footer id="contacto" class="bg-cacao pb-24 pt-16 text-crema md:pb-16">
      <div class="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-3 lg:px-8">
        <div appReveal>
          <div class="flex items-center gap-2">
            <span class="block h-10 w-10 text-crema"><app-logo /></span>
            <span class="leading-none">
              <span class="font-script text-2xl">Marü</span>
              <span class="block font-display text-[0.65rem] uppercase tracking-[0.35em] text-dorado">Bakery</span>
            </span>
          </div>
          <p class="mt-4 max-w-xs text-sm text-crema/70">{{ textos.textos().eslogan }}.</p>

          <nav class="mt-6" aria-label="Navegación del pie">
            <ul class="space-y-2 text-sm">
              <li><a href="#productos" class="nav-link">Productos</a></li>
              <li><a href="#como-encargar" class="nav-link">Cómo encargar</a></li>
              <li><a href="#nosotros" class="nav-link">Nosotros</a></li>
            </ul>
          </nav>
        </div>

        <div appReveal>
          <h2 class="text-xl">Contacto</h2>
          <ul class="mt-4 space-y-3 text-sm text-crema/80">
            <li>
              <a [href]="textos.linkWhatsApp()" target="_blank" rel="noopener" class="nav-link">
                WhatsApp: +{{ textos.textos().whatsapp }}
              </a>
            </li>
            <li>
              <a [href]="textos.linkInstagram()" target="_blank" rel="noopener" class="nav-link">
                Instagram: &#64;{{ textos.textos().instagram }}
              </a>
            </li>
            <li>
              <a [href]="'mailto:' + textos.textos().email" class="nav-link">{{ textos.textos().email }}</a>
            </li>
            <li>{{ textos.textos().direccion }}</li>
          </ul>
        </div>

        <!-- Formulario de consulta: alimenta la tabla "pedidos" del admin -->
        <div appReveal>
          <h2 class="text-xl">¿Tenés un antojo? Escribinos</h2>
          @if (enviado()) {
            <p class="mt-4 rounded-2xl bg-dorado/15 p-4 text-sm text-dorado" role="status">
              ¡Gracias! Recibimos tu consulta y te respondemos a la brevedad 💛
            </p>
          } @else {
            <form class="mt-4 space-y-3" (ngSubmit)="enviar()">
              <label class="block text-sm">
                <span class="sr-only">Tu nombre</span>
                <input
                  type="text"
                  name="nombre"
                  [(ngModel)]="nombre"
                  required
                  placeholder="Tu nombre"
                  class="w-full rounded-xl border border-crema/20 bg-cacao px-4 py-2.5 text-crema placeholder:text-crema/40"
                />
              </label>
              <label class="block text-sm">
                <span class="sr-only">Tu WhatsApp o email</span>
                <input
                  type="text"
                  name="contacto"
                  [(ngModel)]="contacto"
                  required
                  placeholder="Tu WhatsApp o email"
                  class="w-full rounded-xl border border-crema/20 bg-cacao px-4 py-2.5 text-crema placeholder:text-crema/40"
                />
              </label>
              <label class="block text-sm">
                <span class="sr-only">Tu mensaje</span>
                <textarea
                  name="mensaje"
                  [(ngModel)]="mensaje"
                  required
                  rows="3"
                  placeholder="Contanos qué querés encargar…"
                  class="w-full rounded-xl border border-crema/20 bg-cacao px-4 py-2.5 text-crema placeholder:text-crema/40"
                ></textarea>
              </label>
              @if (error()) {
                <p class="text-sm text-dorado" role="alert">{{ error() }}</p>
              }
              <button
                type="submit"
                [disabled]="enviando()"
                class="rounded-full bg-dorado px-6 py-2.5 font-bold text-cacao transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {{ enviando() ? 'Enviando…' : 'Enviar consulta' }}
              </button>
            </form>
          }
        </div>
      </div>

      <div class="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-crema/10 px-4 pt-6 text-xs text-crema/50 sm:flex-row lg:px-8">
        <p>© {{ anio }} Marü Bakery · Montevideo, Uruguay</p>
        <a routerLink="/admin" class="transition-colors hover:text-crema/80">⚙ Acceso administración</a>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly textos = inject(SiteTextsService);
  private readonly pedidos = inject(OrdersService);

  readonly anio = new Date().getFullYear();

  nombre = '';
  contacto = '';
  mensaje = '';

  readonly enviando = signal(false);
  readonly enviado = signal(false);
  readonly error = signal<string | null>(null);

  async enviar(): Promise<void> {
    if (!this.nombre.trim() || !this.contacto.trim() || !this.mensaje.trim()) {
      this.error.set('Completá tu nombre, un contacto y el mensaje.');
      return;
    }

    this.error.set(null);
    this.enviando.set(true);
    const error = await this.pedidos.enviar({
      nombre: this.nombre.trim(),
      contacto: this.contacto.trim(),
      mensaje: this.mensaje.trim(),
      producto: null,
    });
    this.enviando.set(false);

    if (error) {
      this.error.set('No pudimos enviar tu consulta. Probá escribirnos por WhatsApp.');
    } else {
      this.enviado.set(true);
    }
  }
}
