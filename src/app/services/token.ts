import { Injectable, signal } from '@angular/core';

/**
 * TokenService — gestisce l'API Read Access Token (v4) di TMDB.
 * Il token è salvato solo nel browser (localStorage).
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private static readonly KEY = 'tmdb_token';

  /** Signal reattivo con il token corrente. */
  readonly token = signal<string>(this.read());

  private read(): string {
    try {
      return localStorage.getItem(TokenService.KEY) ?? '';
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
