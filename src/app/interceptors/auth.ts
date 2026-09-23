import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token';

/**
 * Aggiunge a ogni richiesta verso TMDB l'header Authorization con il
 * Bearer token e il parametro di lingua (it-IT).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('https://api.themoviedb.org')) {
    const token = inject(TokenService).token();
    req = req.clone({
      setHeaders: token
        ? { Authorization: `Bearer ${token}`, accept: 'application/json' }
        : { accept: 'application/json' },
      setParams: { language: 'it-IT' },
    });
  }
  return next(req);
};
