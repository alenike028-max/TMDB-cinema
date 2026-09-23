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
        <a routerLink="/" class="brand" aria-label="Home">
          <span class="brand-icon">🎬</span>
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
