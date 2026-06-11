import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrdersService } from '../core/orders.service';

@Component({
  selector: 'app-orders-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <h1 class="text-2xl text-bordo">Pedidos</h1>
    <p class="mt-1 text-sm text-cacao/60">Consultas recibidas desde el formulario de la landing.</p>

    @if (pedidos.cargando()) {
      <p class="mt-6 text-cacao/60">Cargando…</p>
    }

    <ul class="mt-6 space-y-3">
      @for (pedido of pedidos.pedidos(); track pedido.id) {
        <li class="rounded-vitrina bg-white p-5 shadow-bordo">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-display font-bold text-bordo">{{ pedido.nombre }}</p>
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
          <p class="mt-1 text-sm text-cacao/70">Contacto: {{ pedido.contacto }}</p>
          @if (pedido.producto) {
            <p class="text-sm text-cacao/70">Producto: {{ pedido.producto }}</p>
          }
          <p class="mt-2 text-sm">{{ pedido.mensaje }}</p>

          @if (pedido.estado === 'pendiente' && pedido.id) {
            <button
              type="button"
              (click)="pedidos.marcarEstado(pedido.id, 'atendido')"
              class="mt-3 rounded-full border border-bordo px-4 py-1.5 text-sm font-bold text-bordo transition-colors hover:bg-bordo hover:text-crema"
            >
              Marcar como atendido
            </button>
          }
        </li>
      } @empty {
        @if (!pedidos.cargando()) {
          <li class="rounded-vitrina bg-white p-6 text-center text-cacao/60 shadow-bordo">Todavía no hay consultas recibidas.</li>
        }
      }
    </ul>
  `,
})
export class OrdersAdminComponent implements OnInit {
  readonly pedidos = inject(OrdersService);

  ngOnInit(): void {
    void this.pedidos.recargar();
  }
}
