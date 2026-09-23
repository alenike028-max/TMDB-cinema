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
      <div class="container">
        <p>Dati e immagini forniti da
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
