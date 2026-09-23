import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { Loader } from '../../components/loader/loader';
import { MediaCard } from '../../components/media-card/media-card';
import { TokenGate } from '../../components/token-gate/token-gate';
import { Genre, MediaSummary, MediaType } from '../../models/tmdb';
import { TmdbService } from '../../services/tmdb';
import { TokenService } from '../../services/token';

/** Elenco di film o serie: vista "Popolari" o filtrata per genere. */
@Component({
  selector: 'app-media-list',
  imports: [MediaCard, Loader, TokenGate],
  template: `
    @if (!tokens.has()) {
      <app-token-gate />
    } @else {
      <div class="section-header">
        <h1>{{ title() }}</h1>
        <label class="genre-filter">
          <span>Genere:</span>
          <select [value]="genre()" (change)="onGenreChange($any($event.target).value)">
            <option value="">Più popolari</option>
            @for (g of genres(); track g.id) {
              <option [value]="g.id">{{ g.name }}</option>
            }
          </select>
        </label>
      </div>

      <div class="grid">
        @for (item of items(); track item.id) {
          <app-media-card [item]="item" [type]="type()" />
        }
      </div>

      @if (loading()) { <app-loader /> }
      @if (!loading() && items().length === 0) {
        <p class="empty">Nessun titolo trovato.</p>
      }
      @if (error()) { <p class="empty">Errore: {{ error() }}</p> }

      @if (!loading() && page() < totalPages()) {
        <div class="load-more-wrap">
          <button class="btn btn-primary" (click)="loadNext()">Carica altri</button>
        </div>
      }
    }
  `,
})
export class MediaList {
  private tmdb = inject(TmdbService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected tokens = inject(TokenService);

  type = signal<MediaType>('movie');
  genre = signal<string>('');
  items = signal<MediaSummary[]>([]);
  genres = signal<Genre[]>([]);
  page = signal(0);
  totalPages = signal(1);
  loading = signal(false);
  error = signal('');

  title = () => (this.type() === 'tv' ? 'Serie TV' : 'Film');

  constructor() {
    if (!this.tokens.has()) return;

    combineLatest([this.route.data, this.route.paramMap])
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(([data, params]) => {
        this.type.set((data['type'] as MediaType) ?? 'movie');
        this.genre.set(params.get('genre') ?? '');
        this.reset();
        this.loadGenres();
        this.loadNext();
      });
  }

  private reset(): void {
    this.items.set([]);
    this.page.set(0);
    this.totalPages.set(1);
    this.error.set('');
  }

  private loadGenres(): void {
    const request = this.type() === 'tv' ? this.tmdb.tvGenres() : this.tmdb.movieGenres();
    request.subscribe({
      next: (res) => this.genres.set(res.genres ?? []),
      error: () => this.genres.set([]),
    });
  }

  loadNext(): void {
    const next = this.page() + 1;
    this.loading.set(true);
    const g = this.genre();
    const request = this.type() === 'tv'
      ? (g ? this.tmdb.discoverTv(g, next) : this.tmdb.popularTv(next))
      : (g ? this.tmdb.discoverMovies(g, next) : this.tmdb.popularMovies(next));

    request.subscribe({
      next: (res) => {
        this.items.update((cur) => [...cur, ...(res.results ?? [])]);
        this.page.set(res.page ?? next);
        this.totalPages.set(res.total_pages ?? 1);
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.message ?? 'Errore di rete'); this.loading.set(false); },
    });
  }

  onGenreChange(value: string): void {
    const seg = this.type() === 'tv' ? 'tv' : 'movies';
    this.router.navigate(value ? ['/', seg, 'genre', value] : ['/', seg]);
  }
}
