// Inyecta las variables de entorno de Netlify en src/environments/environment.ts.
// Si las variables no están definidas (desarrollo local), deja el archivo como está.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const url = process.env['NG_APP_SUPABASE_URL'];
const key = process.env['NG_APP_SUPABASE_ANON_KEY'];

if (!url || !key) {
  console.log('[set-env] NG_APP_SUPABASE_* no definidas; se mantiene environment.ts local.');
  process.exit(0);
}

const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'environments', 'environment.ts');

writeFileSync(
  target,
  `// Generado automáticamente por scripts/set-env.mjs (no editar a mano en CI).
export const environment = {
  supabaseUrl: '${url}',
  supabaseAnonKey: '${key}',
};
`,
);

console.log('[set-env] environment.ts generado con las variables de Netlify.');
