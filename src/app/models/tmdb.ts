/** Modelli (interfacce) per le risposte delle API TMDB. */

export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface GenreList {
  genres: Genre[];
}

/** Elemento di una lista di film o serie (versione ridotta). */
export interface MediaSummary {
  id: number;
  title?: string;         // film
  name?: string;          // serie / persona
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;  // film
  first_air_date?: string; // serie
  vote_average?: number;
  overview?: string;
  media_type?: 'movie' | 'tv' | 'person';
  profile_path?: string | null;    // persona
  known_for_department?: string;   // persona
}

export interface Paged<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job?: string;
  department?: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface MovieDetail {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  tagline?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  runtime?: number;
  vote_average?: number;
  genres: Genre[];
  credits?: Credits;
}

export interface TvDetail {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  tagline?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  vote_average?: number;
  genres: Genre[];
  created_by?: { id: number; name: string }[];
  credits?: Credits;
}

export interface PersonDetail {
  id: number;
  name: string;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  known_for_department?: string;
  profile_path: string | null;
}

/** Crediti combinati (film + serie) di una persona. */
export interface CombinedCredit {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  character?: string;
  job?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
}

export interface CombinedCredits {
  cast: CombinedCredit[];
  crew: CombinedCredit[];
}
