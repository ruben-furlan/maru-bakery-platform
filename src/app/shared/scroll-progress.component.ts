import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
} from '@angular/core';

/**
 * Barra fina de progreso de lectura, fija sobre el header.
 * Se llena de dorado a medida que se recorre la página.
 */
@Component({
  selector: 'app-scroll-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-0 z-50 h-1" aria-hidden="true">
      <div
        class="barra h-full w-full origin-left bg-gradient-to-r from-dorado via-dorado to-crema"
      ></div>
    </div>
  `,
  styles: `
    .barra {
      transform: scaleX(0);
    }
  `,
})
export class ScrollProgressComponent implements AfterViewInit, OnDestroy {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private barra: HTMLElement | null = null;
  private frame = 0;

  ngAfterViewInit(): void {
    this.barra = this.elemento.nativeElement.querySelector('.barra');
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.alScrollear, { passive: true });
      window.addEventListener('resize', this.alScrollear);
    });
    this.actualizar();
  }

  private readonly alScrollear = (): void => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.actualizar());
  };

  private actualizar(): void {
    if (!this.barra) return;
    const maximo = document.documentElement.scrollHeight - window.innerHeight;
    const progreso = maximo > 0 ? Math.min(1, window.scrollY / maximo) : 0;
    this.barra.style.transform = `scaleX(${progreso.toFixed(4)})`;
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('scroll', this.alScrollear);
    window.removeEventListener('resize', this.alScrollear);
  }
}
