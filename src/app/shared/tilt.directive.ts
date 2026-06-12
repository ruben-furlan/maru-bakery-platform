import { Directive, ElementRef, inject, input, NgZone, OnDestroy, OnInit } from '@angular/core';

/**
 * Inclina la tarjeta en 3D siguiendo el puntero, con un brillo cálido que
 * acompaña el movimiento (como luz reflejada en una vitrina).
 * Solo se activa con mouse (puntero fino) y se desactiva si el usuario
 * prefiere movimiento reducido.
 */
@Directive({ selector: '[appTilt]' })
export class TiltDirective implements OnInit, OnDestroy {
  /** Inclinación máxima en grados. */
  readonly tiltMax = input(8);

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private frame = 0;
  private activo = false;

  ngOnInit(): void {
    const conMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!conMouse || prefiereReducido) return;

    const el = this.elemento.nativeElement;
    el.classList.add('tilt-card');

    const brillo = document.createElement('span');
    brillo.className = 'tilt-glare';
    brillo.setAttribute('aria-hidden', 'true');
    el.appendChild(brillo);

    this.zone.runOutsideAngular(() => {
      el.addEventListener('pointermove', this.alMover);
      el.addEventListener('pointerleave', this.alSalir);
    });
    this.activo = true;
  }

  private readonly alMover = (evento: PointerEvent): void => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      const el = this.elemento.nativeElement;
      const rect = el.getBoundingClientRect();
      const x = (evento.clientX - rect.left) / rect.width;
      const y = (evento.clientY - rect.top) / rect.height;
      const max = this.tiltMax();
      const rotarY = ((x - 0.5) * 2 * max).toFixed(2);
      const rotarX = ((0.5 - y) * 2 * max).toFixed(2);
      el.style.transform = `perspective(900px) rotateX(${rotarX}deg) rotateY(${rotarY}deg) translateY(-6px) scale(1.02)`;
      el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    });
  };

  private readonly alSalir = (): void => {
    cancelAnimationFrame(this.frame);
    this.elemento.nativeElement.style.transform = '';
  };

  ngOnDestroy(): void {
    if (!this.activo) return;
    cancelAnimationFrame(this.frame);
    const el = this.elemento.nativeElement;
    el.removeEventListener('pointermove', this.alMover);
    el.removeEventListener('pointerleave', this.alSalir);
  }
}
