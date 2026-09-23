import { Component, inject } from '@angular/core';
import { UiService } from '../../services/ui';

/** Messaggio mostrato quando manca il token TMDB. */
@Component({
  selector: 'app-token-gate',
  template: `
    <div class="message">
      <h2>Benvenuto in CineTeca 🎬</h2>
      <p>Per esplorare il catalogo serve un token di accesso alle API di TMDB.</p>
      <p><button class="btn btn-primary" (click)="ui.openSettings()">Configura il token</button></p>
    </div>
  `,
})
export class TokenGate {
  protected ui = inject(UiService);
}
