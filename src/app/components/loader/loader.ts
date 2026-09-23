import { Component } from '@angular/core';

/** Indicatore di caricamento. */
@Component({
  selector: 'app-loader',
  template: '<div class="loader" role="status" aria-label="Caricamento in corso"></div>',
})
export class Loader {}
