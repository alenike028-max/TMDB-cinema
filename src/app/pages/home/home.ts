import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Loader } from '../../components/loader/loader';
import { MediaCard } from '../../components/media-card/media-card';
import { TokenGate } from '../../components/token-gate/token-gate';
import { MediaSummary } from '../../models/tmdb';
import { TmdbService } from '../../services/tmdb';
import { TokenService } from '../../services/token';

/** Home: anteprima di film e serie popolari. */
@Component({
  selector: 'app-home',
  imports: [RouterLink, MediaCard, Loader, TokenGate],
  template: `
    @if (!tokens.has()) {
      <app-token-gate />
    } @else if (loading()) {
      <app-loader />
    } @else if (error()) {
      <div class="message message-error"><h2>Errore</h2><p>{{ error() }}</p></div>
    } @else {
      <section class="hero-banner">
        <h1>Scopri il mondo del cinema</h1>
        <p>Film, serie TV e le persone che li rendono possibili.</p>
      </section>

      <div class="section-header"><h2>Film popolari</h2><a class="link-all" routerLink="/movies">Vedi tutti →</a></div>
      <div class="grid">
        @for (m of movies(); track m.id) { <app-media-card [item]="m" type="movie" /> }
      </div>

      <div class="section-header"><h2>Serie TV popolari</h2><a class="link-all" routerLink="/tv">Vedi tutte →</a></div>
      <div class="grid">
        @for (t of tv(); track t.id) { <app-media-card [item]="t" type="tv" /> }
      </div>
    }
  `,
})
export class Home {
  private tmdb = inject(TmdbService);
  protected tokens = inject(TokenService);

  movies = signal<MediaSummary[]>([]);
  tv = signal<MediaSummary[]>([]);
  loading = signal(false);
  error = signal('');

  constructor() {
    if (!this.tokens.has()) return;
    this.loading.set(true);
    forkJoin({ movies: this.tmdb.popularMovies(1), tv: this.tmdb.popularTv(1) }).subscribe({
      next: ({ movies, tv }) => {
        this.movies.set((movies.results ?? []).slice(0, 12));
        this.tv.set((tv.results ?? []).slice(0, 12));
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.message ?? 'Errore di rete'); this.loading.set(false); },
    });
  }
}
