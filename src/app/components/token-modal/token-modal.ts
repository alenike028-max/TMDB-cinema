import { Component, inject, signal } from '@angular/core';
import { TokenService } from '../../services/token';
import { UiService } from '../../services/ui';

/** Modale per inserire / modificare il Read Access Token di TMDB. */
@Component({
  selector: 'app-token-modal',
  template: `
    <div class="modal-overlay" (click)="onOverlay($event)">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <h2 id="settings-title">Configurazione API TMDB</h2>
        <p class="modal-text">
          Per usare il sito serve un <strong>API Read Access Token (v4)</strong> di TMDB.
          Lo trovi nelle impostazioni del tuo account TMDB, sezione <em>API</em>.
          Il token viene salvato solo nel tuo browser e non viene mai inviato ad altri.
        </p>
        <label for="token-input" class="modal-label">Read Access Token</label>
        <textarea id="token-input" rows="4" [value]="value()"
                  (input)="value.set($any($event.target).value)"
                  placeholder="Incolla qui il tuo token (inizia con eyJ…)"></textarea>
        @if (error()) { <p class="modal-error">{{ error() }}</p> }
        <div class="modal-actions">
          <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener"
             class="btn btn-ghost">Vai alle impostazioni TMDB</a>
          <button class="btn btn-primary" (click)="save()">Salva</button>
        </div>
      </div>
    </div>
  `,
})
export class TokenModal {
  private tokens = inject(TokenService);
  private ui = inject(UiService);

  value = signal(this.tokens.token());
  error = signal('');

  onOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.ui.closeSettings();
    }
  }

  save(): void {
    const v = this.value().trim();
    if (v.length < 20) {
      this.error.set('Il token sembra troppo corto. Controlla di averlo copiato per intero.');
      return;
    }
    this.tokens.set(v);
    this.ui.closeSettings();
    // Ricarico per applicare il token a tutte le viste.
    location.reload();
  }
}
