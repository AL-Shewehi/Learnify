# Learnify

A full-stack learning platform built as a **pnpm monorepo** — Express + MongoDB on one side, Next.js on the other, and a shared contract package holding the truth in between.

## Screenshots

<!-- ضيف هنا 4-6 صور: landing، course details، player، instructor workspace، admin -->
<!-- صور حقيقية من مشروعك بتبيع أكتر من أي كلام -->

## What it does

**Students** browse a catalog with URL-synced filters, watch free previews, check out paid courses with a mock payment gateway, and learn in a player that tracks progress lesson by lesson.

**Instructors** run the full course lifecycle — draft → publish → unpublish — manage video/article lessons with reordering and free previews, and watch their students' progress in live stats.

**Admins** moderate the platform: user roles, activation, course suspension, and platform-wide statistics.

## Highlights

- 🔐 **JWT sessions in httpOnly cookies** — tokens never touch `localStorage`; the web client can't leak what it can't read
- 📦 **`packages/shared` as the single source of truth** — the same Zod schemas validate the request on the server and the form on the client
- 🔗 **URL as state** — catalog filters live in the query string, so every view is shareable and back-button-safe
- 📊 **Honest progress** — completion is derived from completed lessons on the server, never accepted from the client
- 📰 **An editorial design system** — paper/ink/pine palette, serif display type, dotted-leader indexes and offset print shadows instead of the usual gradient-and-glow look

## Tech stack

| Layer | Choices |
|---|---|
| Backend | Express · Mongoose · Zod · jsonwebtoken · cookie-parser |
| Frontend | Next.js (App Router) · TanStack Query · Zustand · React Hook Form · Tailwind v4 · Radix/shadcn |
| Contract | `packages/shared` — Zod schemas, types & constants built with tsup |
| Tooling | pnpm workspaces · Vitest + Supertest + mongodb-memory-server |

## Architecture

```
learnify/
├── apps/
│   ├── api/          Express API — controllers, models, role middleware
│   └── web/          Next.js app — feature-based folders, thin route pages
├── packages/
│   └── shared/       Zod schemas + TS types + constants (both sides import these)
└── pnpm-workspace.yaml
```

**Auth flow:** login sets an `httpOnly` cookie → Next middleware reads the JWT for route guards (guest-only, protected, role-based) → the Express `protect` middleware re-validates against the database on every request. UX decisions at the edge, security decisions at the source.

**Progress flow:** `POST /lessons/:id/complete` appends to `enrollment.completedLessons` and recomputes `progress` server-side; hitting 100% flips the enrollment to `completed`.

## Getting started

**Prerequisites:** Node 20+, pnpm, MongoDB (local or Atlas).

```bash
pnpm install

# API env
cp apps/api/.env.example apps/api/.env
# MONGODB_URL, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL, PORT

# Web env
cp apps/web/.env.example apps/web/.env.local
# NEXT_PUBLIC_API_URL, JWT_SECRET (same secret — middleware verifies cookies)

pnpm --filter @learnify/shared build
pnpm --filter @learnify/api seed:courses   # optional demo catalog
pnpm dev                                    # api :5000 + web :3000
```

Sign up from the UI, or promote a user to instructor/admin from the admin console. Paid courses accept the mock test card `4242 4242 4242 4242`.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs shared (watch) + api + web together |
| `pnpm build` | Builds shared then both apps |
| `pnpm --filter @learnify/api test` | API test suite on an in-memory MongoDB |
| `pnpm --filter @learnify/api seed:courses` | Seeds a demo catalog |

## API surface

Grouped overview — the shared package and the test suite are the living reference.

- **Auth** — signup · login · logout · me · forgot/reset · change password · update me · delete me
- **Courses** — list (filters, pagination) · create · read (+`isEnrolled`) · update · delete · publish · unpublish · suspend · activate
- **Lessons** — curriculum (preview-gated) · create · update · delete · reorder · read (access-gated) · complete
- **Enrollments** — enroll (free) · checkout (mock gateway) · my enrollments · course roster + stats
- **Admin** — stats · users (filters) · change role · toggle active · deactivate user

## Testing

```bash
pnpm --filter @learnify/api test
```

Vitest + Supertest against an in-memory MongoDB: auth sessions & cookies, the full course lifecycle (create → lesson → publish → enroll → complete), and checkout rules (402 on direct enroll for paid courses, test-card validation, receipts).

## Roadmap

- [ ] Stripe test-mode payments replacing the mock gateway
- [ ] Reviews & ratings
- [ ] Curriculum sections
- [ ] Mobile client consuming the same API contract

## Design notes

The UI deliberately avoids the generated-template look: no gradient headlines, no glow shadows, no rainbow chips. One accent (pine), warm paper neutrals, serif display type, mono labels, dotted leaders and hard offset shadows — a printed-catalog feel carried through every page, including instructor and admin workspaces.

## License

MIT