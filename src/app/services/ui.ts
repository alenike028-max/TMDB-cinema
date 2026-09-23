import { Injectable, signal } from '@angular/core';

/** Stato dell'interfaccia condiviso (es. apertura della modale token). */
@Injectable({ providedIn: 'root' })
export class UiService {
  readonly settingsOpen = signal(false);

  openSettings(): void { this.settingsOpen.set(true); }
  closeSettings(): void { this.settingsOpen.set(false); }
}
