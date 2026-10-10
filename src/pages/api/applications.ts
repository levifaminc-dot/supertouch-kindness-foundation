import type {APIRoute} from 'astro';
import {submit} from '../../lib/applications';
import {vacancies} from '../../lib/content';
export const POST:APIRoute=async({request})=>{try{return await submit(request,await vacancies());}catch{return Response.json({error:'Applications are temporarily unavailable. Please try again shortly.'},{status:503,headers:{'Cache-Control':'no-store'}});}};
