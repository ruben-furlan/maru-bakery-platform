import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrdersService } from '../core/orders.service';

@Component({
  selector: 'app-orders-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <h1 class="text-2xl text-bordo">Pedidos</h1>
    <p class="mt-1 text-sm text-cacao/60">Pedidos del carrito y consultas recibidas desde la landing.</p>

    @if (pedidos.cargando()) {
      <p class="mt-6 text-cacao/60">Cargando…</p>
    }

    @if (error(); as err) {
      <p class="mt-4 rounded-xl bg-bordo/10 p-3 text-sm text-bordo" role="alert">{{ err }}</p>
    }

    <ul class="mt-6 space-y-3">
      @for (pedido of pedidos.pedidos(); track pedido.id) {
        <li class="rounded-vitrina bg-white p-5 shadow-bordo">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-display font-bold text-bordo">
              {{ pedido.nombre }} {{ pedido.apellido ?? '' }}
              @if (!pedido.items) {
                <span class="ml-1 rounded-full bg-cacao/10 px-2 py-0.5 text-xs font-normal text-cacao/60">Consulta</span>
              }
            </p>
            <div class="flex items-center gap-3">
              @if (pedido.creado_en) {
                <span class="text-xs text-cacao/50">{{ pedido.creado_en | date: "dd/MM/yyyy HH:mm" }}</span>
              }
              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                [class.bg-dorado]="pedido.estado === 'pendiente'"
                [class.text-cacao]="pedido.estado === 'pendiente'"
                [class.bg-bordo]="pedido.estado !== 'pendiente'"
                [class.text-crema]="pedido.estado !== 'pendiente'"
              >
                {{ pedido.estado === 'pendiente' ? 'Pendiente' : 'Atendido' }}
              </span>
            </div>
          </div>

          @if (pedido.items; as items) {
            <!-- Pedido del carrito -->
            <ul class="mt-3 space-y-1 rounded-2xl bg-crema/40 p-3 text-sm">
              @for (item of items; track item.nombre) {
                <li class="flex justify-between gap-3">
                  <span>{{ item.nombre }} × {{ item.cantidad }}</span>
                  <span class="font-bold">{{ item.precio * item.cantidad | currency: 'UYU' : '$ ' : '1.0-0' }}</span>
                </li>
              }
              @if (pedido.total != null) {
                <li class="flex justify-between gap-3 border-t border-bordo/10 pt-1 font-bold text-bordo">
                  <span>Total</span>
                  <span>{{ pedido.total | currency: 'UYU' : '$ ' : '1.0-0' }}</span>
                </li>
              }
            </ul>
            <dl class="mt-3 grid gap-x-6 gap-y-1 text-sm text-cacao/80 sm:grid-cols-2">
              <div><dt class="inline font-bold">Email:</dt> <dd class="inline">{{ pedido.email }}</dd></div>
              <div><dt class="inline font-bold">Teléfono:</dt> <dd class="inline">{{ pedido.telefono }}</dd></div>
              <div>
                <dt class="inline font-bold">Entrega:</dt>
                <dd class="inline">{{ pedido.entrega === 'envio' ? 'Envío' : 'Punto de encuentro' }}</dd>
              </div>
              <div>
                <dt class="inline font-bold">Pago:</dt>
                <dd class="inline">{{ pedido.pago === 'transferencia' ? 'Transferencia' : 'Efectivo' }}</dd>
              </div>
              @if (pedido.direccion) {
                <div class="sm:col-span-2"><dt class="inline font-bold">Dirección / punto:</dt> <dd class="inline">{{ pedido.direccion }}</dd></div>
              }
              @if (pedido.fecha_entrega) {
                <div>
                  <dt class="inline font-bold">Día de entrega:</dt>
                  <dd class="inline">{{ pedido.fecha_entrega | date: "dd/MM/yyyy" }}</dd>
                </div>
              }
              @if (pedido.preferencias) {
                <div class="sm:col-span-2"><dt class="inline font-bold">Preferencias:</dt> <dd class="inline">{{ pedido.preferencias }}</dd></div>
              }
            </dl>
          } @else {
            <!-- Consulta simple del footer -->
            <p class="mt-1 text-sm text-cacao/70">Contacto: {{ pedido.contacto }}</p>
            @if (pedido.producto) {
              <p class="text-sm text-cacao/70">Producto: {{ pedido.producto }}</p>
            }
            <p class="mt-2 text-sm">{{ pedido.mensaje }}</p>
          }

          @if (pedido.id; as id) {
            <div class="mt-3 flex flex-wrap gap-2">
              @if (pedido.estado === 'pendiente') {
                <button
                  type="button"
                  (click)="pedidos.marcarEstado(id, 'atendido')"
                  class="rounded-full border border-bordo px-4 py-1.5 text-sm font-bold text-bordo transition-colors hover:bg-bordo hover:text-crema"
                >
                  Marcar como atendido
                </button>
              }
              <button
                type="button"
                (click)="eliminar(id)"
                class="rounded-full border border-cacao/30 px-4 py-1.5 text-sm font-bold text-cacao/70 transition-colors hover:border-bordo hover:bg-bordo/5 hover:text-bordo"
              >
                🗑 Eliminar
              </button>
            </div>
          }
        </li>
      } @empty {
        @if (!pedidos.cargando()) {
          <li class="rounded-vitrina bg-white p-6 text-center text-cacao/60 shadow-bordo">Todavía no hay pedidos recibidos.</li>
        }
      }
    </ul>
  `,
})
export class OrdersAdminComponent implements OnInit {
  readonly pedidos = inject(OrdersService);

  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.pedidos.recargar();
  }

  async eliminar(id: string): Promise<void> {
    if (!confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return;
    this.error.set(null);
    const error = await this.pedidos.eliminar(id);
    if (error) this.error.set(error);
  }
}
