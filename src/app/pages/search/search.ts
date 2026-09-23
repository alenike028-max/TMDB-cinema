import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Loader } from '../../components/loader/loader';
import { MediaCard } from '../../components/media-card/media-card';
import { TokenGate } from '../../components/token-gate/token-gate';
import { MediaSummary } from '../../models/tmdb';
import { TmdbService } from '../../services/tmdb';
import { TokenService } from '../../services/token';

/** Ricerca unica: film, serie e persone divisi per categoria. */
@Component({
  selector: 'app-search',
  imports: [MediaCard, Loader, TokenGate],
  template: `
    @if (!tokens.has()) {
      <app-token-gate />
    } @else {
      <div class="section-header"><h1>Risultati per “{{ query() }}”</h1></div>

      @if (loading()) { <app-loader /> }
      @else if (error()) { <div class="message message-error"><h2>Errore</h2><p>{{ error() }}</p></div> }
      @else if (total() === 0) { <p class="empty">Nessun risultato per “{{ query() }}”.</p> }
      @else {
        @if (movies().length) {
          <div class="section-header"><h2>Film <span class="count">{{ movies().length }}</span></h2></div>
          <div class="grid">@for (m of movies(); track m.id) { <app-media-card [item]="m" type="movie" /> }</div>
        }
        @if (tv().length) {
          <div class="section-header"><h2>Serie TV <span class="count">{{ tv().length }}</span></h2></div>
          <div class="grid">@for (t of tv(); track t.id) { <app-media-card [item]="t" type="tv" /> }</div>
        }
        @if (people().length) {
          <div class="section-header"><h2>Persone <span class="count">{{ people().length }}</span></h2></div>
          <div class="grid">@for (p of people(); track p.id) { <app-media-card [item]="p" type="person" /> }</div>
        }
      }
    }
  `,
})
export class Search {
  private tmdb = inject(TmdbService);
  private route = inject(ActivatedRoute);
  protected tokens = inject(TokenService);

  query = signal('');
  private results = signal<MediaSummary[]>([]);
  loading = signal(false);
  error = signal('');

  movies = computed(() => this.results().filter((r) => r.media_type === 'movie'));
  tv = computed(() => this.results().filter((r) => r.media_type === 'tv'));
  people = computed(() => this.results().filter((r) => r.media_type === 'person'));
  total = computed(() => this.results().length);

  constructor() {
    if (!this.tokens.has()) return;
    this.route.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((params) => {
      this.search(params.get('query') ?? '');
    });
  }

  private search(q: string): void {
    this.query.set(q);
    this.results.set([]);
    this.error.set('');
    if (!q.trim()) return;
    this.loading.set(true);
    this.tmdb.searchMulti(q).subscribe({
      next: (res) => { this.results.set(res.results ?? []); this.loading.set(false); },
      error: (err) => { this.error.set(err.message ?? 'Errore di rete'); this.loading.set(false); },
    });
  }
}
