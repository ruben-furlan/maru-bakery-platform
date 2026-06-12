import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CATEGORIAS, Producto } from '../core/models';
import { ProductsService } from '../core/products.service';

interface FormularioProducto {
  nombre: string;
  descripcion: string;
  precio: number | null;
  categoria: string;
  imagen_url: string;
  disponible: boolean;
}

const FORMULARIO_VACIO: FormularioProducto = {
  nombre: '',
  descripcion: '',
  precio: null,
  categoria: CATEGORIAS[0],
  imagen_url: '',
  disponible: true,
};

@Component({
  selector: 'app-products-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1 class="text-2xl text-bordo">Productos</h1>
    <p class="mt-1 text-sm text-cacao/60">Lo que cargues acá aparece directo en la vitrina de la landing.</p>

    @if (mensaje(); as msg) {
      <p class="mt-4 rounded-xl bg-dorado/20 p-3 text-sm text-cacao" role="status">{{ msg }}</p>
    }

    <div class="mt-6 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      <!-- Formulario alta / edición -->
      <form #formulario class="h-fit scroll-mt-10 space-y-4 rounded-vitrina bg-white p-5 shadow-bordo sm:p-6 md:scroll-mt-0" (ngSubmit)="guardar()">
        <h2 class="text-lg text-bordo">{{ editandoId() ? 'Editar producto' : 'Nuevo producto' }}</h2>

        <label class="block">
          <span class="mb-1 block text-sm font-bold">Nombre</span>
          <input type="text" name="nombre" [(ngModel)]="form.nombre" required class="w-full rounded-xl border border-cacao/20 px-4 py-2.5" />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-bold">Descripción</span>
          <textarea name="descripcion" [(ngModel)]="form.descripcion" rows="3" required class="w-full rounded-xl border border-cacao/20 px-4 py-2.5"></textarea>
        </label>

        <div class="grid grid-cols-2 gap-4">
          <label class="block">
            <span class="mb-1 block text-sm font-bold">Precio ($U)</span>
            <input type="number" name="precio" [(ngModel)]="form.precio" min="0" required class="w-full rounded-xl border border-cacao/20 px-4 py-2.5" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold">Categoría</span>
            <select name="categoria" [(ngModel)]="form.categoria" class="w-full rounded-xl border border-cacao/20 px-4 py-2.5">
              @for (cat of categorias; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </label>
        </div>

        <label class="block">
          <span class="mb-1 block text-sm font-bold">Foto</span>
          <input type="file" accept="image/*" (change)="seleccionarImagen($event)" class="w-full text-sm" />
          @if (form.imagen_url) {
            <img [src]="form.imagen_url" alt="Vista previa del producto" class="mt-2 h-24 w-24 rounded-xl object-cover" />
          }
        </label>

        <label class="flex items-center gap-2">
          <input type="checkbox" name="disponible" [(ngModel)]="form.disponible" class="h-4 w-4 accent-bordo" />
          <span class="text-sm font-bold">Disponible en la vitrina</span>
        </label>

        @if (error()) {
          <p class="rounded-xl bg-bordo/10 p-3 text-sm text-bordo" role="alert">{{ error() }}</p>
        }

        <div class="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            [disabled]="guardando()"
            class="rounded-full bg-bordo px-6 py-2.5 font-bold text-crema transition-colors hover:bg-bordo-dark disabled:opacity-60"
          >
            {{ guardando() ? 'Guardando…' : editandoId() ? 'Guardar cambios' : 'Crear producto' }}
          </button>
          @if (editandoId()) {
            <button type="button" (click)="cancelarEdicion()" class="rounded-full border border-cacao/30 px-6 py-2.5 font-bold">
              Cancelar
            </button>
          }
        </div>
      </form>

      <!-- Listado -->
      <ul class="space-y-3">
        @for (producto of productos.productos(); track producto.id) {
          <li class="flex flex-wrap items-center gap-3 rounded-vitrina bg-white p-4 shadow-bordo sm:gap-4">
            <img [src]="producto.imagen_url" [alt]="producto.nombre" class="h-16 w-16 shrink-0 rounded-xl object-cover" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-display font-bold text-bordo">
                {{ producto.nombre }}
                @if (producto.destacado) {
                  <span class="ml-1" title="Producto de la semana">⭐</span>
                }
              </p>
              <p class="text-sm text-cacao/60">
                {{ producto.categoria }} · {{ producto.precio | currency: 'UYU' : '$ ' : '1.0-0' }} ·
                {{ producto.disponible ? 'Disponible' : 'No disponible' }}
              </p>
            </div>
            <div class="flex w-full shrink-0 gap-2 sm:w-auto">
              <button
                type="button"
                (click)="editar(producto)"
                class="flex-1 rounded-full border border-cacao/30 px-4 py-2 text-sm font-bold sm:flex-none sm:py-1.5"
              >
                Editar
              </button>
              <button
                type="button"
                (click)="eliminar(producto)"
                class="flex-1 rounded-full border border-bordo/40 px-4 py-2 text-sm font-bold text-bordo sm:flex-none sm:py-1.5"
              >
                Eliminar
              </button>
            </div>
          </li>
        } @empty {
          <li class="rounded-vitrina bg-white p-6 text-center text-cacao/60 shadow-bordo">Todavía no hay productos cargados.</li>
        }
      </ul>
    </div>
  `,
})
export class ProductsAdminComponent {
  readonly productos = inject(ProductsService);
  readonly categorias = CATEGORIAS;

  form: FormularioProducto = { ...FORMULARIO_VACIO };
  private archivoImagen: File | null = null;

  private readonly formulario = viewChild.required<ElementRef<HTMLFormElement>>('formulario');

  readonly editandoId = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly mensaje = signal<string | null>(null);

  seleccionarImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.archivoImagen = input.files?.[0] ?? null;
    if (this.archivoImagen) {
      this.form.imagen_url = URL.createObjectURL(this.archivoImagen);
    }
  }

  editar(producto: Producto): void {
    this.editandoId.set(producto.id);
    this.archivoImagen = null;
    this.form = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria,
      imagen_url: producto.imagen_url,
      disponible: producto.disponible,
    };
    this.mensaje.set(null);
    // En mobile el formulario queda arriba del listado, fuera de la vista
    this.formulario().nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.archivoImagen = null;
    this.form = { ...FORMULARIO_VACIO };
    this.error.set(null);
  }

  async guardar(): Promise<void> {
    if (!this.form.nombre.trim() || this.form.precio === null) {
      this.error.set('Completá al menos el nombre y el precio.');
      return;
    }

    this.error.set(null);
    this.mensaje.set(null);
    this.guardando.set(true);

    let imagenUrl = this.form.imagen_url;
    if (this.archivoImagen) {
      const subida = await this.productos.subirImagen(this.archivoImagen);
      if (subida.error) {
        this.error.set(`No se pudo subir la foto: ${subida.error}`);
        this.guardando.set(false);
        return;
      }
      imagenUrl = subida.url!;
    }

    const datos = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion.trim(),
      precio: this.form.precio,
      categoria: this.form.categoria,
      imagen_url: imagenUrl,
      disponible: this.form.disponible,
    };

    const id = this.editandoId();
    const error = id
      ? await this.productos.actualizar(id, datos)
      : await this.productos.crear({ ...datos, destacado: false });
    this.guardando.set(false);

    if (error) {
      this.error.set(error);
    } else {
      this.mensaje.set(id ? 'Producto actualizado ✔' : 'Producto creado ✔');
      this.cancelarEdicion();
    }
  }

  async eliminar(producto: Producto): Promise<void> {
    if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;

    const error = await this.productos.eliminar(producto.id);
    this.mensaje.set(error ? null : 'Producto eliminado ✔');
    this.error.set(error);
  }
}
