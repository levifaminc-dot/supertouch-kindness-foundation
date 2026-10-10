import {defineConfig} from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import {existsSync, readdirSync} from 'node:fs';

// The server bundle imports Rolldown at startup. Its platform binding is
// loaded dynamically and must be included explicitly in Vercel's function.
const linuxBindingDirectory = new URL('./node_modules/@rolldown/binding-linux-x64-gnu/', import.meta.url);
const linuxBindingFiles = existsSync(linuxBindingDirectory)
  ? readdirSync(linuxBindingDirectory).map((name) => `./node_modules/@rolldown/binding-linux-x64-gnu/${name}`)
  : [];

export default defineConfig({output:'server', adapter:vercel({maxDuration:60, includeFiles:linuxBindingFiles}), vite:{plugins:[tailwindcss()]}, trailingSlash:'always', devToolbar:{enabled:false}});
