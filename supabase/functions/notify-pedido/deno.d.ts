// Declaración mínima del global "Deno" para que el IDE (que usa el
// TypeScript del proyecto Angular) no marque errores en la Edge Function.
// En Supabase la función corre sobre Deno real; esto es solo para el editor.
declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};
