# Enteak

A bespoke furniture and woodwork business website built with **Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn-style Radix components, Framer Motion, Lucide, React Hook Form and Zod**. This is an enquiry website; it has no purchasing, payments, checkout or order tracking.

## Start locally

Use Node.js 22.13+. The application supports Neon PostgreSQL for enquiry records. Tests run without a live database.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. To run a production Node server:

```bash
npm run build
npm start
```

## Business configuration

No `.env` file is required to start the website. The contact and WhatsApp number defaults to +91 89050 89544 in `src/lib/config.ts`. The studio address defaults to 4MMJ+GCQ, Siana- Sirohi Main Road, Shanti Nagar Colony, Siyana, Rajasthan 343024. Email and opening hours stay empty until configured. Optional overrides can be set in the hosting environment. The `NEXT_PUBLIC_` variables are public and are embedded during the build: rebuild after changing them. The map uses the studio address by default; `NEXT_PUBLIC_MAP_QUERY` can override its search location. The floating conversation button opens WhatsApp. WhatsApp summaries contain text and explicitly say that images are not attached.

## Enquiry storage

Set the pooled `DATABASE_URL` and direct `DIRECT_URL` in the untracked `.env` file (see `.env.example`). Prisma Client uses the pooled connection for application queries. Prisma CLI uses `DIRECT_URL`, falling back to `DATABASE_URL` when omitted. Credentials are loaded by `prisma.config.ts` and are never public build variables.

```bash
npm run db:generate
npm run db:migrate
npm run db:check
```

`prisma/schema.prisma` defines three models:

| Model | Table | Data |
| --- | --- | --- |
| `ContactMessage` | `contact_messages` | Name, email, mobile, city, message, consent, status, notes and creation time |
| `Enquiry` | `enquiries` | Contact details, project type, title, description, dimensions, material, integer quantity, finish, budget, timeline, location, WhatsApp, instructions and consent |
| `Attachment` | `attachments` | Private filename, display name, MIME type, byte size and submission foreign key |

Form values are stored in typed columns. Attachment metadata belongs to exactly one contact message or enquiry; SQL checks enforce ownership, supported byte sizes and quantity limits. Foreign keys cascade metadata when a parent record is deleted. Image bytes remain private files, rather than database blobs.

**Node API:** Prisma Client uses the Neon WebSocket adapter with native TLS over IPv4. Records and related attachments use a nested create, so they commit or roll back together. On failed saves, the API cleans up uploaded files and reports failure. `DATA_DIRECTORY` needs a persistent volume for `.data/uploads` on deployed Node hosts. Without `DATABASE_URL`, development retains the private JSON-file storage fallback.

**Vercel / AWS Lambda:** Set `DATABASE_URL` in the deployment environment. Submissions without images write directly to Neon without creating local directories. The application bundle (for example `/var/task`) is not writable. Image uploads require durable storage: use a Node host with a persistent volume configured via `DATA_DIRECTORY`, or add an object-storage adapter for serverless hosting. Without `DATA_DIRECTORY`, serverless image submissions return a storage configuration error. Do not point it at `/tmp`; temporary files disappear when the instance is recycled, while attachment metadata would remain in Neon.

**Sites hosting:** `npm run build:hosted` bundles the visitor pages and Worker adapter. Configure `DATABASE_URL` as a hosted runtime secret. The Worker uses parameterized Neon HTTPS transactions against the same Prisma-managed structured tables, with private R2 storage for image bytes. Without the secret it retains the R2 JSON fallback. Database migrations run before publishing; database credentials do not belong in `.openai/hosting.json` or client code.

**Migrations:** `prisma/migrations/` is the migration history. `0_baseline` describes the previous JSON schema, and `202611190001_structured_submissions` backfills typed fields, moves legacy contact records into their own table, creates attachment relations, and removes the old payload/source columns in a transaction. The existing Neon database was baselined before applying the upgrade. A private pre-upgrade backup is in the ignored `.data/backups` directory. Existing filesystem/R2 JSON objects are not automatically imported into PostgreSQL.

```bash
npm run db:schema:validate
npm run db:schema:format
npm run db:status
npm run db:migrate:dev -- --name describe_change
```

Use `db:migrate:dev` against a development database. `db:migrate` applies reviewed migrations to deployment databases without resetting their data. New installations apply both migrations automatically. See [Prisma's existing-database migration guidance](https://www.prisma.io/docs/orm/v7/prisma-migrate/getting-started).

The opt-in `npm run test:db:migration` exercises backfill using synthetic records in a temporary Neon schema and removes it afterward. It checks message text, typed quantity, optional values, timestamps, notes and attachment ownership. Normal `npm test` runs without database access. The opt-in `npm run test:db:submissions` expects a temporary server started with `NEXT_BUILD_DIRECTORY=.next-qa DATA_DIRECTORY=/tmp/grain-form-prisma-qa npm run dev -- --port 3127`. It verifies Node and Worker submissions in Neon, attachment foreign keys, nested-write rollback and orphan rejection, then deletes its own synthetic records and uploads.

## Visitor experience

- Editorial homepage, brand story and six detailed service categories.
- Filterable portfolio with six illustrative concepts and individual project pages.
- Product collection with four wooden objects, 13 generated studio views, photo galleries and product-specific WhatsApp enquiries.
- Five-step enquiry: project type; requirements; budget/timeline; optional images; contact details; followed by a full review before submission.
- JPG, PNG and WebP reference uploads (maximum five, 4 MB each), previews and removal.
- Server validation, honeypot, origin checks, rate limiting, unique references and honest failure states.
- Contact form submits a consultation enquiry to the same persistent storage.
- Fluid layouts for phones, tablets and wide desktops, with touch-sized controls and keyboard-accessible mobile navigation.
- Motion for React variants orchestrate headings, product cards, product details and gallery thumbnails. Directional gallery transitions and an animated selection indicator keep product browsing clear.
- A custom Motion-powered ticker on the homepage and collection page loops smoothly, pauses on hover, and becomes a static strip for reduced motion. The paid Motion+ Ticker package is not required.
- Animated navigation, project filtering and scroll progress also respect reduced-motion preferences.
- Keyboard focus, SEO metadata, sitemap, robots and conditional real-business structured data.

## Validation

```bash
npm run typecheck
npm test
npm run build
npm run test:browser
npm run test:responsive
npm run test:products
npm run build:hosted
```

If a development server is already running, keep its output separate from production QA:

```bash
NEXT_BUILD_DIRECTORY=.next-qa npm run build
NEXT_BUILD_DIRECTORY=.next-qa npm run test:browser
NEXT_BUILD_DIRECTORY=.next-qa npm run test:responsive
NEXT_BUILD_DIRECTORY=.next-qa npm run test:products
```

The browser check uses the existing `/usr/bin/google-chrome`, starts a temporary production server, exercises submissions/uploads/WhatsApp handoff/mobile navigation, verifies that removed admin routes return 404, and deletes its temporary enquiry storage. Run `npm run build` first. Screenshots are written to `/tmp/grain-form-*.png`. Adapt the Chrome executable path in `scripts/browser-qa.mjs` for another OS.

`npm run test:responsive` checks ten routes at 14 widths from 320 to 2560 pixels, short landscape navigation, menu resizing, animated portfolio filters and reduced-motion behavior. It uses the same local Chrome executable and writes screenshots to `/tmp/wooden-craft-*.png`. Build first. Use `npm run test:responsive -- --widths=320,768,1440` to check selected widths in a shorter run.

The integration suite tests validation, image signatures, hosted JSON and image file persistence, removed admin endpoints, rate limiting, failed-save cleanup and cross-origin rejection.

## Source map

- `src/app/`: Next.js pages, metadata and Node API routes.
- `src/components/layout/`: header, footer, brand and floating WhatsApp link.
- `src/components/forms/`: contact and project enquiry forms.
- `src/components/products/`: product cards and photo gallery.
- `src/components/work/`: filterable portfolio.
- `src/components/motion/`: motion provider, sequences, reveals and ticker.
- `src/components/shared/`: photos, text links, page introductions and project CTA.
- `src/components/ui/`: Radix/shadcn-style button primitive.
- `src/data/`: product catalog, portfolio concepts and service content.
- `src/lib/enquiry/`: shared enquiry schema, types and image validation.
- `src/lib/server/`: Prisma persistence, form-to-column mapping, security and upload handling.
- `prisma/`: typed database models, Prisma configuration and versioned SQL migrations.
- `src/lib/config.ts`: business details and WhatsApp helpers.
- `src/lib/utils.ts`: shared class-name utility.
- `src/styles/globals.css`: global styles, local fonts and responsive layouts.
- `public/`: website images, fonts and font licenses.
- `source-assets/`: archived original photographs and excluded edits, retained for provenance checks.
- `docs/`: asset sources and product photography documentation.
- `tests/`: enquiry validation, typed persistence mapping and hosted storage integration tests.
- `hosting/worker.mjs`: Neon/R2 enquiry API and static asset adapter for Sites.
- `scripts/build-hosted.mjs`: isolated Next.js export and Worker bundle.

## Launch considerations

Replace demo branding, reference photography, portfolio concepts and the explicitly labelled illustrative review with real business content. No awards, company age, customer results or completed projects are claimed. Set the canonical site URL before building. Local-business structured data only appears when real phone/address values exist.

The default Node rate limiter is process-local and conservatively shares a quota without trusted proxy information. For multiple Node instances, use a shared rate-limit store at the ingress or application layer. Only set `TRUST_PROXY=true` behind a proxy that overwrites `X-Forwarded-For`. The hosted Worker also uses instance-local memory counters and Cloudflare's client IP header. These counters reset on restart and are not shared across Worker instances; enforce distributed limits at the ingress if needed. Configure your ingress body limit to 22 MB. Back up customer records and files, define a retention policy, and restrict access to private server files.

Both enquiry forms save the enquiry and then open WhatsApp addressed to +91 89050 89544 with the enquiry details filled in. The visitor must tap Send in WhatsApp; messages are not dispatched automatically. Reference images must be attached in WhatsApp separately. A WhatsApp link remains on each confirmation screen if opening WhatsApp fails. There is no admin panel or login. The app does not send email/SMS notifications.

## Photography & fonts

Reference photos are bundled locally from Unsplash and Pexels. They illustrate design possibilities and are not represented as Enteak commissions. See `docs/assets.md` for source links. Cormorant Garamond and Manrope are locally bundled Google Fonts under the SIL Open Font License; see `public/fonts/OFL-*.txt`.

Product image sources, untouched originals and the background-edit prompt set are documented in [docs/product-photography.md](docs/product-photography.md).
