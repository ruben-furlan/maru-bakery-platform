import { Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';

/**
 * Revela el elemento cuando entra al viewport.
 * - Sin valor: fade + translateY clásico.
 * - appReveal="3d": entra desde una perspectiva inclinada (rotateX) para dar profundidad.
 * - revealDelay: retraso en ms, útil para escalonar listas.
 * Si el usuario prefiere movimiento reducido, se muestra sin animación.
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective implements OnInit, OnDestroy {
  /** Variante de entrada: '' (default) o '3d'. */
  readonly appReveal = input<'' | '3d'>('');
  /** Retraso de la transición en milisegundos, para efecto escalonado. */
  readonly revealDelay = input(0);

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const el = this.elemento.nativeElement;
    el.classList.add('reveal');
    if (this.appReveal() === '3d') el.classList.add('reveal-3d');

    const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefiereReducido || !('IntersectionObserver' in window)) {
      el.classList.add('reveal-visible');
      return;
    }

    if (this.revealDelay() > 0) el.style.transitionDelay = `${this.revealDelay()}ms`;

    this.observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            el.classList.add('reveal-visible');
            // El retraso solo aplica a la entrada, no a transiciones posteriores
            el.addEventListener('transitionend', () => (el.style.transitionDelay = ''), {
              once: true,
            });
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
