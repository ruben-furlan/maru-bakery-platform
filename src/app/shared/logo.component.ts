import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Icono de marca: manga pastelera en línea, hereda el color del texto. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class="h-full w-full"
    >
      <!-- nudo superior de la manga -->
      <path d="M22 8c3 3.5 17 3.5 20 0" />
      <path d="M20 14h24" />
      <!-- cuerpo de la manga -->
      <path d="M20 14l10 31h4l10-31" />
      <!-- boquilla rizada -->
      <path d="M28 45l1.5 7 2.5-4.5 2.5 4.5 1.5-7" />
    </svg>
  `,
})
export class LogoComponent {}
