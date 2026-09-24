import { Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { Loader } from '../../components/loader/loader';
import { TokenGate } from '../../components/token-gate/token-gate';
import { CastMember, MediaType, MovieDetail, TvDetail } from '../../models/tmdb';
import { TmdbService } from '../../services/tmdb';
import { TokenService } from '../../services/token';
import { NO_POSTER, NO_PROFILE, formatDate, rating, runtime, year } from '../../util';

interface DetailVM {
  title: string;
  subtitle: string;
  tagline: string;
  overview: string;
  rating: string | null;
  backdrop: string | null;
  poster: string;
  genres: string[];
  facts: [string, string][];
  cast: CastMember[];
}

/** Scheda di dettaglio per un film o una serie TV. */
@Component({
  selector: 'app-media-detail',
  imports: [RouterLink, Loader, TokenGate],
  template: `
    @if (!tokens.has()) {
      <app-token-gate />
    } @else if (loading()) {
      <app-loader />
    } @else if (error()) {
      <div class="message message-error"><h2>Errore</h2><p>{{ error() }}</p></div>
    } @else if (vm(); as d) {
      <article class="detail">
        @if (d.backdrop) {
          <div class="detail-backdrop" [style.background-image]="'url(' + d.backdrop + ')'"></div>
        }
        <div class="detail-head">
          <img class="detail-poster" [src]="d.poster" [alt]="d.title" />
          <div class="detail-info">
            <h1>{{ d.title }}</h1>
            @if (d.subtitle) { <p class="detail-sub">{{ d.subtitle }}</p> }
            @if (d.tagline) { <p class="detail-tagline">“{{ d.tagline }}”</p> }
            <div class="detail-meta">
              @if (d.rating) { <span class="rating-badge">★ {{ d.rating }}</span> }
              <div class="chips">
                @for (g of d.genres; track g) { <span class="chip">{{ g }}</span> }
              </div>
            </div>
            <h2>Trama</h2>
            <p class="detail-overview">{{ d.overview || 'Trama non disponibile.' }}</p>
            @if (d.facts.length) {
              <dl class="facts">
                @for (f of d.facts; track f[0]) {
                  <div class="fact"><dt>{{ f[0] }}</dt><dd>{{ f[1] }}</dd></div>
                }
              </dl>
            }
          </div>
        </div>

        @if (d.cast.length) {
          <section class="cast-section">
            <h2>Cast principale</h2>
            <div class="row-wrap">
              <button class="row-arrow left" (click)="scrollCast(-1)" type="button" aria-label="Scorri indietro">‹</button>
              <div class="cast-row" #castTrack>
                @for (p of d.cast; track p.id) {
                  <a class="cast-card" [routerLink]="['/person', p.id]">
                    <img [src]="profile(p)" [alt]="p.name" loading="lazy" />
                    <span class="cast-name">{{ p.name }}</span>
                    <span class="cast-role">{{ p.character }}</span>
                  </a>
                }
              </div>
              <button class="row-arrow right" (click)="scrollCast(1)" type="button" aria-label="Scorri avanti">›</button>
            </div>
          </section>
        }
      </article>
    }
  `,
})
export class MediaDetail {
  private tmdb = inject(TmdbService);
  private route = inject(ActivatedRoute);
  protected tokens = inject(TokenService);

  vm = signal<DetailVM | null>(null);
  loading = signal(false);
  error = signal('');

  @ViewChild('castTrack') castTrack?: ElementRef<HTMLDivElement>;

  /** Scorre orizzontalmente la riga del cast. */
  scrollCast(dir: number): void {
    const el = this.castTrack?.nativeElement;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  constructor() {
    if (!this.tokens.has()) return;
    combineLatest([this.route.data, this.route.paramMap])
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(([data, params]) => {
        const type = (data['type'] as MediaType) ?? 'movie';
        const id = params.get('id')!;
        this.load(type, id);
      });
  }

  profile(p: CastMember): string {
    return this.tmdb.img(p.profile_path, 'w185') ?? NO_PROFILE;
  }

  private load(type: MediaType, id: string): void {
    this.loading.set(true);
    this.error.set('');
    this.vm.set(null);
    const request: Observable<MovieDetail | TvDetail> =
      type === 'tv' ? this.tmdb.tvDetails(id) : this.tmdb.movieDetails(id);
    request.subscribe({
      next: (d) => { this.vm.set(type === 'tv' ? this.mapTv(d as TvDetail) : this.mapMovie(d as MovieDetail)); this.loading.set(false); },
      error: (err) => { this.error.set(err.message ?? 'Errore di rete'); this.loading.set(false); },
    });
  }

  private mapMovie(m: MovieDetail): DetailVM {
    const crew = m.credits?.crew ?? [];
    const director = crew.find((c) => c.job === 'Director');
    const writers = [...new Set(crew.filter((c) => ['Writer', 'Screenplay', 'Story'].includes(c.job ?? '')).map((w) => w.name))];
    const facts: [string, string][] = [];
    if (director) facts.push(['Regia', director.name]);
    if (writers.length) facts.push(['Sceneggiatura', writers.join(', ')]);
    if (m.release_date) facts.push(['Uscita', formatDate(m.release_date)]);
    if (m.original_title && m.original_title !== m.title) facts.push(['Titolo originale', m.original_title]);
    return {
      title: m.title,
      subtitle: [year(m.release_date), runtime(m.runtime)].filter(Boolean).join(' · '),
      tagline: m.tagline ?? '',
      overview: m.overview,
      rating: rating(m.vote_average),
      backdrop: this.tmdb.img(m.backdrop_path, 'w1280'),
      poster: this.tmdb.img(m.poster_path, 'w500') ?? NO_POSTER,
      genres: (m.genres ?? []).map((g) => g.name),
      facts,
      cast: (m.credits?.cast ?? []).slice(0, 14),
    };
  }

  private mapTv(t: TvDetail): DetailVM {
    const creators = (t.created_by ?? []).map((c) => c.name);
    const facts: [string, string][] = [];
    if (creators.length) facts.push(['Ideatore', creators.join(', ')]);
    if (t.first_air_date) facts.push(['Prima messa in onda', formatDate(t.first_air_date)]);
    if (t.status) facts.push(['Stato', t.status]);
    if (t.original_name && t.original_name !== t.name) facts.push(['Titolo originale', t.original_name]);
    return {
      title: t.name,
      subtitle: [year(t.first_air_date),
        t.number_of_seasons ? `${t.number_of_seasons} stagioni` : '',
        t.number_of_episodes ? `${t.number_of_episodes} episodi` : ''].filter(Boolean).join(' · '),
      tagline: t.tagline ?? '',
      overview: t.overview,
      rating: rating(t.vote_average),
      backdrop: this.tmdb.img(t.backdrop_path, 'w1280'),
      poster: this.tmdb.img(t.poster_path, 'w500') ?? NO_POSTER,
      genres: (t.genres ?? []).map((g) => g.name),
      facts,
      cast: (t.credits?.cast ?? []).slice(0, 14),
    };
  }
}
