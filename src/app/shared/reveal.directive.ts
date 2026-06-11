import { Directive, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';

/**
 * Revela el elemento con fade + translateY cuando entra al viewport.
 * Si el usuario prefiere movimiento reducido, se muestra sin animación.
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective implements OnInit, OnDestroy {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const el = this.elemento.nativeElement;
    el.classList.add('reveal');

    const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefiereReducido || !('IntersectionObserver' in window)) {
      el.classList.add('reveal-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            el.classList.add('reveal-visible');
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
