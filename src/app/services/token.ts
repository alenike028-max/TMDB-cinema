import { Injectable, signal } from '@angular/core';

/**
 * TokenService — gestisce l'API Read Access Token (v4) di TMDB.
 *
 * Il token viene letto in questo ordine di priorità:
 *   1. dalla variabile d'ambiente NG_APP_TMDB_TOKEN (file .env);
 *   2. dal browser (localStorage), se salvato dall'utente;
 *   3. se non presente da nessuna parte, viene mostrata la modale di richiesta.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private static readonly KEY = 'tmdb_token';

  /** Signal reattivo con il token corrente. */
  readonly token = signal<string>(this.read());

  private read(): string {
    const fromEnv = this.envToken();
    if (fromEnv) return fromEnv;
    try {
      return localStorage.getItem(TokenService.KEY) ?? '';
    } catch {
      return '';
    }
  }

  /** Legge il token dal file .env (variabile NG_APP_TMDB_TOKEN). */
  private envToken(): string {
    try {
      const value = import.meta.env['NG_APP_TMDB_TOKEN'] as string | undefined;
      return value?.trim() ?? '';
    } catch {
      return '';
    }
  }

  set(value: string): void {
    const clean = (value ?? '').trim();
    try {
      localStorage.setItem(TokenService.KEY, clean);
    } catch {
      /* localStorage non disponibile: ignoro */
    }
    this.token.set(clean);
  }

  clear(): void {
    try {
      localStorage.removeItem(TokenService.KEY);
    } catch {
      /* ignoro */
    }
    this.token.set('');
  }

  has(): boolean {
    return this.token().length > 0;
  }
}
