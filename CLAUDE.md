# CLAUDE.md

Todo el contexto del proyecto vive en un único archivo compartido entre herramientas:

@AGENTS.md

## Notas específicas para Claude Code

- Subagentes disponibles en `.claude/agents/`: `revisor-codigo`, `experto-supabase`,
  `ui-marca`. Usalos cuando la tarea calce con su descripción.
- Skills del proyecto: `/nuevo-componente`, `/pre-deploy`, `/migracion-db`.
- Hooks activos (ver `.claude/settings.json`): Prettier automático tras cada
  Edit/Write y un guard que bloquea comandos bash destructivos. Si un comando es
  bloqueado por el guard, explicale al usuario por qué en vez de buscarle la vuelta.
- Servidores MCP del proyecto en `.mcp.json` (context7, playwright, supabase).
