import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Loader } from '../../components/loader/loader';
import { MediaRow } from '../../components/media-row/media-row';
import { TokenGate } from '../../components/token-gate/token-gate';
import { MediaSummary } from '../../models/tmdb';
import { TmdbService } from '../../services/tmdb';
import { TokenService } from '../../services/token';
import { rating, year } from '../../util';

interface Featured {
  id: number;
  title: string;
  overview: string;
  backdrop: string | null;
  rating: string | null;
  year: string;
}

/** Home in stile piattaforma streaming: billboard + caroselli. */
@Component({
  selector: 'app-home',
  imports: [RouterLink, MediaRow, Loader, TokenGate],
  template: `
    @if (!tokens.has()) {
      <app-token-gate />
    } @else if (loading()) {
      <app-loader />
    } @else if (error()) {
      <div class="message message-error"><h2>Errore</h2><p>{{ error() }}</p></div>
    } @else {
      @if (featured(); as f) {
        <section class="billboard" [style.background-image]="f.backdrop ? 'url(' + f.backdrop + ')' : ''">
          <div class="billboard-scrim"></div>
          <div class="billboard-inner">
            <h1 class="billboard-title">{{ f.title }}</h1>
            <div class="billboard-meta">
              @if (f.rating) { <span class="pill-rating">★ {{ f.rating }}</span> }
              @if (f.year) { <span>{{ f.year }}</span> }
            </div>
            <p class="billboard-overview">{{ f.overview }}</p>
            <div class="billboard-actions">
              <a class="btn btn-primary" [routerLink]="['/movie', f.id]">▶ Guarda i dettagli</a>
              <a class="btn btn-glass" [routerLink]="['/movie', f.id]">ⓘ Maggiori info</a>
            </div>
          </div>
        </section>
      }

      <div class="rows">
        <app-media-row title="Film popolari" [items]="movies()" type="movie" [link]="['/movies']" />
        <app-media-row title="Serie TV popolari" [items]="tv()" type="tv" [link]="['/tv']" />
        <app-media-row title="Azione" [items]="azione()" type="movie" [link]="['/movies/genre/28']" />
        <app-media-row title="Commedia" [items]="commedia()" type="movie" [link]="['/movies/genre/35']" />
        <app-media-row title="Fantascienza" [items]="fantascienza()" type="movie" [link]="['/movies/genre/878']" />
      </div>
    }
  `,
})
export class Home {
  private tmdb = inject(TmdbService);
  protected tokens = inject(TokenService);

  featured = signal<Featured | null>(null);
  movies = signal<MediaSummary[]>([]);
  tv = signal<MediaSummary[]>([]);
  azione = signal<MediaSummary[]>([]);
  commedia = signal<MediaSummary[]>([]);
  fantascienza = signal<MediaSummary[]>([]);
  loading = signal(false);
  error = signal('');

  constructor() {
    if (!this.tokens.has()) return;
    this.loading.set(true);
    forkJoin({
      movies: this.tmdb.popularMovies(1),
      tv: this.tmdb.popularTv(1),
      azione: this.tmdb.discoverMovies(28, 1),
      commedia: this.tmdb.discoverMovies(35, 1),
      fantascienza: this.tmdb.discoverMovies(878, 1),
    }).subscribe({
      next: (res) => {
        const films = res.movies.results ?? [];
        this.movies.set(films);
        this.tv.set(res.tv.results ?? []);
        this.azione.set(res.azione.results ?? []);
        this.commedia.set(res.commedia.results ?? []);
        this.fantascienza.set(res.fantascienza.results ?? []);
        this.setFeatured(films);
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.message ?? 'Errore di rete'); this.loading.set(false); },
    });
  }

  /** Sceglie come "in evidenza" il primo film popolare con un'immagine di sfondo. */
  private setFeatured(films: MediaSummary[]): void {
    const f = films.find((m) => m.backdrop_path) ?? films[0];
    if (!f) return;
    const overview = f.overview ?? '';
    this.featured.set({
      id: f.id,
      title: f.title ?? f.name ?? '',
      overview: overview.length > 240 ? overview.slice(0, 237) + '…' : overview,
      backdrop: this.tmdb.img(f.backdrop_path, 'w1280'),
      rating: rating(f.vote_average),
      year: year(f.release_date ?? f.first_air_date),
    });
  }
}
