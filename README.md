# wooden-craft

A bespoke furniture and woodwork business website built with **Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn-style Radix components, Framer Motion, Lucide, React Hook Form and Zod**. This is an enquiry website; it has no purchasing, payments, checkout or order tracking.

## Start locally

Use Node.js 22.13+. The application and tests use no database.

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

No `.env` file is required to start the website. The contact and WhatsApp number defaults to +91 89050 89544 in `src/lib/config.ts`. Other contact details stay empty until configured. Optional overrides can be set in the hosting environment. The `NEXT_PUBLIC_` variables are public and are embedded during the build: rebuild after changing them. The map appears only when `NEXT_PUBLIC_MAP_QUERY` is set. The floating conversation button opens WhatsApp. WhatsApp summaries contain text and explicitly say that images are not attached.

## Enquiry storage

**Local/Node default:** enquiries are saved as individual atomic JSON files in `.data/enquiries`; uploads live in `.data/uploads`. These directories are private, excluded from Git and never served as public assets. Use a persistent volume for `DATA_DIRECTORY` on a deployed Node host. A serverless ephemeral filesystem is unsuitable for this mode.

**Sites hosting:** `npm run build:hosted` exports the Next.js visitor pages in an isolated staging directory and bundles them with a Cloudflare Worker adapter. The hosted adapter implements the same enquiry API contract using **private R2 files only**: each enquiry is an individual JSON object under `enquiries/`, and reference images are separate private objects. The R2 binding is declared in `.openai/hosting.json`; the database binding is disabled. No database, ORM, SQL migrations or database connection variables are used in either deployment mode.

Existing records in a previously deployed database are not automatically copied into these files. Export and migrate those records before switching an existing deployment. This change does not delete any remote resources.

## Visitor experience

- Editorial homepage, brand story and six detailed service categories.
- Filterable portfolio with six illustrative concepts and individual project pages.
- Five-step enquiry: project type; requirements; budget/timeline; optional images; contact details; followed by a full review before submission.
- JPG, PNG and WebP reference uploads (maximum five, 4 MB each), previews and removal.
- Server validation, honeypot, origin checks, rate limiting, unique references and honest failure states.
- Contact form submits a consultation enquiry to the same persistent storage.
- Responsive mobile menu, reduced-motion support, keyboard focus, SEO metadata, sitemap, robots and conditional real-business structured data.

## Validation

```bash
npm run typecheck
npm test
npm run build
npm run test:browser
npm run build:hosted
```

The browser check uses the existing `/usr/bin/google-chrome`, starts a temporary production server, exercises submissions/uploads/WhatsApp handoff/mobile navigation, verifies that removed admin routes return 404, and deletes its temporary enquiry storage. Run `npm run build` first. Screenshots are written to `/tmp/grain-form-*.png`. Adapt the Chrome executable path in `scripts/browser-qa.mjs` for another OS.

The integration suite tests validation, image signatures, hosted JSON and image file persistence, removed admin endpoints, rate limiting, failed-save cleanup and cross-origin rejection.

## Source map

- `src/app/`: pages, metadata and Node API routes.
- `src/components/`: reusable sections and enquiry/contact forms.
- `src/components/ui/`: Radix/shadcn-style button primitives.
- `src/lib/`: business configuration, replaceable portfolio/service data, schemas, security, storage and upload handling.
- `hosting/worker.mjs`: R2 file API and static asset adapter for Sites.
- `scripts/build-hosted.mjs`: isolated Next.js export and Worker bundle.

## Launch considerations

Replace demo branding, reference photography, portfolio concepts and the explicitly labelled illustrative review with real business content. No awards, company age, customer results or completed projects are claimed. Set the canonical site URL before building. Local-business structured data only appears when real phone/address values exist.

The default Node rate limiter is process-local and conservatively shares a quota without trusted proxy information. For multiple Node instances, use a shared rate-limit store at the ingress or application layer. Only set `TRUST_PROXY=true` behind a proxy that overwrites `X-Forwarded-For`. The hosted Worker also uses instance-local memory counters and Cloudflare's client IP header. These counters reset on restart and are not shared across Worker instances; enforce distributed limits at the ingress if needed. Configure your ingress body limit to 22 MB. Back up customer records and files, define a retention policy, and restrict access to private server files.

Both enquiry forms save the enquiry and then open WhatsApp addressed to +91 89050 89544 with the enquiry details filled in. The visitor must tap Send in WhatsApp; messages are not dispatched automatically. Reference images must be attached in WhatsApp separately. A WhatsApp link remains on each confirmation screen if opening WhatsApp fails. There is no admin panel or login. The app does not send email/SMS notifications.

## Photography & fonts

Reference photos are bundled locally from Unsplash and Pexels. They illustrate design possibilities and are not represented as Grain & Form commissions. See `ASSETS.md` for source links. Cormorant Garamond and Manrope are locally bundled Google Fonts under the SIL Open Font License; see `public/fonts/OFL-*.txt`.
