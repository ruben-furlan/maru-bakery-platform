---
name: nuevo-componente
description: Crea un componente Angular nuevo siguiendo las convenciones exactas del repo (standalone, OnPush, template inline, signals, paleta de la marca). Usar cuando el usuario pida una sección, widget o pantalla nueva.
---

# Crear un componente nuevo en Marü Bakery

Argumento esperado: nombre y propósito del componente (ej: "promo-banner para la landing").

## Pasos

1. **Decidir la carpeta**: `src/app/landing/` (público), `src/app/admin/` (panel)
   o `src/app/shared/` (reutilizable). Archivo: `<nombre>.component.ts` en kebab-case.

2. **Usar exactamente esta plantilla** (es el patrón de todo el repo — verificalo
   contra un componente existente como `src/app/landing/steps.component.ts`):

   ```ts
   import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

   @Component({
     selector: 'app-<nombre>',
     changeDetection: ChangeDetectionStrategy.OnPush,
     template: `
       <!-- template inline, clases Tailwind con la paleta: bordo, crema, dorado, cacao -->
     `,
   })
   export class <Nombre>Component {}
   ```

3. **Reglas dentro del template**:
   - Control de flujo nuevo: `@if`, `@for (item of items(); track item.id)`.
   - Texto de UI en español; identificadores de dominio en español.
   - Mobile primero (375px) y variantes `md:` para desktop.
   - Animación de aparición: directiva existente `appReveal` (importarla en `imports`).
   - Botones de ícono con `aria-label`.

4. **Estado y datos**: signals (`signal`, `computed`). Si necesita datos de la base,
   inyectar el servicio correspondiente de `src/app/core/` con `inject()`; nunca
   llamar a Supabase directo desde el componente.

5. **Integrarlo**: importarlo en el componente padre (`landing-page.component.ts` o
   la ruta de admin) y agregarlo al template. Si es una sección nueva de la landing
   con ancla, agregar el link en `header.component.ts` y `mobile-nav.component.ts`.

6. **Verificar**: `npm run build` debe compilar sin errores. Mostrar al usuario
   dónde quedó integrado.
