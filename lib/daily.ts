import { createHash } from 'node:crypto';
import type { Movie } from './movies';
export function utcDateKey(date = new Date()): string { return date.toISOString().slice(0, 10); }
export function dailyMovie(movies: Movie[], date = new Date()): Movie {
 if (!movies.length) throw new Error('No hay películas disponibles.');
 const hash = createHash('sha256').update(utcDateKey(date)).digest();
 return movies[hash.readUInt32BE(0) % movies.length];
}
