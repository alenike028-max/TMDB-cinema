import { Component, ElementRef, ViewChild, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MediaSummary } from '../../models/tmdb';
import { MediaCard } from '../media-card/media-card';

/** Carosello orizzontale di titoli, con frecce di scorrimento (stile streaming). */
@Component({
  selector: 'app-media-row',
  imports: [MediaCard, RouterLink],
  template: `
    <section class="row">
      <div class="row-head">
        <h2>{{ title() }}</h2>
        @if (link()) { <a class="row-all" [routerLink]="link()">Vedi tutti ›</a> }
      </div>
      <div class="row-wrap">
        <button class="row-arrow left" (click)="scroll(-1)" aria-label="Scorri indietro" type="button">‹</button>
        <div class="row-track" #track>
          @for (item of items(); track item.id) {
            <app-media-card [item]="item" [type]="type()" />
          }
        </div>
        <button class="row-arrow right" (click)="scroll(1)" aria-label="Scorri avanti" type="button">›</button>
      </div>
    </section>
  `,
})
export class MediaRow {
  title = input.required<string>();
  items = input.required<MediaSummary[]>();
  type = input.required<'movie' | 'tv' | 'person'>();
  link = input<unknown[] | null>(null);

  @ViewChild('track') track!: ElementRef<HTMLDivElement>;

  scroll(dir: number): void {
    const el = this.track.nativeElement;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  }
}
