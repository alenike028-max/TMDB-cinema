import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Loader } from '../../components/loader/loader';
import { TokenGate } from '../../components/token-gate/token-gate';
import { CombinedCredit, PersonDetail as Person } from '../../models/tmdb';
import { TmdbService } from '../../services/tmdb';
import { TokenService } from '../../services/token';
import { NO_PROFILE, formatDate, year } from '../../util';

/** Scheda di dettaglio di una persona: bio, dati anagrafici, filmografia. */
@Component({
  selector: 'app-person-detail',
  imports: [RouterLink, Loader, TokenGate],
  template: `
    @if (!tokens.has()) {
      <app-token-gate />
    } @else if (loading()) {
      <app-loader />
    } @else if (error()) {
      <div class="message message-error"><h2>Errore</h2><p>{{ error() }}</p></div>
    } @else if (person(); as p) {
      <article class="person">
        <div class="person-head">
          <img class="person-photo" [src]="photo()" [alt]="p.name" />
          <div class="person-info">
            <h1>{{ p.name }}</h1>
            <dl class="facts">
              @if (p.known_for_department) { <div class="fact"><dt>Conosciuto per</dt><dd>{{ p.known_for_department }}</dd></div> }
              @if (p.birthday) { <div class="fact"><dt>Nascita</dt><dd>{{ fmt(p.birthday) }}</dd></div> }
              @if (p.deathday) { <div class="fact"><dt>Morte</dt><dd>{{ fmt(p.deathday) }}</dd></div> }
              @if (p.place_of_birth) { <div class="fact"><dt>Luogo di nascita</dt><dd>{{ p.place_of_birth }}</dd></div> }
            </dl>
          </div>
        </div>

        <section>
          <h2>Biografia</h2>
          <p class="bio">{{ p.biography || 'Biografia non disponibile.' }}</p>
        </section>

        <section>
          <h2>Filmografia</h2>
          @if (filmography().length) {
            <div class="filmo">
              @for (c of filmography(); track c.media_type + '-' + c.id) {
                <a class="filmo-row" [routerLink]="['/', c.media_type, c.id]">
                  <span class="filmo-year">{{ yr(c) || '—' }}</span>
                  <span class="filmo-title">{{ c.title || c.name }}
                    <span class="filmo-kind">{{ c.media_type === 'tv' ? 'Serie' : 'Film' }}</span>
                  </span>
                  <span class="filmo-role">{{ role(c) }}</span>
                </a>
              }
            </div>
          } @else {
            <p class="empty">Nessun titolo disponibile.</p>
          }
        </section>
      </article>
    }
  `,
})
export class PersonDetail {
  private tmdb = inject(TmdbService);
  private route = inject(ActivatedRoute);
  protected tokens = inject(TokenService);

  person = signal<Person | null>(null);
  filmography = signal<CombinedCredit[]>([]);
  loading = signal(false);
  error = signal('');

  photo = () => this.tmdb.img(this.person()?.profile_path, 'w342') ?? NO_PROFILE;
  fmt = (d?: string | null) => formatDate(d);
  yr = (c: CombinedCredit) => year(c.release_date ?? c.first_air_date);
  role = (c: CombinedCredit) => c.character ? `come ${c.character}` : (c.job ?? '');

  constructor() {
    if (!this.tokens.has()) return;
    this.route.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((params) => {
      this.load(params.get('id')!);
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set('');
    this.person.set(null);
    forkJoin({ person: this.tmdb.personDetails(id), credits: this.tmdb.personCredits(id) }).subscribe({
      next: ({ person, credits }) => {
        this.person.set(person);
        this.filmography.set(this.buildFilmography(credits.cast ?? [], credits.crew ?? []));
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.message ?? 'Errore di rete'); this.loading.set(false); },
    });
  }

  /** Unisce cast e crew, elimina i duplicati e ordina per data decrescente. */
  private buildFilmography(cast: CombinedCredit[], crew: CombinedCredit[]): CombinedCredit[] {
    const seen = new Set<string>();
    return [...cast, ...crew]
      .filter((c) => {
        if (c.media_type !== 'movie' && c.media_type !== 'tv') return false;
        const key = `${c.media_type}-${c.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const da = a.release_date ?? a.first_air_date ?? '';
        const db = b.release_date ?? b.first_air_date ?? '';
        return db.localeCompare(da);
      });
  }
}
