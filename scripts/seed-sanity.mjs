import {createClient} from '@sanity/client';
import {readFile} from 'node:fs/promises';
const {PUBLIC_SANITY_PROJECT_ID:projectId,PUBLIC_SANITY_DATASET:dataset='production',SANITY_WRITE_TOKEN:token}=process.env;
if(!projectId||!token)throw new Error('Set the Sanity project ID and a write token in the local environment.');
const client=createClient({projectId,dataset,token,apiVersion:'2026-10-10',useCdn:false});
const docs=JSON.parse(await readFile(new URL('../src/data/seed.json',import.meta.url),'utf8'));
const tx=client.transaction();for(const doc of docs)tx.createIfNotExists(doc);
await tx.commit();console.log(`Imported ${docs.length} initial content records without overwriting existing edits.`);
