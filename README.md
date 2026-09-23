# CineTeca 🎬

Applicazione **Angular** per esplorare **film**, **serie TV** e **persone** del
mondo del cinema, basata sulle API di
[The Movie Database (TMDB)](https://www.themoviedb.org/).

## Funzionalità

- **Film** e **Serie TV**
  - vista *Popolari* (titoli più popolari del momento)
  - filtro *Per genere* tramite menu a tendina
  - scheda di dettaglio: titolo, trama, immagini, voto, generi e **cast/crew**
- **Persone**
  - scheda con foto, dati anagrafici, biografia e **filmografia** completa
- **Ricerca unica** che restituisce insieme film, serie e persone, divisi per categoria
- Interfaccia responsive con tema scuro

## Tecnologie

- Angular (standalone components, signals, nuovo control flow `@if` / `@for`)
- `HttpClient` con un *interceptor* che aggiunge automaticamente l'header
  `Authorization: Bearer <token>` e la lingua `it-IT` alle chiamate TMDB
- Routing lato client con `@angular/router`
- Nessuna libreria UI esterna: stile CSS personalizzato

## Requisiti: token API TMDB

Il sito usa l'**API Read Access Token (v4)** di TMDB, inviato nell'header
`Authorization: Bearer <token>` di ogni richiesta.

Come ottenerlo:

1. Crea un account su [themoviedb.org](https://www.themoviedb.org/) (da browser desktop).
2. Vai in **Impostazioni account → API** e richiedi l'accesso accettando i termini d'uso.
3. Copia l'**API Read Access Token (v4)**.

Al primo avvio l'app chiede di incollare il token: viene salvato **solo nel
browser** (`localStorage`) e non viene mai condiviso. L'icona ⚙️ in alto a
destra permette di modificarlo in seguito.

## Avvio in locale

Servono [Node.js](https://nodejs.org/) e npm.

```bash
npm install
npm start
```

Poi apri **http://localhost:4200**.

Per creare la build di produzione:

```bash
npm run build
```

I file compilati finiscono nella cartella `dist/`.

## Struttura del progetto

```
src/app/
├── app.ts                 # componente radice (header, footer, modale)
├── app.config.ts          # provider: router, HttpClient, interceptor
├── app.routes.ts          # definizione delle rotte
├── models/tmdb.ts         # interfacce dei dati TMDB
├── interceptors/auth.ts   # aggiunge Bearer token e lingua
├── services/
│   ├── tmdb.ts            # chiamate alle API TMDB
│   ├── token.ts           # gestione del token (localStorage)
│   └── ui.ts              # stato UI (modale impostazioni)
├── components/            # header, card, loader, modale token, ecc.
└── pages/                 # home, elenco, dettaglio, persona, ricerca
```

## Endpoint TMDB utilizzati

| Cosa | Endpoint |
|------|----------|
| Film popolari | `/movie/popular` |
| Film per genere | `/discover/movie?with_genres={id}` |
| Lista generi film | `/genre/movie/list` |
| Dettaglio film + cast/crew | `/movie/{id}?append_to_response=credits` |
| Serie popolari | `/tv/popular` |
| Serie per genere | `/discover/tv?with_genres={id}` |
| Lista generi serie | `/genre/tv/list` |
| Dettaglio serie + cast/crew | `/tv/{id}?append_to_response=credits` |
| Dettaglio persona | `/person/{id}` |
| Filmografia persona | `/person/{id}/combined_credits` |
| Ricerca unica | `/search/multi?query=...` |

Le immagini si compongono con `https://image.tmdb.org/t/p/{size}{path}`
(es. `w500`, `original`).

---

Questo prodotto usa le API di TMDB ma non è approvato o certificato da TMDB.
