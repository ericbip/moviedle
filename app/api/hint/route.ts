import { NextResponse } from 'next/server';
import { getMovies } from '@/lib/movies';
import { dailyMovie } from '@/lib/daily';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const secret = dailyMovie(getMovies());
    const decade = secret.year > 0 ? `${Math.floor(secret.year / 10) * 10}s` : 'desconocida';
    const genres = secret.genres.length ? secret.genres.join(', ') : 'no disponibles';
    return NextResponse.json(
      { hint: `Se estrenó en la década de ${decade}. Géneros: ${genres}.` },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'No se pudo generar una pista.' }, { status: 500 });
  }
}
