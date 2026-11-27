# Supertouch Kindness Foundation

Astro website with Sanity content and Microsoft SharePoint recruitment storage. The original private Sites version remains available during migration.

## Frontend architecture

Astro renders all 11 website routes and fetches published content from Sanity. Tailwind CSS v4 is installed through its Vite plugin, with foundation colors defined in `src/styles/tailwind.css`. The shared header and footer, navigation, and vacancy cards are reusable Astro components styled with Tailwind utilities. Every page's content receives shared responsive image, heading, and keyboard-focus utilities. The original Elementor page bodies and their CSS remain during the content migration so approved layouts and imagery are preserved. Tailwind Preflight is omitted so it does not reset those layouts. New or redesigned sections should use Astro components and Tailwind utilities rather than adding to the imported stylesheets.

## Run locally

Use Node 22.12+ and `npm ci`. Copy `.env.example` to `.env.local` and set the account specific values. `npm run dev` starts the website; `npm run studio:dev` starts the Sanity editor. `npm run build` builds the Cloudflare Worker and its static assets.

## Content

Sanity project `e22eonif`, dataset `production`. The hosted editor is [supertouch-kindness-editor.sanity.studio](https://supertouch-kindness-editor.sanity.studio/). `sanity.config.ts` defines editable pages and vacancies. `src/data/seed.json` has the approved initial text and vacancy copy. `npm run content:seed` imports only absent documents after `SANITY_WRITE_TOKEN` is set. The website fetches published content on each request; old page HTML supplies a temporary visual fallback while editors migrate content. Open vacancies must be active and have a future deadline. Applications use the same published vacancy list.

## Recruitment storage

The Worker POST `/api/applications` validates the same three fields/constraints as the current form, accepts one CV PDF and optional cover letter PDF up to 2 MB each, then writes a unique folder to a selected SharePoint document library through Microsoft Graph. It writes `application.json` last, so a retry can return the same reference after a confirmed completion. HR accesses files using normal SharePoint permissions. No CV or cover letter goes into Sanity or the GitHub repository.

Set the `SHAREPOINT_*` environment variables to an Entra app with narrowly scoped permission to the recruitment site. Grant access to the HR team on the SharePoint library. Keep `APPLICATIONS_ENABLED=false` until real uploads and HR downloads have been verified. Set a stable random `APPLICATION_SIGNING_SECRET` of at least 32 characters. The application page disables submissions until storage is ready.

The previous Sites version stores any earlier applications in its D1/R2 bindings. Those records need a separate controlled export and transfer; this repository does not silently move candidate data.

## Cloudflare migration preview

Use Node 24 and npm. Run `npm ci`, `npm test`, and `npm run build` in this checkout. Run `npx wrangler dev` to exercise the built Worker locally. The existing Vercel deployment uses the GitHub main branch. The migration branch has its own Cloudflare Worker name in `wrangler.jsonc`.

The Worker fetches the published Sanity dataset at request time. Set the same Sanity project and dataset in the Worker environment if the defaults change. Put any Sanity read token and SharePoint credentials in Cloudflare Worker secrets. Configure the existing signing secret if migrating the live recruitment endpoint so retries retain their references.

Recruitment is disabled in preview by default. Validate uploads against an approved test folder with test applicant details before enabling it for the public. Verify the homepage, original menu and footer, Sanity content, and the careers flow before attaching the production domain.
