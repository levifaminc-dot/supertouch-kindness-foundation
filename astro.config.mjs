import {defineConfig} from 'astro/config';
import vercel from '@astrojs/vercel';
export default defineConfig({output:'server', adapter:vercel({maxDuration:60}), trailingSlash:'always', devToolbar:{enabled:false}});
