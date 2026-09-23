import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="message">
      <h2>Pagina non trovata</h2>
      <p>Il percorso richiesto non esiste.</p>
      <p><a class="btn btn-primary" routerLink="/">Torna alla home</a></p>
    </div>
  `,
})
export class NotFound {}
