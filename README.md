# Supertouch Kindness Foundation

Astro website with Sanity content and Microsoft SharePoint recruitment storage. The original private Sites version remains available during migration.

## Run locally

Use Node 22.12+ and `npm ci`. Copy `.env.example` to `.env.local` and set the account specific values. `npm run dev` starts the website; `npm run studio:dev` starts the Sanity editor. `npm run build` checks the Vercel build.

## Content

Sanity project `e22eonif`, dataset `production`. The hosted editor is [supertouch-kindness-editor.sanity.studio](https://supertouch-kindness-editor.sanity.studio/). `sanity.config.ts` defines editable pages and vacancies. `src/data/seed.json` has the approved initial text and vacancy copy. `npm run content:seed` imports only absent documents after `SANITY_WRITE_TOKEN` is set. The website fetches published content on each request; old page HTML supplies a temporary visual fallback while editors migrate content. Open vacancies must be active and have a future deadline. Applications use the same published vacancy list.

## Recruitment storage

Vercel POST `/api/applications` validates the same three fields/constraints as the current form, accepts one CV PDF and optional cover letter PDF up to 2 MB each, then writes a unique folder to a selected SharePoint document library through Microsoft Graph. It writes `application.json` last, so a retry can return the same reference after a confirmed completion. HR accesses files using normal SharePoint permissions. No CV or cover letter goes into Sanity or the GitHub repository.

Set the `SHAREPOINT_*` environment variables to an Entra app with narrowly scoped permission to the recruitment site. Grant access to the HR team on the SharePoint library. Keep `APPLICATIONS_ENABLED=false` until real uploads and HR downloads have been verified. Set a stable random `APPLICATION_SIGNING_SECRET` of at least 32 characters. The application page disables submissions until storage is ready.

The previous Sites version stores any earlier applications in its D1/R2 bindings. Those records need a separate controlled export and transfer; this repository does not silently move candidate data.

## Vercel

The private GitHub repository is connected to the Vercel project `supertouch-kindness-foundation` with the Astro preset. The Sanity project and dataset default to `e22eonif` and `production`; set `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` in Vercel if these change. Keep Vercel Authentication enabled for all deployments until the owner decides to make the new site public. Add the recruitment variables only when SharePoint storage is ready. Do not add secret variables to the repository.
