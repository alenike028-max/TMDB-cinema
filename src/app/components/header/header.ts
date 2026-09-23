import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme';
import { UiService } from '../../services/ui';

/** Intestazione: logo, navigazione, barra di ricerca e impostazioni. */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand" aria-label="CineTeca — Home">
          <svg class="brand-logo" viewBox="0 0 40 40" aria-hidden="true">
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#f5c518" />
                <stop offset="1" stop-color="#ff7a00" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill="url(#brandGrad)" />
            <path d="M16 12 L29 20 L16 28 Z" fill="#fff" />
          </svg>
          <span class="brand-name">Cine<strong>Teca</strong></span>
        </a>

        <nav class="main-nav" aria-label="Navigazione principale">
          <a routerLink="/movies" routerLinkActive="active">Film</a>
          <a routerLink="/tv" routerLinkActive="active">Serie TV</a>
        </nav>

        <form class="search-form" (submit)="onSearch($event)" role="search">
          <input type="search" [value]="query()" (input)="query.set($any($event.target).value)"
                 placeholder="Cerca film, serie, persone…" autocomplete="off" aria-label="Cerca" />
          <button type="submit" aria-label="Cerca">🔍</button>
        </form>

        <button class="theme-btn" (click)="theme.toggle()"
                [title]="theme.theme() === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'"
                aria-label="Cambia tema">{{ theme.theme() === 'dark' ? '☀️' : '🌙' }}</button>

        <button class="settings-btn" (click)="ui.openSettings()"
                title="Impostazioni token API" aria-label="Impostazioni">⚙️</button>
      </div>
    </header>
  `,
})
export class Header {
  private router = inject(Router);
  protected ui = inject(UiService);
  protected theme = inject(ThemeService);
  query = signal('');

  onSearch(event: Event): void {
    event.preventDefault();
    const q = this.query().trim();
    if (q) this.router.navigate(['/search', q]);
  }
}
