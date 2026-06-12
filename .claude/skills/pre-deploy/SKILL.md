---
name: pre-deploy
description: Checklist completo antes de pushear a main (Netlify deploya automático). Usar cuando el usuario diga "voy a deployar", "subí los cambios" o pida verificar que todo está listo para producción.
---

# Checklist pre-deploy

Pushear a `main` dispara el deploy en Netlify, así que esto ES el gate de producción.
Ejecutá cada paso y mostrá un resumen final con ✅/❌ por ítem.

## Pasos

1. **Build limpio**:

   ```bash
   npx ng build
   ```

   Debe terminar sin errores. Anotar el tamaño del bundle inicial: si supera
   ~110 kB transferidos (hoy ronda 88 kB), avisar qué lo hizo crecer.

2. **Formato**:

   ```bash
   npx prettier --check "src/**/*.{ts,html,css}"
   ```

   Si falla, correr `--write` sobre los archivos listados y avisar.

3. **Credenciales**: verificar que no se filtró nada real:

   ```bash
   git diff origin/main --stat
   git diff origin/main -- src/environments/
   grep -rn "supabase.co\|eyJ" src/environments/environment.ts || true
   ```

   `environment.ts` no debe comitearse con URL/key reales (en producción las
   inyecta Netlify vía `scripts/set-env.mjs`).

4. **Esquema consistente**: si el diff toca `supabase/`, confirmar que existe la
   migración nueva Y que `schema.sql` refleja el mismo cambio, y recordarle al
   usuario que la migración hay que correrla a mano en el SQL Editor de Supabase
   **antes** de que el frontend nuevo esté en producción.

5. **Revisión rápida del diff**: lanzar el subagente `revisor-codigo` sobre
   `git diff origin/main` y reportar solo los hallazgos críticos/importantes.

6. **Resumen final**: tabla con cada chequeo y su estado. Si todo está ✅,
   decir explícitamente que está listo para `git push`. No pushear sin que el
   usuario lo pida.
