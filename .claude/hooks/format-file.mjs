#!/usr/bin/env node
// Hook PostToolUse (Edit|Write): formatea con Prettier el archivo que el agente
// acaba de tocar. Nunca bloquea — si Prettier falla, el hook sale en silencio.
import { execFileSync } from 'node:child_process';

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw);
    const file = input.tool_input?.file_path ?? '';
    const formateable = /\.(ts|html|css|scss|json|mjs|js|md)$/.test(file);
    const ignorado = /node_modules|\/dist\/|package-lock\.json/.test(file);
    if (file && formateable && !ignorado) {
      execFileSync('npx', ['prettier', '--write', file], {
        cwd: input.cwd ?? process.cwd(),
        stdio: 'ignore',
        timeout: 30000,
      });
    }
  } catch {
    // no romper el flujo del agente por un error de formato
  }
  process.exit(0);
});
