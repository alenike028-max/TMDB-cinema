import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { TokenModal } from './components/token-modal/token-modal';
import { TokenService } from './services/token';
import { UiService } from './services/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, TokenModal],
  template: `
    <app-header />

    <main class="container main-content">
      <router-outlet />
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <svg class="brand-logo" viewBox="0 0 40 40" aria-hidden="true">
            <defs>
              <linearGradient id="footerGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#f5c518" />
                <stop offset="1" stop-color="#ff7a00" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill="url(#footerGrad)" />
            <path d="M16 12 L29 20 L16 28 Z" fill="#fff" />
          </svg>
          <span class="brand-name">Cine<strong>Teca</strong></span>
        </div>
        <p class="footer-credit">Dati e immagini forniti da
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">The Movie Database (TMDB)</a>.
          Questo prodotto usa le API di TMDB ma non è approvato o certificato da TMDB.</p>
      </div>
    </footer>

    @if (ui.settingsOpen()) { <app-token-modal /> }
  `,
})
export class App {
  protected ui = inject(UiService);
  private tokens = inject(TokenService);

  constructor() {
    // Al primo avvio, se manca il token, apro subito la modale.
    if (!this.tokens.has()) this.ui.openSettings();
  }
}
