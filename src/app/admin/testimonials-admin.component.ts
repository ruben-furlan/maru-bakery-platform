import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestimonialsService } from '../core/testimonials.service';

@Component({
  selector: 'app-testimonials-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h1 class="text-2xl text-bordo">Testimonios</h1>
    <p class="mt-1 text-sm text-cacao/60">
      Comentarios de clientes que se muestran en la landing. Solo los marcados como visibles aparecen en el sitio.
    </p>

    @if (mensaje(); as msg) {
      <p class="mt-4 rounded-xl bg-dorado/20 p-3 text-sm text-cacao" role="status">{{ msg }}</p>
    }
    @if (error(); as err) {
      <p class="mt-4 rounded-xl bg-bordo/10 p-3 text-sm text-bordo" role="alert">{{ err }}</p>
    }

    <!-- Alta de testimonio -->
    <form class="mt-6 max-w-2xl space-y-4 rounded-vitrina bg-white p-5 shadow-bordo sm:p-6" (ngSubmit)="crear()">
      <h2 class="text-lg text-bordo">Agregar testimonio</h2>
      <div class="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label class="block">
          <span class="mb-1 block text-sm font-bold">Nombre del cliente</span>
          <input type="text" name="nombre" [(ngModel)]="nombre" required class="w-full rounded-xl border border-cacao/20 px-4 py-2.5" />
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-bold">Estrellas</span>
          <select name="estrellas" [(ngModel)]="estrellas" class="w-full rounded-xl border border-cacao/20 px-4 py-2.5 sm:w-auto">
            @for (n of [5, 4, 3, 2, 1]; track n) {
              <option [value]="n">{{ '★'.repeat(n) }}</option>
            }
          </select>
        </label>
      </div>
      <label class="block">
        <span class="mb-1 block text-sm font-bold">Comentario</span>
        <textarea
          name="comentario"
          [(ngModel)]="comentario"
          required
          rows="3"
          placeholder="Lo que dijo el cliente sobre su pedido…"
          class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"
        ></textarea>
      </label>
      <button
        type="submit"
        [disabled]="guardando()"
        class="w-full rounded-full bg-bordo px-6 py-2.5 font-bold text-crema transition-colors hover:bg-bordo-dark disabled:opacity-60 sm:w-auto"
      >
        {{ guardando() ? 'Guardando…' : 'Agregar testimonio' }}
      </button>
    </form>

    <!-- Listado -->
    <ul class="mt-8 max-w-2xl space-y-3">
      @for (testimonio of servicio.testimonios(); track testimonio.id) {
        <li class="rounded-vitrina bg-white p-4 shadow-bordo sm:p-5" [class.opacity-60]="!testimonio.visible">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-display font-bold text-bordo">{{ testimonio.nombre }}</p>
            <span class="text-sm text-dorado">{{ '★'.repeat(testimonio.estrellas) }}</span>
          </div>
          <p class="mt-2 text-sm text-cacao/80">{{ testimonio.comentario }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              (click)="alternarVisible(testimonio.id, !testimonio.visible)"
              class="grow rounded-full border border-bordo px-4 py-2 text-sm font-bold text-bordo transition-colors hover:bg-bordo hover:text-crema sm:grow-0 sm:py-1.5"
            >
              {{ testimonio.visible ? 'Ocultar de la landing' : 'Mostrar en la landing' }}
            </button>
            <button
              type="button"
              (click)="eliminar(testimonio.id)"
              class="grow rounded-full border border-cacao/30 px-4 py-2 text-sm font-bold text-cacao/70 transition-colors hover:border-bordo hover:text-bordo sm:grow-0 sm:py-1.5"
            >
              Eliminar
            </button>
          </div>
        </li>
      } @empty {
        @if (!servicio.cargando()) {
          <li class="rounded-vitrina bg-white p-6 text-center text-cacao/60 shadow-bordo">Todavía no hay testimonios cargados.</li>
        }
      }
    </ul>
  `,
})
export class TestimonialsAdminComponent {
  readonly servicio = inject(TestimonialsService);

  nombre = '';
  comentario = '';
  estrellas = 5;

  readonly guardando = signal(false);
  readonly mensaje = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  async crear(): Promise<void> {
    if (!this.nombre.trim() || !this.comentario.trim()) {
      this.error.set('Completá el nombre y el comentario.');
      return;
    }

    this.limpiarAvisos();
    this.guardando.set(true);
    const error = await this.servicio.crear({
      nombre: this.nombre.trim(),
      comentario: this.comentario.trim(),
      estrellas: Number(this.estrellas),
      visible: true,
    });
    this.guardando.set(false);

    if (error) {
      this.error.set(error);
    } else {
      this.mensaje.set('Testimonio agregado ✔ Ya se ve en la landing.');
      this.nombre = '';
      this.comentario = '';
      this.estrellas = 5;
    }
  }

  async alternarVisible(id: string, visible: boolean): Promise<void> {
    this.limpiarAvisos();
    const error = await this.servicio.actualizar(id, { visible });
    if (error) this.error.set(error);
  }

  async eliminar(id: string): Promise<void> {
    this.limpiarAvisos();
    const error = await this.servicio.eliminar(id);
    if (error) this.error.set(error);
  }

  private limpiarAvisos(): void {
    this.mensaje.set(null);
    this.error.set(null);
  }
}
