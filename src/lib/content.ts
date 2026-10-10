import {createClient} from '@sanity/client';
import defaults from '../data/vacancies.json';
import settings from '../../config/sanity.json';
export type Vacancy = typeof defaults[number];
export function contentClient(){
 const projectId=process.env.PUBLIC_SANITY_PROJECT_ID||import.meta.env.PUBLIC_SANITY_PROJECT_ID||settings.projectId;
 if(!projectId)return null;
 return createClient({projectId,dataset:process.env.PUBLIC_SANITY_DATASET||import.meta.env.PUBLIC_SANITY_DATASET||'production',apiVersion:'2026-10-10',useCdn:false,perspective:'published',token:process.env.SANITY_READ_TOKEN});
}
export async function vacancies():Promise<Vacancy[]>{
 const client=contentClient();
 if(!client)return defaults;
 // An empty or unavailable CMS must never re-open archived fallback vacancies.
 return client.fetch('*[_type == "vacancy" && active == true] | order(title asc)');
}
export async function pageContent(route:string){
 const client=contentClient();
 return client?client.fetch('*[_type == "page" && route == $route][0]{title,textBlocks}',{route}):null;
}
