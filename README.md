# Moviedle

Juego diario para adivinar una película, construido con Next.js 14 App Router, TypeScript y Tailwind CSS. Sin base de datos ni autenticación.

## Ejecutar en Codespaces

```bash
npm install
npm run dev
```

Abre el puerto 3000 cuando Codespaces lo reenvíe.

## Dataset

La aplicación usa `data/movies.json` si está disponible y, en caso contrario, `data/movies.seed.json`. Para generar el catálogo, define `TMDB_API_KEY` y ejecuta `npm run movies:build`. Commitea `data/movies.json` para que el build de Vercel no dependa de la API de TMDB.

## Vercel

Importa este repositorio en Vercel. La variable `TMDB_API_KEY` solo es necesaria para generar el dataset; no se debe usar con prefijo `NEXT_PUBLIC_`.
