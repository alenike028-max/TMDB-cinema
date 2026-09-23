import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MediaSummary } from '../../models/tmdb';
import { TmdbService } from '../../services/tmdb';
import { NO_POSTER, NO_PROFILE, rating, year } from '../../util';

/** Card cliccabile per un film, una serie o una persona. */
@Component({
  selector: 'app-media-card',
  imports: [RouterLink],
  template: `
    <a class="card" [routerLink]="link()">
      <div class="card-poster">
        <img [src]="image()" [alt]="label()" loading="lazy" />
        @if (vote()) { <span class="card-badge">★ {{ vote() }}</span> }
      </div>
      <div class="card-body">
        <h3 class="card-title">{{ label() }}</h3>
        <p class="card-sub">{{ sub() }}</p>
      </div>
    </a>
  `,
})
export class MediaCard {
  private tmdb = inject(TmdbService);

  item = input.required<MediaSummary>();
  type = input.required<'movie' | 'tv' | 'person'>();

  label = computed(() => this.item().title ?? this.item().name ?? '');
  link = computed(() => ['/', this.type(), this.item().id]);

  image = computed(() => {
    const it = this.item();
    if (this.type() === 'person') return this.tmdb.img(it.profile_path, 'w300') ?? NO_PROFILE;
    return this.tmdb.img(it.poster_path, 'w300') ?? NO_POSTER;
  });

  vote = computed(() => this.type() === 'person' ? null : rating(this.item().vote_average));

  sub = computed(() => {
    const it = this.item();
    if (this.type() === 'person') return it.known_for_department ?? 'Persona';
    return year(it.release_date ?? it.first_air_date) || '—';
  });
}
