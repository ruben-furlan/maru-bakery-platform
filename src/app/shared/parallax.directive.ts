import { Directive, ElementRef, inject, input, NgZone, OnDestroy, OnInit } from '@angular/core';

/**
 * Registro compartido: un solo listener de scroll para todas las instancias,
 * con fase de lectura y fase de escritura separadas para no forzar reflows
 * intercalados (layout thrashing).
 */
const instancias = new Set<ParallaxDirective>();
let frame = 0;

function actualizarTodas(): void {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    const centroViewport = window.innerHeight / 2;
    const medidas: [ParallaxDirective, number][] = [];
    for (const p of instancias) {
      if (p.visible) medidas.push([p, p.medirDelta(centroViewport)]);
    }
    for (const [p, delta] of medidas) p.aplicar(delta);
  });
}

/**
 * Desplaza el elemento a una velocidad distinta a la del scroll para dar
 * sensación de profundidad. Velocidad positiva = se mueve más lento que la
 * página (parece lejano); negativa = se mueve en contra (parece cercano).
 *
 * En dispositivos con mouse se activa siempre. En táctiles solo si el
 * elemento lo pide con parallaxMovil: animar capas grandes con blur desborda
 * el presupuesto de frame de un teléfono y traba el deslizamiento, así que
 * ahí solo deben moverse las formas livianas.
 */
@Directive({ selector: '[appParallax]' })
export class ParallaxDirective implements OnInit, OnDestroy {
  /** Factor de velocidad. Valores útiles: -0.4 a 0.5. */
  readonly appParallax = input(0.2);
  /** Habilita el efecto también en táctiles. Usar solo en elementos chicos y sin blur. */
  readonly parallaxMovil = input(false);

  visible = false;

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private observer: IntersectionObserver | null = null;
  private offsetActual = 0;
  private activo = false;

  ngOnInit(): void {
    const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefiereReducido || (!conMouse && !this.parallaxMovil()) || !('IntersectionObserver' in window)) return;

    const el = this.elemento.nativeElement;
    el.style.willChange = 'transform';

    this.observer = new IntersectionObserver(
      (entradas) => {
        this.visible = entradas[0].isIntersecting;
        if (this.visible) actualizarTodas();
      },
      { rootMargin: '30% 0px' },
    );
    this.observer.observe(el);

    if (instancias.size === 0) {
      this.zone.runOutsideAngular(() => {
        window.addEventListener('scroll', actualizarTodas, { passive: true });
        window.addEventListener('resize', actualizarTodas);
      });
    }
    instancias.add(this);
    this.activo = true;
    actualizarTodas();
  }

  /** Fase de lectura: distancia del centro del elemento al centro del viewport. */
  medirDelta(centroViewport: number): number {
    const rect = this.elemento.nativeElement.getBoundingClientRect();
    const centroBase = rect.top + rect.height / 2 - this.offsetActual;
    return centroViewport - centroBase;
  }

  /** Fase de escritura: aplica el desplazamiento sin leer layout. */
  aplicar(delta: number): void {
    this.offsetActual = delta * this.appParallax();
    this.elemento.nativeElement.style.transform = `translate3d(0, ${this.offsetActual.toFixed(1)}px, 0)`;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (!this.activo) return;
    instancias.delete(this);
    if (instancias.size === 0) {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', actualizarTodas);
      window.removeEventListener('resize', actualizarTodas);
    }
  }
}
