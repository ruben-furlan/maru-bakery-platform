# Guía completa: programar este repo con agentes de IA

Este repo viene pre-configurado para trabajar con **Claude Code**, **OpenCode** y
**OpenAI Codex**. Esta guía explica qué es cada pieza, dónde vive y cómo usarla,
paso a paso. Es también un mapa de los conceptos que hoy se usan en el mundo del
desarrollo con IA: archivos de contexto, subagentes, skills/comandos, hooks, MCP,
permisos y loops/modo headless.

---

## 0. Instalar las herramientas

```bash
# Claude Code (Anthropic)
npm install -g @anthropic-ai/claude-code
claude            # primera vez: login con tu cuenta

# OpenCode (open source, multi-proveedor)
npm install -g opencode-ai
opencode          # /connect para elegir proveedor (Anthropic, OpenAI, etc.)

# Codex CLI (OpenAI)
npm install -g @openai/codex
codex             # login con cuenta de ChatGPT o API key
```

Las tres se usan igual: abrís una terminal **parada en la raíz del repo** y
escribís lo que querés en lenguaje natural.

---

## 1. Archivos de contexto: `AGENTS.md` y `CLAUDE.md`

**Qué son.** El "system prompt del proyecto": un markdown que el agente lee
automáticamente al arrancar, con el stack, los comandos y las convenciones.
Es la pieza con mejor relación esfuerzo/resultado de todo el ecosistema: sin
contexto, cada sesión re-descubre el proyecto desde cero (y se equivoca).

**Cómo está armado acá.**

- [`AGENTS.md`](../AGENTS.md) — la fuente única de verdad. Es un estándar de facto
  que leen Codex, OpenCode, Cursor, Gemini CLI y otros.
- [`CLAUDE.md`](../CLAUDE.md) — lo que lee Claude Code; importa `AGENTS.md` con la
  sintaxis `@AGENTS.md` para no duplicar contenido, y agrega notas propias.

**Cómo se usa.** No hacés nada: se carga solo. Lo importante es **mantenerlo**:
cuando cambies una convención (ej: nueva carpeta, nuevo comando), actualizá
`AGENTS.md` en el mismo commit.

**Paso a paso para probarlo:**

1. `claude` (o `opencode`, o `codex`) en la raíz del repo.
2. Preguntá: _"¿qué convenciones de componentes tiene este proyecto?"_
3. Debe responder con OnPush, standalone, template inline, paleta bordó, etc.
   — sin leer ningún archivo. Eso es el contexto funcionando.

---

## 2. Subagentes (agentes especializados)

**Qué son.** Asistentes con su propio prompt, su propio contexto y (opcionalmente)
herramientas restringidas. El agente principal les delega tareas y recibe solo la
conclusión: sirven para especializar (un revisor que solo lee) y para no
contaminar la conversación principal con búsquedas largas.

**Los tres de este repo** (mismos roles en Claude Code y OpenCode):

| Agente             | Para qué                                                                    | Definición                                                                   |
| ------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `revisor-codigo`   | Revisión de diffs: bugs, convenciones, seguridad, a11y. Solo lee, no edita. | `.claude/agents/revisor-codigo.md` y `.opencode/agent/revisor-codigo.md`     |
| `experto-supabase` | Esquema, RLS, migraciones, Edge Function de emails.                         | `.claude/agents/experto-supabase.md` y `.opencode/agent/experto-supabase.md` |
| `ui-marca`         | Secciones de la landing, animaciones, mobile iOS/Android, paleta y a11y.    | `.claude/agents/ui-marca.md` y `.opencode/agent/ui-marca.md`                 |

**Paso a paso (Claude Code):**

1. Opción automática: pedí _"revisá mis cambios antes de comitear"_ — Claude ve la
   `description` del agente y lo delega solo.
2. Opción explícita: _"usá el subagente revisor-codigo sobre el diff actual"_.
3. `/agents` lista, crea y edita subagentes de forma interactiva.

**Paso a paso (OpenCode):** mencionalo con `@` — _"@revisor-codigo mirá el diff"_.

**Codex** no tiene subagentes por archivo; el equivalente es abrir otra sesión de
`codex` con un prompt de rol, o usar los prompts personalizados (sección 3).

**Crear uno nuevo:** copiá cualquiera de los `.md`, cambiá `name`/`description`
(la description es CLAVE: es lo que el agente principal usa para decidir delegar)
y el prompt del cuerpo.

---

## 3. Skills / comandos (procedimientos reutilizables)

**Qué son.** Instrucciones paso a paso empaquetadas que se invocan con `/nombre`
o que el agente activa solo cuando la tarea calza con la `description`. La idea
(popularizada como "Agent Skills") es codificar TU manera de hacer las cosas una
vez, en vez de repetirla en cada prompt.

**Las tres de este repo:**

| Skill               | Cuándo usarla                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `/nuevo-componente` | "Quiero una sección de promos en la landing" — crea el componente con el patrón exacto del repo y lo integra. |
| `/pre-deploy`       | Antes de pushear a main: build, prettier, chequeo de credenciales, esquema consistente y revisión del diff.   |
| `/migracion-db`     | Cambios de base: genera `migration-*.sql` idempotente + actualiza `schema.sql`, modelos y fallback.           |

**Dónde viven:** `.claude/skills/<nombre>/SKILL.md` (Claude Code) y
`.opencode/command/pre-deploy.md` (OpenCode, se invoca igual: `/pre-deploy`).
Para **Codex**: copiá el contenido a `~/.codex/prompts/pre-deploy.md` y se invoca
como `/pre-deploy` (ver `docs/codex-config.example.toml`).

**Paso a paso:**

1. `claude` → escribí `/pre-deploy`.
2. El agente ejecuta el checklist completo y te muestra la tabla ✅/❌.
3. Si todo da verde, recién ahí `git push`.

---

## 4. Hooks (automatizaciones determinísticas)

**Qué son.** Scripts que el harness ejecuta **siempre** en eventos del ciclo de
vida del agente (antes de una herramienta, después, al terminar). A diferencia de
una instrucción en el prompt — que el modelo puede olvidar — un hook es código:
se cumple el 100% de las veces. Es la pieza clave para garantías duras (formateo,
seguridad, notificaciones).

**Los tres de este repo** (configurados en [`.claude/settings.json`](../.claude/settings.json)):

| Evento                      | Script                          | Qué hace                                                                                                                                                                                   |
| --------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PreToolUse` (Bash)         | `.claude/hooks/guard-bash.mjs`  | Bloquea comandos destructivos: `rm -rf /`, force-push a main, `git reset --hard origin/main`, `supabase db reset`. Sale con código 2 → el comando se cancela y el agente recibe el motivo. |
| `PostToolUse` (Edit\|Write) | `.claude/hooks/format-file.mjs` | Corre Prettier sobre cada archivo que el agente edita. Nunca más diffs con formato inconsistente.                                                                                          |
| `Stop`                      | inline                          | Notificación de escritorio (`notify-send`) cuando el agente termina, para trabajar en otra cosa mientras tanto.                                                                            |

**Cómo funcionan por dentro:** el hook recibe por stdin un JSON con la
herramienta y sus argumentos (`tool_input.command`, `tool_input.file_path`...).
Exit 0 = seguir; exit 2 = bloquear y devolver el stderr al agente.

**En OpenCode** el formateo equivalente está en `opencode.json` → clave
`formatter` (corre Prettier al editar). **Codex** no tiene hooks por proyecto;
su protección es el sandbox (`sandbox_mode` en config.toml).

**Probarlo:** pedile a Claude Code que ejecute `git push --force origin main`
→ el guard lo bloquea y Claude te explica por qué.

---

## 5. MCP (Model Context Protocol)

**Qué es.** El estándar abierto (creado por Anthropic, adoptado por OpenAI,
Google y todo el ecosistema) para conectar agentes con herramientas externas:
bases de datos, navegadores, documentación, APIs. Un "servidor MCP" expone
herramientas; el agente las descubre y las llama.

**Los tres configurados acá** ([`.mcp.json`](../.mcp.json) para Claude Code,
`opencode.json` para OpenCode, `docs/codex-config.example.toml` para Codex):

| Servidor       | Para qué sirve en ESTE repo                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **context7**   | Documentación actualizada de librerías. Pedí _"usá context7 para ver la API de signals de Angular 20"_ y trae docs reales en vez de adivinar.                 |
| **playwright** | Maneja un navegador real: _"abrí localhost:4200 en viewport de iPhone y sacá screenshot del botón del carrito"_. Ideal para verificar visualmente la landing. |
| **supabase**   | Consulta tu proyecto de Supabase (en modo **read-only**): _"listá las políticas RLS de la tabla pedidos en producción"_.                                      |

**Paso a paso para activar el de Supabase** (los otros dos andan sin config):

1. Generá un token en https://supabase.com/dashboard/account/tokens
2. Exportá las variables antes de abrir el agente:
   ```bash
   export SUPABASE_ACCESS_TOKEN=sbp_...
   export SUPABASE_PROJECT_REF=tu-project-ref   # Settings → General
   ```
3. En OpenCode además cambiá `"enabled": false` → `true` en `opencode.json`.
4. Verificá con `/mcp` (Claude Code) que el servidor figura conectado.

> ⚠️ Está en `--read-only` a propósito: el agente puede mirar producción pero no
> tocarla. No lo saques de read-only.

---

## 6. Permisos (qué puede hacer el agente sin preguntar)

En `.claude/settings.json` → `permissions.allow` están pre-aprobados los comandos
seguros y frecuentes (`npm run build`, `npx prettier`, `git status/diff/log`...),
así el agente no te interrumpe por trivialidades. Todo lo demás pide confirmación.

- Ver/editar en vivo: comando `/permissions` dentro de Claude Code.
- Tus excepciones personales van a `.claude/settings.local.json` (ya está en
  `.gitignore`; el `settings.json` compartido sí se comitea).
- En Codex el equivalente es `approval_policy` + `sandbox_mode`; en OpenCode,
  la clave `permission` de `opencode.json`.

---

## 7. Loops y modo headless (automatización sin chat)

Las tres CLIs pueden correr **sin interfaz**, lo que habilita los patrones de
automatización que más se usan hoy:

```bash
# Una tarea puntual desde un script o CI (imprime y termina):
claude -p "corré npx ng build y resumí los errores si los hay"
codex exec "explicá el último commit"
opencode run "listá los TODO del código"
```

**Patrones útiles con este repo:**

1. **Loop de corrección** — repetir hasta que el build pase:
   ```bash
   until npx ng build > /tmp/build.log 2>&1; do
     claude -p "El build falló. Log: $(tail -30 /tmp/build.log). Arreglalo."
   done
   ```
2. **Loop interactivo** — dentro de Claude Code, el comando `/loop` re-ejecuta un
   prompt o skill a intervalos (ej: vigilar un deploy).
3. **Revisión automática en CI** — un paso de GitHub Actions / Netlify que corre
   `claude -p "/pre-deploy"` y falla el build si hay hallazgos críticos.

> Consejo: en headless el agente no puede preguntarte nada. Dale tareas con
> criterio de éxito verificable (que el build compile, que un test pase).

---

## 8. Flujo de trabajo recomendado (todo junto)

Día a día con este repo:

1. **Arrancar:** `claude` en la raíz. El contexto (`CLAUDE.md` → `AGENTS.md`) ya está cargado.
2. **Planear lo grande:** para features de varias partes, entrá en plan mode
   (`Shift+Tab` en Claude Code) y aprobá el plan antes de que toque código.
3. **Construir:** pedí la feature. Para una sección nueva: `/nuevo-componente`.
   Para base de datos: `/migracion-db`. Los hooks formatean solos cada archivo.
4. **Verificar:** _"@ui-marca / subagente ui-marca: ¿cómo se ve esto en iPhone?"_
   o con MCP de Playwright: _"sacá screenshot de localhost:4200 en 375px"_.
5. **Revisar:** _"revisá mis cambios"_ → delega en `revisor-codigo`.
6. **Deployar:** `/pre-deploy` → si todo ✅ → `git push` (Netlify deploya solo).

## 9. Mapa de archivos de toda la configuración

```
AGENTS.md                          # contexto universal (Codex, OpenCode, etc.)
CLAUDE.md                          # contexto Claude Code (importa AGENTS.md)
.mcp.json                          # servidores MCP para Claude Code
opencode.json                      # config OpenCode: contexto, formatter, MCP
.claude/
├── settings.json                  # permisos + hooks (compartido, se comitea)
├── hooks/guard-bash.mjs           # bloquea comandos destructivos
├── hooks/format-file.mjs          # Prettier automático post-edición
├── agents/{revisor-codigo,experto-supabase,ui-marca}.md
└── skills/{nuevo-componente,pre-deploy,migracion-db}/SKILL.md
.opencode/
├── agent/{revisor-codigo,experto-supabase,ui-marca}.md
└── command/pre-deploy.md          # /pre-deploy en OpenCode
docs/
├── GUIA-IA.md                     # esta guía
└── codex-config.example.toml      # para copiar a ~/.codex/config.toml
```
