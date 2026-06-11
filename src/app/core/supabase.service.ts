import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * Acceso único al cliente de Supabase. Si las credenciales no están
 * configuradas (entorno de desarrollo sin backend), `client` es null y los
 * servicios usan los datos de respaldo locales.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly isConfigured =
    !!environment.supabaseUrl &&
    environment.supabaseUrl.startsWith('http') &&
    !!environment.supabaseAnonKey;

  readonly client: SupabaseClient | null = this.isConfigured
    ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
    : null;
}
