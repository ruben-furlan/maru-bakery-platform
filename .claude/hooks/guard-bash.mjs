#!/usr/bin/env node
// Hook PreToolUse (Bash): bloquea comandos destructivos antes de que se ejecuten.
// Salir con código 2 cancela el comando y le devuelve el stderr al agente.

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let cmd = '';
  try {
    cmd = JSON.parse(raw).tool_input?.command ?? '';
  } catch {
    process.exit(0);
  }

  const reglas = [
    {
      patron: /rm\s+(-\w*r\w*f|-\w*f\w*r)\w*\s+(\/|~|\$HOME)/,
      motivo: 'rm -rf sobre el home o la raíz del sistema',
    },
    {
      patron: /git\s+push\s+[^\n]*(--force\b|-f\b)[^\n]*\b(main|master)\b/,
      motivo: 'force-push a la rama principal',
    },
    {
      patron: /git\s+reset\s+--hard\s+[^\n]*origin\/(main|master)/,
      motivo: 'descarta todos los cambios locales contra main',
    },
    {
      patron: /supabase\s+(db\s+reset|secrets\s+unset)/,
      motivo: 'operación destructiva sobre Supabase de producción',
    },
  ];

  for (const { patron, motivo } of reglas) {
    if (patron.test(cmd)) {
      console.error(`Bloqueado por .claude/hooks/guard-bash.mjs: ${motivo}. Comando: ${cmd}`);
      process.exit(2);
    }
  }
  process.exit(0);
});
