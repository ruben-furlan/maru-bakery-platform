import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../core/cart.service';
import { TipoEntrega, TipoPago } from '../core/models';
import { OrdersService } from '../core/orders.service';

type Paso = 'carrito' | 'datos' | 'listo';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, FormsModule],
  template: `
    @if (carrito.abierto()) {
      <!-- Fondo oscurecido -->
      <div class="fixed inset-0 z-50 bg-cacao/60 backdrop-blur-sm" (click)="cerrar()" aria-hidden="true"></div>

      <!-- Bottom sheet en mobile, panel lateral en desktop -->
      <aside
        class="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl bg-[#fdf8ec] shadow-bordo-lg md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-full md:max-w-md md:rounded-none"
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
      >
        <header class="flex items-center justify-between border-b border-bordo/10 px-5 py-4">
          <h2 class="text-xl text-bordo">
            @switch (paso()) {
              @case ('carrito') { 🧺 Tu pedido }
              @case ('datos') { 📋 Tus datos }
              @case ('listo') { 💛 ¡Pedido enviado! }
            }
          </h2>
          <button
            type="button"
            (click)="cerrar()"
            aria-label="Cerrar el carrito"
            class="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-cacao/60 transition-colors hover:bg-bordo/10"
          >
            ×
          </button>
        </header>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          @switch (paso()) {
            <!-- Paso 1: items del carrito -->
            @case ('carrito') {
              @if (carrito.items().length === 0) {
                <p class="py-10 text-center text-cacao/60">
                  Tu carrito está vacío.<br />
                  Recorré la vitrina y agregá tus antojos 🧁
                </p>
              } @else {
                <ul class="space-y-3">
                  @for (item of carrito.items(); track item.producto.id) {
                    <li class="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-bordo">
                      <img
                        [src]="item.producto.imagen_url"
                        [alt]="'Foto de ' + item.producto.nombre"
                        class="h-16 w-16 shrink-0 rounded-xl object-cover"
                        width="64"
                        height="64"
                        loading="lazy"
                      />
                      <div class="min-w-0 flex-1">
                        <p class="truncate font-display font-bold text-bordo">{{ item.producto.nombre }}</p>
                        <p class="text-sm text-cacao/70">
                          {{ item.producto.precio | currency: 'UYU' : '$ ' : '1.0-0' }} c/u
                        </p>
                        <button
                          type="button"
                          (click)="carrito.quitar(item.producto.id)"
                          class="mt-0.5 text-xs text-bordo/70 underline"
                        >
                          Quitar
                        </button>
                      </div>
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          (click)="carrito.cambiarCantidad(item.producto.id, -1)"
                          [attr.aria-label]="'Quitar uno de ' + item.producto.nombre"
                          class="flex h-8 w-8 items-center justify-center rounded-full border border-bordo/30 font-bold text-bordo"
                        >
                          −
                        </button>
                        <span class="w-5 text-center font-bold" aria-live="polite">{{ item.cantidad }}</span>
                        <button
                          type="button"
                          (click)="carrito.cambiarCantidad(item.producto.id, 1)"
                          [attr.aria-label]="'Agregar uno de ' + item.producto.nombre"
                          class="flex h-8 w-8 items-center justify-center rounded-full bg-bordo font-bold text-crema"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  }
                </ul>
              }
            }

            <!-- Paso 2: formulario de datos -->
            @case ('datos') {
              <form id="form-checkout" class="space-y-4" (ngSubmit)="confirmar()">
                <div class="grid grid-cols-2 gap-3">
                  <label class="block text-sm">
                    <span class="mb-1 block font-bold text-cacao/80">Nombre *</span>
                    <input
                      type="text"
                      name="nombre"
                      [(ngModel)]="nombre"
                      required
                      autocomplete="given-name"
                      class="w-full rounded-xl border border-bordo/20 bg-white px-3.5 py-2.5"
                    />
                  </label>
                  <label class="block text-sm">
                    <span class="mb-1 block font-bold text-cacao/80">Apellido *</span>
                    <input
                      type="text"
                      name="apellido"
                      [(ngModel)]="apellido"
                      required
                      autocomplete="family-name"
                      class="w-full rounded-xl border border-bordo/20 bg-white px-3.5 py-2.5"
                    />
                  </label>
                </div>

                <label class="block text-sm">
                  <span class="mb-1 block font-bold text-cacao/80">Correo electrónico *</span>
                  <input
                    type="email"
                    name="email"
                    [(ngModel)]="email"
                    required
                    autocomplete="email"
                    placeholder="tu@correo.com"
                    class="w-full rounded-xl border border-bordo/20 bg-white px-3.5 py-2.5"
                  />
                  <span class="mt-1 block text-xs text-cacao/60">Te mandamos el resumen del pedido a este correo.</span>
                </label>

                <label class="block text-sm">
                  <span class="mb-1 block font-bold text-cacao/80">Teléfono *</span>
                  <input
                    type="tel"
                    name="telefono"
                    [(ngModel)]="telefono"
                    required
                    autocomplete="tel"
                    placeholder="099 123 456"
                    class="w-full rounded-xl border border-bordo/20 bg-white px-3.5 py-2.5"
                  />
                </label>

                <fieldset>
                  <legend class="mb-2 text-sm font-bold text-cacao/80">¿Cómo lo recibís? *</legend>
                  <div class="grid grid-cols-2 gap-3">
                    <label
                      class="cursor-pointer rounded-xl border-2 p-3 text-center text-sm font-bold transition-colors"
                      [class]="entrega === 'envio' ? 'border-bordo bg-bordo text-crema' : 'border-bordo/20'"
                    >
                      <input type="radio" name="entrega" value="envio" [(ngModel)]="entrega" class="sr-only" />
                      🛵 Envío
                    </label>
                    <label
                      class="cursor-pointer rounded-xl border-2 p-3 text-center text-sm font-bold transition-colors"
                      [class]="entrega === 'punto_encuentro' ? 'border-bordo bg-bordo text-crema' : 'border-bordo/20'"
                    >
                      <input type="radio" name="entrega" value="punto_encuentro" [(ngModel)]="entrega" class="sr-only" />
                      📍 Punto de encuentro
                    </label>
                  </div>
                </fieldset>

                <label class="block text-sm">
                  <span class="mb-1 block font-bold text-cacao/80">
                    {{ entrega === 'envio' ? 'Dirección de entrega *' : 'Punto de encuentro que te quede cómodo' }}
                  </span>
                  <input
                    type="text"
                    name="direccion"
                    [(ngModel)]="direccion"
                    [required]="entrega === 'envio'"
                    autocomplete="street-address"
                    [placeholder]="entrega === 'envio' ? 'Calle, número y barrio' : 'Si lo dejás vacío, lo coordinamos juntos'"
                    class="w-full rounded-xl border border-bordo/20 bg-white px-3.5 py-2.5"
                  />
                </label>

                <fieldset>
                  <legend class="mb-2 text-sm font-bold text-cacao/80">¿Cómo pagás? *</legend>
                  <div class="grid grid-cols-2 gap-3">
                    <label
                      class="cursor-pointer rounded-xl border-2 p-3 text-center text-sm font-bold transition-colors"
                      [class]="pago === 'transferencia' ? 'border-bordo bg-bordo text-crema' : 'border-bordo/20'"
                    >
                      <input type="radio" name="pago" value="transferencia" [(ngModel)]="pago" class="sr-only" />
                      💳 Transferencia
                    </label>
                    <label
                      class="cursor-pointer rounded-xl border-2 p-3 text-center text-sm font-bold transition-colors"
                      [class]="pago === 'efectivo' ? 'border-bordo bg-bordo text-crema' : 'border-bordo/20'"
                    >
                      <input type="radio" name="pago" value="efectivo" [(ngModel)]="pago" class="sr-only" />
                      💵 Efectivo
                    </label>
                  </div>
                </fieldset>

                <!-- El día de entrega no se pide: se coordina al confirmar -->
                <div class="flex items-start gap-3 rounded-2xl border border-dorado/50 bg-dorado/10 p-4">
                  <span class="text-2xl" aria-hidden="true">🗓️</span>
                  <p class="text-sm leading-relaxed text-cacao/80">
                    <span class="font-script text-base text-bordo">¿Y el día de entrega?</span><br />
                    Cuando confirmemos tu pedido coordinamos juntos el día y la hora que mejor te quede.
                    Horneamos todo fresquito, por encargo 💛
                  </p>
                </div>

                <label class="block text-sm">
                  <span class="mb-1 block font-bold text-cacao/80">¿Tenés alguna preferencia? Contanos</span>
                  <textarea
                    name="preferencias"
                    [(ngModel)]="preferencias"
                    rows="3"
                    placeholder="Sin frutos secos, dedicatoria en la torta, sabor favorito…"
                    class="w-full rounded-xl border border-bordo/20 bg-white px-3.5 py-2.5"
                  ></textarea>
                </label>

                @if (error()) {
                  <p class="rounded-xl bg-bordo/10 p-3 text-sm text-bordo" role="alert">{{ error() }}</p>
                }
              </form>
            }

            <!-- Paso 3: confirmación -->
            @case ('listo') {
              <div class="py-8 text-center">
                <span class="text-5xl" aria-hidden="true">🎂</span>
                <h3 class="mt-4 text-2xl text-bordo">¡Gracias, {{ nombre }}!</h3>
                <p class="mx-auto mt-3 max-w-xs text-cacao/70">
                  Recibimos tu pedido y te enviamos el resumen a
                  <strong class="text-cacao">{{ email }}</strong
                  >. En breve nos ponemos en contacto para confirmar todo y coordinar juntos el día de entrega.
                </p>
              </div>
            }
          }
        </div>

        <!-- Pie con total y acción principal -->
        <footer class="border-t border-bordo/10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          @switch (paso()) {
            @case ('carrito') {
              @if (carrito.items().length > 0) {
                <div class="mb-3 flex items-center justify-between">
                  <span class="text-sm text-cacao/70">Total estimado</span>
                  <span class="font-display text-xl font-bold text-bordo">
                    {{ carrito.total() | currency: 'UYU' : '$ ' : '1.0-0' }}
                  </span>
                </div>
                <button
                  type="button"
                  (click)="paso.set('datos')"
                  class="w-full rounded-full bg-bordo py-3.5 font-bold text-crema transition-transform duration-300 hover:-translate-y-0.5 hover:bg-bordo-dark"
                >
                  Completar mi pedido
                </button>
              } @else {
                <button
                  type="button"
                  (click)="cerrar()"
                  class="w-full rounded-full border-2 border-bordo py-3 font-bold text-bordo"
                >
                  Ver la vitrina
                </button>
              }
            }
            @case ('datos') {
              <div class="mb-3 flex items-center justify-between">
                <button type="button" (click)="paso.set('carrito')" class="text-sm text-bordo underline">
                  ← Volver al carrito
                </button>
                <span class="font-display text-xl font-bold text-bordo">
                  {{ carrito.total() | currency: 'UYU' : '$ ' : '1.0-0' }}
                </span>
              </div>
              <button
                type="submit"
                form="form-checkout"
                [disabled]="enviando()"
                class="w-full rounded-full bg-bordo py-3.5 font-bold text-crema transition-transform duration-300 hover:-translate-y-0.5 hover:bg-bordo-dark disabled:opacity-60"
              >
                {{ enviando() ? 'Enviando…' : 'Confirmar pedido' }}
              </button>
            }
            @case ('listo') {
              <button
                type="button"
                (click)="cerrar()"
                class="w-full rounded-full bg-dorado py-3.5 font-bold text-cacao transition-transform duration-300 hover:-translate-y-0.5"
              >
                ¡Listo!
              </button>
            }
          }
        </footer>
      </aside>
    }
  `,
})
export class CartComponent {
  readonly carrito = inject(CartService);
  private readonly pedidos = inject(OrdersService);

  readonly paso = signal<Paso>('carrito');
  readonly enviando = signal(false);
  readonly error = signal<string | null>(null);

  nombre = '';
  apellido = '';
  email = '';
  telefono = '';
  entrega: TipoEntrega = 'envio';
  direccion = '';
  pago: TipoPago = 'transferencia';
  preferencias = '';

  cerrar(): void {
    this.carrito.cerrar();
    // Tras un pedido exitoso el próximo uso arranca limpio.
    if (this.paso() === 'listo') {
      this.paso.set('carrito');
    }
  }

  async confirmar(): Promise<void> {
    const faltante = this.validar();
    if (faltante) {
      this.error.set(faltante);
      return;
    }

    this.error.set(null);
    this.enviando.set(true);
    const error = await this.pedidos.enviarPedidoCarrito(
      {
        nombre: this.nombre.trim(),
        apellido: this.apellido.trim(),
        email: this.email.trim(),
        telefono: this.telefono.trim(),
        entrega: this.entrega,
        direccion: this.direccion.trim(),
        pago: this.pago,
        preferencias: this.preferencias.trim(),
      },
      this.carrito.items(),
    );
    this.enviando.set(false);

    if (error) {
      this.error.set('No pudimos registrar tu pedido. Probá de nuevo en unos minutos o escribinos por WhatsApp.');
      return;
    }

    this.carrito.vaciar();
    this.paso.set('listo');
  }

  private validar(): string | null {
    if (!this.nombre.trim() || !this.apellido.trim()) return 'Completá tu nombre y apellido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) return 'Ingresá un correo válido.';
    if (!this.telefono.trim()) return 'Completá tu teléfono.';
    if (this.entrega === 'envio' && !this.direccion.trim()) return 'Completá la dirección de entrega.';
    return null;
  }
}
