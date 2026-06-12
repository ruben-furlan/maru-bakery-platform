import { computed, Injectable, signal } from '@angular/core';
import { ItemCarrito, Producto } from './models';

const STORAGE_KEY = 'maru-carrito';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<ItemCarrito[]>(this.leerDeStorage());
  readonly abierto = signal(false);

  readonly cantidadTotal = computed(() => this.items().reduce((suma, item) => suma + item.cantidad, 0));
  readonly total = computed(() =>
    this.items().reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0),
  );

  agregar(producto: Producto): void {
    this.items.update((items) => {
      const existente = items.find((i) => i.producto.id === producto.id);
      if (existente) {
        return items.map((i) => (i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i));
      }
      return [...items, { producto, cantidad: 1 }];
    });
    this.guardarEnStorage();
  }

  cambiarCantidad(productoId: string, delta: number): void {
    this.items.update((items) =>
      items
        .map((i) => (i.producto.id === productoId ? { ...i, cantidad: i.cantidad + delta } : i))
        .filter((i) => i.cantidad > 0),
    );
    this.guardarEnStorage();
  }

  quitar(productoId: string): void {
    this.items.update((items) => items.filter((i) => i.producto.id !== productoId));
    this.guardarEnStorage();
  }

  vaciar(): void {
    this.items.set([]);
    this.guardarEnStorage();
  }

  abrir(): void {
    this.abierto.set(true);
  }

  cerrar(): void {
    this.abierto.set(false);
  }

  /** El carrito sobrevive recargas de página gracias a localStorage. */
  private leerDeStorage(): ItemCarrito[] {
    try {
      const crudo = localStorage.getItem(STORAGE_KEY);
      return crudo ? (JSON.parse(crudo) as ItemCarrito[]) : [];
    } catch {
      return [];
    }
  }

  private guardarEnStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
    } catch {
      // Sin storage disponible: el carrito vive solo en memoria.
    }
  }
}
