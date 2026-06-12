import { Directive, OnDestroy, OnInit } from '@angular/core';

/**
 * Bloquea el scroll de la página mientras el elemento exista (pensado para
 * modales creados con @if). Fija el body con position: fixed — la técnica
 * que también funciona en iOS, donde overflow: hidden solo no alcanza — y
 * restaura la posición exacta al cerrar.
 */
@Directive({ selector: '[appScrollLock]' })
export class ScrollLockDirective implements OnInit, OnDestroy {
  private scrollY = 0;

  ngOnInit(): void {
    this.scrollY = window.scrollY;
    const body = document.body;
    // Compensa la desaparición de la barra de scroll para que el contenido no salte (desktop)
    const anchoBarra = window.innerWidth - document.documentElement.clientWidth;
    if (anchoBarra > 0) body.style.paddingRight = `${anchoBarra}px`;
    body.style.position = 'fixed';
    body.style.top = `-${this.scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
  }

  ngOnDestroy(): void {
    const body = document.body;
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    body.style.paddingRight = '';
    window.scrollTo({ top: this.scrollY, behavior: 'instant' });
  }
}
