---
description: Checklist completo antes de pushear a main (Netlify deploya automático)
---

Ejecutá el checklist pre-deploy de este repo y mostrá un resumen ✅/❌:

1. `npx ng build` — debe compilar sin errores; avisar si el bundle inicial supera ~110 kB.
2. `npx prettier --check "src/**/*.{ts,html,css}"` — si falla, corregir con `--write`.
3. `git diff origin/main -- src/environments/` — no debe haber credenciales reales comiteadas.
4. Si el diff toca `supabase/`: verificar migración nueva + `schema.sql` actualizado,
   y recordar que la migración se corre a mano en el SQL Editor ANTES del push.
5. Pedile a @revisor-codigo una revisión del diff contra origin/main y reportar
   solo hallazgos críticos/importantes.

No pushees sin que el usuario lo pida explícitamente.
