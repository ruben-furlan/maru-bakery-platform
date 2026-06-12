import { Directive, ElementRef, inject, input, NgZone, OnDestroy, OnInit } from '@angular/core';

/**
 * Desplaza el elemento a una velocidad distinta a la del scroll para dar
 * sensación de profundidad. Velocidad positiva = se mueve más lento que la
 * página (parece lejano); negativa = se mueve en contra (parece cercano).
 * Solo recalcula mientras el elemento está cerca del viewport.
 */
@Directive({ selector: '[appParallax]' })
export class ParallaxDirective implements OnInit, OnDestroy {
  /** Factor de velocidad. Valores útiles: -0.4 a 0.5. */
  readonly appParallax = input(0.2);

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private observer: IntersectionObserver | null = null;
  private visible = false;
  private frame = 0;
  private offsetActual = 0;
  private activo = false;

  ngOnInit(): void {
    const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefiereReducido || !('IntersectionObserver' in window)) return;

    const el = this.elemento.nativeElement;
    el.style.willChange = 'transform';

    this.observer = new IntersectionObserver(
      (entradas) => {
        this.visible = entradas[0].isIntersecting;
        if (this.visible) this.actualizar();
      },
      { rootMargin: '30% 0px' },
    );
    this.observer.observe(el);

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.alScrollear, { passive: true });
      window.addEventListener('resize', this.alScrollear);
    });
    this.activo = true;
    this.actualizar();
  }

  private readonly alScrollear = (): void => {
    if (!this.visible) return;
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.actualizar());
  };

  private actualizar(): void {
    const el = this.elemento.nativeElement;
    const rect = el.getBoundingClientRect();
    // Centro del elemento sin el desplazamiento ya aplicado
    const centroBase = rect.top + rect.height / 2 - this.offsetActual;
    const delta = window.innerHeight / 2 - centroBase;
    this.offsetActual = delta * this.appParallax();
    el.style.transform = `translate3d(0, ${this.offsetActual.toFixed(1)}px, 0)`;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (!this.activo) return;
    cancelAnimationFrame(this.frame);
    window.removeEventListener('scroll', this.alScrollear);
    window.removeEventListener('resize', this.alScrollear);
  }
}
