import fs from 'node:fs';
import path from 'node:path';
export type Movie = { id:number; title:string; year:number; genres:string[]; director:string; country:string; runtime:number; rating:number; leadActor:string; saga:string|null; image_url?:string|null };
let cached:Movie[]|null=null;
export function getMovies():Movie[] {
 if(cached) return cached;
 const full=path.join(process.cwd(),'data','movies.json');
 const seed=path.join(process.cwd(),'data','movies.seed.json');
 const file=fs.existsSync(full)?full:seed;
 const parsed=JSON.parse(fs.readFileSync(file,'utf8')) as Movie[];
 if(!Array.isArray(parsed)||parsed.length===0) throw new Error('El catálogo de películas está vacío o no es válido.');
 cached=parsed; return cached;
}
