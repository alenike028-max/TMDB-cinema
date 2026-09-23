/** Funzioni di utilità condivise e segnaposto per le immagini mancanti. */

export function year(date?: string | null): string {
  return date ? String(date).slice(0, 4) : '';
}

export function formatDate(date?: string | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function rating(vote?: number): string | null {
  return vote ? Number(vote).toFixed(1) : null;
}

export function runtime(min?: number): string {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}min` : `${m}min`;
}

const svg = (emoji: string) =>
  'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">` +
    `<rect width="200" height="300" fill="#1c1c26"/>` +
    `<text x="100" y="150" font-size="64" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`);

export const NO_POSTER = svg('🎬');
export const NO_PROFILE = svg('👤');
