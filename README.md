# Grain & Form

A bespoke furniture and woodwork business website built with **Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn-style Radix components, Framer Motion, Lucide, React Hook Form and Zod**. This is an enquiry website; it has no purchasing, payments, checkout or order tracking.

## Start locally

Use Node.js 22.13+ (the integration tests use Node's SQLite module).

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. To run a production Node server:

```bash
npm run build
npm start
```

## Business and admin configuration

Set real business values in `.env.local` or the hosting environment. The `NEXT_PUBLIC_` variables are public and are embedded during the build: rebuild after changing them. Contact details are deliberately empty by default; no invented address or phone number is presented. The map appears only when `NEXT_PUBLIC_MAP_QUERY` is set. The floating conversation button leads to the enquiry form until a WhatsApp number is configured. WhatsApp summaries contain text and explicitly say that images are not attached.

Admin at `/admin` requires both:

- `ADMIN_PASSWORD`: a unique password of at least 12 characters.
- `SESSION_SECRET`: an independently generated random secret of at least 32 characters.

Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Keep both values on the server. Admin stays disabled until they are configured. Sessions last eight hours and use signed, HttpOnly, SameSite cookies; production requires HTTPS. Changing the session secret invalidates existing sessions.

## Enquiry storage

**Local/Node default:** enquiries are saved as individual atomic JSON files in `.data/enquiries`; uploads live in `.data/uploads`. These directories are private, excluded from Git and never served as public assets. Use a persistent volume for `DATA_DIRECTORY` on a deployed Node host. A serverless ephemeral filesystem is unsuitable for this mode.

**Optional PostgreSQL:** set `DATABASE_URL`, run `npm run db:push`, then rebuild. Prisma stores enquiry details, statuses and internal notes in PostgreSQL. Uploaded files still need persistent `DATA_DIRECTORY` storage. Without `DATABASE_URL`, no database service is required.

**Sites hosting:** `npm run build:hosted` exports the Next.js visitor pages in an isolated staging directory and bundles them with a Cloudflare Worker adapter. The hosted adapter implements the same enquiry/admin API contracts using **D1 for enquiries and durable rate limits, and private R2 for images**. Bindings are declared in `.openai/hosting.json`; schema-only D1 migrations are in `drizzle/`. Sites provisions the bindings and applies migrations during deployment. The original Next.js application and API routes remain available for Node or PostgreSQL deployment. The Worker adapter does not use Prisma or the local filesystem.

Set `ADMIN_PASSWORD` and `SESSION_SECRET` as secret runtime variables in Sites to enable its dashboard, then redeploy the saved version. Do not use local QA credentials. Do not change audience/access permissions as part of deployment. A new Site is private until its owner explicitly changes sharing.

## Visitor experience

- Editorial homepage, brand story and six detailed service categories.
- Filterable portfolio with six illustrative concepts and individual project pages.
- Five-step enquiry: project type; requirements; budget/timeline; optional images; contact details; followed by a full review before submission.
- JPG, PNG and WebP reference uploads (maximum five, 4 MB each), previews and removal.
- Server validation, honeypot, origin checks, rate limiting, unique references and honest failure states.
- Contact form submits a consultation enquiry to the same persistent storage.
- Authenticated enquiry dashboard: search/filter, counts, detail view, private images, status updates, internal notes and CSV export.
- Responsive mobile menu, reduced-motion support, keyboard focus, SEO metadata, sitemap, robots and conditional real-business structured data.

## Validation

```bash
npm run typecheck
npm test
npm run build
npm run test:browser
npm run build:hosted
```

The browser check uses the existing `/usr/bin/google-chrome`, starts a temporary production server with randomly generated QA credentials, exercises submission/upload/admin/CSV/mobile navigation, and deletes its temporary enquiry storage. Run `npm run build` first. Screenshots are written to `/tmp/grain-form-*.png`. Adapt the Chrome executable path in `scripts/browser-qa.mjs` for another OS.

The integration suite tests validation, image signatures, formula-safe CSV export, hosted SQL persistence, image access control, login/session checks, status/notes changes, rate limiting and cross-origin rejection.

## Source map

- `src/app/`: pages, metadata and Node API routes.
- `src/components/`: reusable sections, enquiry/contact forms and admin interface.
- `src/components/ui/`: Radix/shadcn-style button primitives.
- `src/lib/`: business configuration, replaceable portfolio/service data, schemas, security, storage and upload handling.
- `prisma/`: optional PostgreSQL model.
- `hosting/worker.mjs`: D1/R2 API and static asset adapter for Sites.
- `scripts/build-hosted.mjs`: isolated Next.js export and Worker bundle.
- `drizzle/`: hosted D1 schema migration.

## Launch considerations

Replace demo branding, reference photography, portfolio concepts and the explicitly labelled illustrative review with real business content. No awards, company age, customer results or completed projects are claimed. Set the canonical site URL before building. Local-business structured data only appears when real phone/address values exist.

The default Node rate limiter is process-local and conservatively shares a quota without trusted proxy information. For multiple Node instances, use a shared rate-limit store at the ingress or application layer. Only set `TRUST_PROXY=true` behind a proxy that overwrites `X-Forwarded-For`. The hosted Worker uses atomic D1 rate limits and Cloudflare's client IP header. Configure your ingress body limit to 22 MB. Back up customer records and files, define a retention policy, and keep admin credentials private.

The app does not send email/SMS notifications: submitted enquiries appear in the dashboard. WhatsApp is available only after configuration and requires the visitor to send the message themselves.

## Photography & fonts

Reference photos are bundled locally from Unsplash and Pexels. They illustrate design possibilities and are not represented as Grain & Form commissions. See `ASSETS.md` for source links. Cormorant Garamond and Manrope are locally bundled Google Fonts under the SIL Open Font License; see `public/fonts/OFL-*.txt`.
