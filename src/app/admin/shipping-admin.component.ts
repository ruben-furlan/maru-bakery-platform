import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PuntoEntrega, ZonaEnvio } from '../core/models';
import { MeetingPointsService } from '../core/meeting-points.service';
import { ShippingZonesService } from '../core/shipping-zones.service';

@Component({
  selector: 'app-shipping-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1 class="text-2xl text-bordo">Envíos y entregas</h1>
    <p class="mt-1 text-sm text-cacao/60">
      Zonas de Montevideo donde hacés envíos (con su costo aproximado) y puntos de encuentro donde
      entregás pedidos. El cliente los elige en el carrito; lo oculto no se muestra.
    </p>

    @if (mensaje(); as msg) {
      <p class="mt-4 rounded-xl bg-dorado/20 p-3 text-sm text-cacao" role="status">{{ msg }}</p>
    }
    @if (error(); as err) {
      <p class="mt-4 rounded-xl bg-bordo/10 p-3 text-sm text-bordo" role="alert">{{ err }}</p>
    }

    <h2 class="mt-8 text-xl text-bordo"><span aria-hidden="true">🛵</span> Zonas de envío</h2>

    <!-- Alta / edición de zona -->
    <form
      class="mt-4 max-w-2xl space-y-4 rounded-vitrina bg-white p-5 shadow-bordo sm:p-6"
      (ngSubmit)="guardar()"
    >
      <h3 class="text-lg text-bordo">
        {{ editando() ? 'Editar zona' : 'Agregar zona' }}
      </h3>
      <div class="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label class="block">
          <span class="mb-1 block text-sm font-bold">Zona (barrios que abarca)</span>
          <input
            type="text"
            name="nombre"
            [(ngModel)]="nombre"
            required
            placeholder="Pocitos, Punta Carretas y Parque Rodó"
            class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
          />
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-bold">Costo ($)</span>
          <input
            type="number"
            name="costo"
            [(ngModel)]="costo"
            required
            min="0"
            step="10"
            inputmode="numeric"
            class="w-full rounded-xl border border-cacao/20 px-4 py-2.5 sm:w-32"
          />
        </label>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="submit"
          [disabled]="guardando()"
          class="grow rounded-full bg-bordo px-6 py-2.5 font-bold text-crema transition-colors hover:bg-bordo-dark disabled:opacity-60 sm:grow-0"
        >
          {{ guardando() ? 'Guardando…' : editando() ? 'Guardar cambios' : 'Agregar zona' }}
        </button>
        @if (editando()) {
          <button
            type="button"
            (click)="cancelarEdicion()"
            class="grow rounded-full border border-cacao/30 px-6 py-2.5 font-bold text-cacao/70 transition-colors hover:border-bordo hover:text-bordo sm:grow-0"
          >
            Cancelar
          </button>
        }
      </div>
    </form>

    <!-- Listado -->
    <ul class="mt-8 max-w-2xl space-y-3">
      @for (zona of servicio.zonas(); track zona.id) {
        <li
          class="rounded-vitrina bg-white p-4 shadow-bordo sm:p-5"
          [class.opacity-60]="!zona.activa"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-display font-bold text-bordo">{{ zona.nombre }}</p>
            <span class="font-display font-bold text-cacao">
              {{ zona.costo | currency: 'UYU' : '$ ' : '1.0-0' }}
            </span>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              (click)="editar(zona)"
              class="grow rounded-full border border-bordo px-4 py-2 text-sm font-bold text-bordo transition-colors hover:bg-bordo hover:text-crema sm:grow-0 sm:py-1.5"
            >
              Editar
            </button>
            <button
              type="button"
              (click)="alternarActiva(zona.id, !zona.activa)"
              class="grow rounded-full border border-bordo px-4 py-2 text-sm font-bold text-bordo transition-colors hover:bg-bordo hover:text-crema sm:grow-0 sm:py-1.5"
            >
              {{ zona.activa ? 'Ocultar del carrito' : 'Mostrar en el carrito' }}
            </button>
            <button
              type="button"
              (click)="eliminar(zona.id)"
              class="grow rounded-full border border-cacao/30 px-4 py-2 text-sm font-bold text-cacao/70 transition-colors hover:border-bordo hover:text-bordo sm:grow-0 sm:py-1.5"
            >
              Eliminar
            </button>
          </div>
        </li>
      } @empty {
        @if (!servicio.cargando()) {
          <li class="rounded-vitrina bg-white p-6 text-center text-cacao/60 shadow-bordo">
            Todavía no hay zonas cargadas. Mientras no haya zonas, el carrito no pide la zona ni
            suma costo de envío.
          </li>
        }
      }
    </ul>

    <h2 class="mt-10 text-xl text-bordo"><span aria-hidden="true">📍</span> Puntos de entrega</h2>
    <p class="mt-1 max-w-2xl text-sm text-cacao/60">
      Puntos de encuentro donde entregás pedidos. Si hay varios visibles, el cliente elige uno en el
      carrito; si hay uno solo, lo ve fijo sin elegir; si no hay ninguno, escribe el punto a mano
      como antes.
    </p>

    @if (mensajePunto(); as msg) {
      <p class="mt-4 max-w-2xl rounded-xl bg-dorado/20 p-3 text-sm text-cacao" role="status">
        {{ msg }}
      </p>
    }
    @if (errorPunto(); as err) {
      <p class="mt-4 max-w-2xl rounded-xl bg-bordo/10 p-3 text-sm text-bordo" role="alert">
        {{ err }}
      </p>
    }

    <!-- Alta / edición de punto de entrega -->
    <form
      class="mt-4 max-w-2xl space-y-4 rounded-vitrina bg-white p-5 shadow-bordo sm:p-6"
      (ngSubmit)="guardarPunto()"
    >
      <h3 class="text-lg text-bordo">
        {{ editandoPunto() ? 'Editar punto' : 'Agregar punto' }}
      </h3>
      <label class="block">
        <span class="mb-1 block text-sm font-bold">Punto de entrega (lugar y referencia)</span>
        <input
          type="text"
          name="puntoNombre"
          [(ngModel)]="puntoNombre"
          required
          placeholder="Tres Cruces, explanada de la terminal"
          class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
        />
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          type="submit"
          [disabled]="guardandoPunto()"
          class="grow rounded-full bg-bordo px-6 py-2.5 font-bold text-crema transition-colors hover:bg-bordo-dark disabled:opacity-60 sm:grow-0"
        >
          {{
            guardandoPunto() ? 'Guardando…' : editandoPunto() ? 'Guardar cambios' : 'Agregar punto'
          }}
        </button>
        @if (editandoPunto()) {
          <button
            type="button"
            (click)="cancelarEdicionPunto()"
            class="grow rounded-full border border-cacao/30 px-6 py-2.5 font-bold text-cacao/70 transition-colors hover:border-bordo hover:text-bordo sm:grow-0"
          >
            Cancelar
          </button>
        }
      </div>
    </form>

    <!-- Listado de puntos -->
    <ul class="mt-6 max-w-2xl space-y-3">
      @for (punto of puntosServicio.puntos(); track punto.id) {
        <li
          class="rounded-vitrina bg-white p-4 shadow-bordo sm:p-5"
          [class.opacity-60]="!punto.activo"
        >
          <p class="font-display font-bold text-bordo">
            <span aria-hidden="true">📍</span> {{ punto.nombre }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              (click)="editarPunto(punto)"
              class="grow rounded-full border border-bordo px-4 py-2 text-sm font-bold text-bordo transition-colors hover:bg-bordo hover:text-crema sm:grow-0 sm:py-1.5"
            >
              Editar
            </button>
            <button
              type="button"
              (click)="alternarActivoPunto(punto.id, !punto.activo)"
              class="grow rounded-full border border-bordo px-4 py-2 text-sm font-bold text-bordo transition-colors hover:bg-bordo hover:text-crema sm:grow-0 sm:py-1.5"
            >
              {{ punto.activo ? 'Ocultar del carrito' : 'Mostrar en el carrito' }}
            </button>
            <button
              type="button"
              (click)="eliminarPunto(punto.id)"
              class="grow rounded-full border border-cacao/30 px-4 py-2 text-sm font-bold text-cacao/70 transition-colors hover:border-bordo hover:text-bordo sm:grow-0 sm:py-1.5"
            >
              Eliminar
            </button>
          </div>
        </li>
      } @empty {
        @if (!puntosServicio.cargando()) {
          <li class="rounded-vitrina bg-white p-6 text-center text-cacao/60 shadow-bordo">
            Todavía no hay puntos cargados. Mientras no haya puntos, el cliente escribe a mano el
            punto de encuentro que le quede cómodo.
          </li>
        }
      }
    </ul>
  `,
})
export class ShippingAdminComponent {
  readonly servicio = inject(ShippingZonesService);
  readonly puntosServicio = inject(MeetingPointsService);

  nombre = '';
  costo: number | null = null;
  puntoNombre = '';

  readonly editando = signal<ZonaEnvio | null>(null);
  readonly guardando = signal(false);
  readonly editandoPunto = signal<PuntoEntrega | null>(null);
  readonly guardandoPunto = signal(false);
  readonly mensaje = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  // Avisos propios de la sección de puntos: se muestran junto a su
  // formulario, que en mobile queda lejos de los avisos de arriba.
  readonly mensajePunto = signal<string | null>(null);
  readonly errorPunto = signal<string | null>(null);

  async guardar(): Promise<void> {
    const costo = Number(this.costo);
    if (!this.nombre.trim() || this.costo == null || Number.isNaN(costo) || costo < 0) {
      this.error.set('Completá la zona y un costo válido.');
      return;
    }

    this.limpiarAvisos();
    this.guardando.set(true);
    const enEdicion = this.editando();
    const error = enEdicion
      ? await this.servicio.actualizar(enEdicion.id, { nombre: this.nombre.trim(), costo })
      : await this.servicio.crear({
          nombre: this.nombre.trim(),
          costo,
          activa: true,
          orden: Math.max(0, ...this.servicio.zonas().map((z) => z.orden)) + 1,
        });
    this.guardando.set(false);

    if (error) {
      this.error.set(error);
    } else {
      this.mensaje.set(
        enEdicion ? 'Zona actualizada ✔' : 'Zona agregada ✔ Ya aparece en el carrito.',
      );
      this.cancelarEdicion();
    }
  }

  editar(zona: ZonaEnvio): void {
    this.limpiarAvisos();
    this.editando.set(zona);
    this.nombre = zona.nombre;
    this.costo = zona.costo;
  }

  cancelarEdicion(): void {
    this.editando.set(null);
    this.nombre = '';
    this.costo = null;
  }

  async alternarActiva(id: string, activa: boolean): Promise<void> {
    this.limpiarAvisos();
    const error = await this.servicio.actualizar(id, { activa });
    if (error) this.error.set(error);
  }

  async eliminar(id: string): Promise<void> {
    if (!confirm('¿Eliminar esta zona? Los pedidos ya recibidos no se modifican.')) return;
    this.limpiarAvisos();
    const error = await this.servicio.eliminar(id);
    if (error) this.error.set(error);
  }

  async guardarPunto(): Promise<void> {
    if (!this.puntoNombre.trim()) {
      this.errorPunto.set('Completá el punto de entrega.');
      return;
    }

    this.limpiarAvisos();
    this.guardandoPunto.set(true);
    const enEdicion = this.editandoPunto();
    const error = enEdicion
      ? await this.puntosServicio.actualizar(enEdicion.id, { nombre: this.puntoNombre.trim() })
      : await this.puntosServicio.crear({
          nombre: this.puntoNombre.trim(),
          activo: true,
          orden: Math.max(0, ...this.puntosServicio.puntos().map((p) => p.orden)) + 1,
        });
    this.guardandoPunto.set(false);

    if (error) {
      this.errorPunto.set(error);
    } else {
      this.mensajePunto.set(
        enEdicion ? 'Punto actualizado ✔' : 'Punto agregado ✔ Ya aparece en el carrito.',
      );
      this.cancelarEdicionPunto();
    }
  }

  editarPunto(punto: PuntoEntrega): void {
    this.limpiarAvisos();
    this.editandoPunto.set(punto);
    this.puntoNombre = punto.nombre;
  }

  cancelarEdicionPunto(): void {
    this.editandoPunto.set(null);
    this.puntoNombre = '';
  }

  async alternarActivoPunto(id: string, activo: boolean): Promise<void> {
    this.limpiarAvisos();
    const error = await this.puntosServicio.actualizar(id, { activo });
    if (error) this.errorPunto.set(error);
  }

  async eliminarPunto(id: string): Promise<void> {
    if (!confirm('¿Eliminar este punto? Los pedidos ya recibidos no se modifican.')) return;
    this.limpiarAvisos();
    const error = await this.puntosServicio.eliminar(id);
    if (error) this.errorPunto.set(error);
  }

  private limpiarAvisos(): void {
    this.mensaje.set(null);
    this.error.set(null);
    this.mensajePunto.set(null);
    this.errorPunto.set(null);
  }
}
