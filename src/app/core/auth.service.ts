import { inject, Injectable, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  readonly session = signal<Session | null>(null);

  constructor() {
    const client = this.supabase.client;
    if (!client) return;

    void client.auth.getSession().then(({ data }) => this.session.set(data.session));
    client.auth.onAuthStateChange((_evento, session) => this.session.set(session));
  }

  /** Devuelve la sesión activa, esperando a que Supabase restaure la persistida. */
  async obtenerSesion(): Promise<Session | null> {
    const client = this.supabase.client;
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  }

  async iniciarSesion(email: string, password: string): Promise<string | null> {
    const client = this.supabase.client;
    if (!client) return 'Supabase no está configurado: completá src/environments/environment.ts.';

    const { error } = await client.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }

  async cerrarSesion(): Promise<void> {
    await this.supabase.client?.auth.signOut();
  }
}
