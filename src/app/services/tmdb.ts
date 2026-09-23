import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CombinedCredits, GenreList, MediaSummary, MovieDetail,
  Paged, PersonDetail, TvDetail,
} from '../models/tmdb';

/** Servizio che incapsula tutte le chiamate alle API di TMDB. */
@Injectable({ providedIn: 'root' })
export class TmdbService {
  private http = inject(HttpClient);
  private readonly base = 'https://api.themoviedb.org/3';
  private readonly imgBase = 'https://image.tmdb.org/t/p';

  /** Compone l'URL di un'immagine (size tipico: w300, w500, original). */
  img(path: string | null | undefined, size = 'w500'): string | null {
    return path ? `${this.imgBase}/${size}${path}` : null;
  }

  /* ---------- Film ---------- */
  popularMovies(page = 1): Observable<Paged<MediaSummary>> {
    return this.http.get<Paged<MediaSummary>>(`${this.base}/movie/popular`, { params: { page } });
  }
  discoverMovies(genreId: string | number, page = 1): Observable<Paged<MediaSummary>> {
    return this.http.get<Paged<MediaSummary>>(`${this.base}/discover/movie`, {
      params: { with_genres: genreId, page, sort_by: 'popularity.desc' },
    });
  }
  movieGenres(): Observable<GenreList> {
    return this.http.get<GenreList>(`${this.base}/genre/movie/list`);
  }
  movieDetails(id: string | number): Observable<MovieDetail> {
    return this.http.get<MovieDetail>(`${this.base}/movie/${id}`, {
      params: { append_to_response: 'credits' },
    });
  }

  /* ---------- Serie TV ---------- */
  popularTv(page = 1): Observable<Paged<MediaSummary>> {
    return this.http.get<Paged<MediaSummary>>(`${this.base}/tv/popular`, { params: { page } });
  }
  discoverTv(genreId: string | number, page = 1): Observable<Paged<MediaSummary>> {
    return this.http.get<Paged<MediaSummary>>(`${this.base}/discover/tv`, {
      params: { with_genres: genreId, page, sort_by: 'popularity.desc' },
    });
  }
  tvGenres(): Observable<GenreList> {
    return this.http.get<GenreList>(`${this.base}/genre/tv/list`);
  }
  tvDetails(id: string | number): Observable<TvDetail> {
    return this.http.get<TvDetail>(`${this.base}/tv/${id}`, {
      params: { append_to_response: 'credits' },
    });
  }

  /* ---------- Persone ---------- */
  personDetails(id: string | number): Observable<PersonDetail> {
    return this.http.get<PersonDetail>(`${this.base}/person/${id}`);
  }
  personCredits(id: string | number): Observable<CombinedCredits> {
    return this.http.get<CombinedCredits>(`${this.base}/person/${id}/combined_credits`);
  }

  /* ---------- Ricerca unica ---------- */
  searchMulti(query: string, page = 1): Observable<Paged<MediaSummary>> {
    return this.http.get<Paged<MediaSummary>>(`${this.base}/search/multi`, {
      params: { query, page, include_adult: 'false' },
    });
  }
}
