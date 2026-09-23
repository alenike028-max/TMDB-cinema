import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

/**
 * ThemeService — gestisce il tema chiaro/scuro.
 * La scelta viene salvata in localStorage; al primo avvio segue la
 * preferenza del sistema operativo, con default "scuro".
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly KEY = 'theme';

  readonly theme = signal<Theme>(this.initial());

  constructor() {
    // Applica il tema al documento e lo salva a ogni cambiamento.
    effect(() => {
      const t = this.theme();
      document.documentElement.setAttribute('data-theme', t);
      try {
        localStorage.setItem(ThemeService.KEY, t);
      } catch {
        /* localStorage non disponibile: ignoro */
      }
    });
  }

  toggle(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  private initial(): Theme {
    try {
      const saved = localStorage.getItem(ThemeService.KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* ignoro */
    }
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {
      /* ignoro */
    }
    return 'dark';
  }
}
