import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { MediaDetail } from './pages/media-detail/media-detail';
import { MediaList } from './pages/media-list/media-list';
import { NotFound } from './pages/not-found/not-found';
import { PersonDetail } from './pages/person-detail/person-detail';
import { Search } from './pages/search/search';

export const routes: Routes = [
  { path: '', component: Home },

  { path: 'movies', component: MediaList, data: { type: 'movie' } },
  { path: 'movies/genre/:genre', component: MediaList, data: { type: 'movie' } },
  { path: 'tv', component: MediaList, data: { type: 'tv' } },
  { path: 'tv/genre/:genre', component: MediaList, data: { type: 'tv' } },

  { path: 'movie/:id', component: MediaDetail, data: { type: 'movie' } },
  { path: 'tv/:id', component: MediaDetail, data: { type: 'tv' } },
  { path: 'person/:id', component: PersonDetail },

  { path: 'search/:query', component: Search },

  { path: '**', component: NotFound },
];
