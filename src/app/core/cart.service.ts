import { computed, Injectable, signal } from '@angular/core';
import { ItemCarrito, Producto } from './models';

const STORAGE_KEY = 'maru-carrito';

/** Máximo de unidades por producto en un mismo pedido. */
export const MAX_POR_PRODUCTO = 5;

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<ItemCarrito[]>(this.leerDeStorage());
  readonly abierto = signal(false);

  readonly cantidadTotal = computed(() => this.items().reduce((suma, item) => suma + item.cantidad, 0));
  readonly total = computed(() =>
    this.items().reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0),
  );

  /** Unidades de un producto que ya están en el carrito. */
  cantidadDe(productoId: string): number {
    return this.items().find((i) => i.producto.id === productoId)?.cantidad ?? 0;
  }

  /** Agrega una unidad. Devuelve false si el producto ya está en el máximo. */
  agregar(producto: Producto): boolean {
    if (this.cantidadDe(producto.id) >= MAX_POR_PRODUCTO) return false;
    this.items.update((items) => {
      const existente = items.find((i) => i.producto.id === producto.id);
      if (existente) {
        return items.map((i) => (i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i));
      }
      return [...items, { producto, cantidad: 1 }];
    });
    this.guardarEnStorage();
    return true;
  }

  cambiarCantidad(productoId: string, delta: number): void {
    this.items.update((items) =>
      items
        .map((i) =>
          i.producto.id === productoId
            ? { ...i, cantidad: Math.min(MAX_POR_PRODUCTO, i.cantidad + delta) }
            : i,
        )
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
      const items = crudo ? (JSON.parse(crudo) as ItemCarrito[]) : [];
      // Carritos guardados antes del límite podrían traer cantidades mayores
      return items.map((i) => ({ ...i, cantidad: Math.min(MAX_POR_PRODUCTO, i.cantidad) }));
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
