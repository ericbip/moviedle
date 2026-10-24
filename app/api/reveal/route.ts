import { NextResponse } from 'next/server';
import { getMovies } from '@/lib/movies';
import { dailyMovie } from '@/lib/daily';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const secret = dailyMovie(getMovies());
    return NextResponse.json(
      { title: secret.title, image_url: secret.image_url ?? null },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'No se pudo revelar la película.' }, { status: 500 });
  }
}
