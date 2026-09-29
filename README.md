# Learnify

Modern Learning Management System (LMS) platform. Learnify provides JWT-based authentication, role-based access control, course management, student enrollment, progress tracking, and admin operations — with an Express API, a Next.js frontend, and a shared validation/types package.

## Monorepo Layout

```text
apps/api/          Express + MongoDB API (@learnify/api)
apps/web/          Next.js frontend (@learnify/web)
packages/shared/   Shared Zod schemas, types and constants (@learnify/shared)
```

`pnpm-workspace.yaml` includes `apps/*` and `packages/*`. The single root `pnpm-lock.yaml` is the source of truth — do not commit nested lockfiles.

## Features

### API (`apps/api`)

- User signup, login, profile management, password changes, and password reset
- Three roles: `student`, `instructor`, and `admin`
- Course creation, publishing, suspension, activation, and search
- Student enrollment and progress tracking
- Instructor and admin enrollment statistics
- MongoDB persistence with Mongoose
- Request validation with Zod (via `@learnify/shared`)
- Security middleware with Helmet, CORS, and rate limiting
- Centralized API error handling

### Web (`apps/web`)

- Auth flow: login, signup, forgot/reset password, session sync
- Route guards via `proxy.ts`: guest-only pages, protected pages, role guards (`/admin`, `/instructor`)
- Courses browsing with subject/level filters, search, pagination, and course details
- Landing sections, shared layout, UI kit, React Query provider, and Axios API client
- Consumes the same Zod schemas/types from `@learnify/shared`

### Shared (`packages/shared`)

- Constants: `USER_ROLES`, `COURSE_STATUSES`, `COURSE_LEVELS`, `ENROLLMENT_STATUSES`, `COURSE_SUBJECTS` (+ `CourseSubject` type)
- Zod schemas: auth, course, enrollment, admin
- Inferred TypeScript types for API requests/responses

Course subjects are a strict enum: `Programming`, `Design`, `Business`, `Data`, `Writing`, `Marketing`, `Photography`, `Music`, `Health`, `Personal Development`, `Education`.

## Tech Stack

- **API:** Node.js, TypeScript, Express 5, MongoDB, Mongoose, JWT, Zod, pnpm
- **Web:** Next.js 16, React 19, Tailwind CSS 4, React Hook Form, TanStack Query, Axios, Zustand, jose
- **Shared:** TypeScript, Zod, tsup

## Requirements

- Node.js 20 or newer
- pnpm 11 (see `packageManager` in `apps/web/package.json`)
- A MongoDB database, local or MongoDB Atlas

## Getting Started

```bash
git clone https://github.com/AL-Shewehi/Learnify.git
cd Learnify
pnpm install
cp apps/api/.env.example apps/api/.env
```

Create `apps/web/.env.local` (see Environment Variables below), then run everything from the repo root:

```bash
pnpm dev
```

- API runs at `http://localhost:5000` by default. Verify with:
  ```bash
  curl http://localhost:5000/health
  ```
- Web runs at `http://localhost:3000`.

To run packages individually:

```bash
pnpm dev:api
pnpm dev:web
```

Build all packages (shared first):

```bash
pnpm build
```

## Environment Variables

### API (`apps/api/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URL=mongodb://127.0.0.1:27017/learnify
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000

# Set to true during local development to print reset emails in the terminal.
DEVELOPMENT=true

# Required for real email delivery when DEVELOPMENT is false.
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=Learnify <noreply@example.com>
```

Never commit `.env` or production secrets. When `DEVELOPMENT=true`, password-reset email content is logged to the server console instead of being sent.

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
JWT_SECRET=replace-with-the-same-jwt-secret-used-by-the-api
```

`NEXT_PUBLIC_API_URL` points the Axios client at the API. `JWT_SECRET` is used by the Next.js proxy to verify the `learnify_token` cookie for route guards. Never commit `.env.local` or real secrets.

## Available Commands

### Root

| Command          | Description                                        |
| ---------------- | -------------------------------------------------- |
| `pnpm dev`       | Run shared, api, and web together with watch mode  |
| `pnpm dev:api`   | Run only the API                                   |
| `pnpm dev:web`   | Run only the web frontend                          |
| `pnpm build`     | Build shared first, then api and web               |
| `pnpm lint`      | Lint all workspace packages                        |

### API (`pnpm --filter @learnify/api <cmd>`)

| Command            | Description                            |
| ------------------ | -------------------------------------- |
| `pnpm dev`         | Run the API with TypeScript watch mode |
| `pnpm build`       | Compile TypeScript to `dist/`          |
| `pnpm start`       | Run the compiled production server     |
| `pnpm lint`        | Check the source with ESLint           |
| `pnpm lint:fix`    | Automatically fix ESLint issues        |
| `pnpm clean`       | Remove the compiled output             |
| `pnpm seed:admin`  | Create the default admin account       |
| `pnpm seed:courses`| Seed 13 sample courses                 |
| `pnpm fix:indexes` | Rebuild Course MongoDB indexes         |

After configuring MongoDB, you can seed data with:

```bash
pnpm --filter @learnify/api seed:admin
pnpm --filter @learnify/api seed:courses
```

The admin seed currently creates `admin@lms.com` with password `Admin@12345`. Change this password immediately in any non-local environment. The courses seed creates 13 published courses across Programming, Design, Business, Data, and Writing, assigned to an instructor account.

### Web (`pnpm --filter @learnify/web <cmd>`)

| Command      | Description                 |
| ------------ | --------------------------- |
| `pnpm dev`   | Run Next.js in dev mode     |
| `pnpm build` | Production build            |
| `pnpm start` | Run the production server   |
| `pnpm lint`  | Check the source with ESLint|

### Shared (`pnpm --filter @learnify/shared <cmd>`)

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Watch-build with tsup    |
| `pnpm build` | Build to `dist/`         |

## API Overview

Base URL: `http://localhost:5000/api/v1`

Protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

### Health

| Method | Endpoint  | Auth   |
| ------ | --------- | ------ |
| `GET`  | `/health` | Public |

### Authentication

| Method   | Endpoint                      | Auth                   | Purpose                          |
| -------- | ----------------------------- | ---------------------- | -------------------------------- |
| `POST`   | `/auth/signup`                | Public                 | Register a student or instructor |
| `POST`   | `/auth/login`                 | Public                 | Login and receive a JWT          |
| `POST`   | `/auth/forgot-password`       | Public                 | Request a password reset email   |
| `POST`   | `/auth/reset-password/:token` | Public                 | Set a new password               |
| `GET`    | `/auth/me`                    | Any authenticated user | Get the current user             |
| `PATCH`  | `/auth/update-me`             | Any authenticated user | Update name or email             |
| `PATCH`  | `/auth/change-password`       | Any authenticated user | Change password                  |
| `DELETE` | `/auth/delete-me`             | Any authenticated user | Deactivate the account           |

Example signup and login:

```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
	-H 'Content-Type: application/json' \
	-d '{"name":"Jane Student","email":"jane@example.com","password":"Password123","role":"student"}'

curl -X POST http://localhost:5000/api/v1/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"jane@example.com","password":"Password123"}'
```

Signup accepts `student` or `instructor`. Admin users should be created through the seed command or directly by an administrator; clients cannot register as admin.

### Courses

| Method   | Endpoint                 | Auth                  |
| -------- | ------------------------ | --------------------- |
| `GET`    | `/courses`               | Public, optional JWT  |
| `GET`    | `/courses/:id`           | Public, optional JWT  |
| `POST`   | `/courses`               | Instructor or admin   |
| `PATCH`  | `/courses/:id`           | Course owner or admin |
| `DELETE` | `/courses`               | Instructor or admin   |
| `PATCH`  | `/courses/:id/publish`   | Course instructor     |
| `PATCH`  | `/courses/:id/unpublish` | Course instructor     |
| `PATCH`  | `/courses/:id/suspend`   | Admin                 |
| `PATCH`  | `/courses/:id/activate`  | Admin                 |

Create a course with `title`, `price`, `subject`, and `level`. Subjects must be one of `COURSE_SUBJECTS` and levels are `beginner`, `intermediate`, and `advanced`.

```bash
curl -X POST http://localhost:5000/api/v1/courses \
	-H 'Content-Type: application/json' \
	-H 'Authorization: Bearer <instructor-token>' \
	-d '{"title":"TypeScript Fundamentals","description":"Learn TypeScript from scratch","price":49.99,"subject":"Programming","level":"beginner"}'
```

Course listing supports `page`, `limit`, `subject`, `level`, `sort`, and `search` query parameters. Public users and students see published courses; instructors also see their own drafts, while admins can see all courses.

### Enrollment and Progress

| Method  | Endpoint                         | Auth                       |
| ------- | -------------------------------- | -------------------------- |
| `POST`  | `/courses/:courseId/enroll`      | Student                    |
| `GET`   | `/enrollments/me`                | Student                    |
| `GET`   | `/courses/:courseId/enrollments` | Course instructor or admin |
| `PATCH` | `/courses/:courseId/progress`    | Student                    |

Example enrollment and progress update:

```bash
curl -X POST http://localhost:5000/api/v1/courses/<course-id>/enroll \
	-H 'Content-Type: application/json' \
	-H 'Authorization: Bearer <student-token>' \
	-d '{}'

curl -X PATCH http://localhost:5000/api/v1/courses/<course-id>/progress \
	-H 'Content-Type: application/json' \
	-H 'Authorization: Bearer <student-token>' \
	-d '{"progress":50}'
```

`GET /enrollments/me` supports `status`, `page`, and `limit`. Enrollment statuses are `active`, `completed`, and `dropped`.

### Admin

All admin endpoints require an authenticated user with the `admin` role.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/stats` | Get platform statistics and revenue totals |
| `GET` | `/admin/users` | List and filter users |
| `PATCH` | `/admin/users/:id/role` | Change a user's role |
| `PATCH` | `/admin/users/:id/active` | Activate or deactivate a user |
| `DELETE` | `/admin/users/:id` | Deactivate a user |

Admin user listing supports `page`, `limit`, `role`, `search`, and `isActive` query parameters.

## Response Format

Successful responses generally use:

```json
{
  "status": "success",
  "data": {}
}
```

Validation and application errors use an HTTP error status and:

```json
{
  "status": "fail",
  "message": "Readable error message"
}
```

In development, server errors may also include a `stack` field.

## Project Structure

```text
apps/api/src/
├── config/        Database configuration
├── controllers/   Request handlers and business logic
├── middlewares/   Authentication, roles, and errors
├── models/        Mongoose models
├── routes/        Express route definitions
├── seeds/         Admin, course, and index maintenance scripts
├── types/         TypeScript declarations
├── utils/         Shared errors, tokens, email, and helpers
├── app.ts         Express application setup
└── server.ts      Database connection and HTTP server

apps/web/src/
├── app/           Next.js routes (main, auth, instructor, admin)
├── components/    UI kit, forms, and layout
├── features/      Auth, courses, and landing modules
├── hooks/         Shared React hooks
├── lib/           Axios client and utilities
├── providers/     React Query provider
├── proxy.ts       Auth and role route guards
└── types/         Frontend API types

packages/shared/src/
├── constants/     Roles, statuses, levels, and subjects
├── schemas/       Zod schemas (auth, course, enrollment, admin)
├── types/         Shared TypeScript types
└── index.ts       Package entry point
```

## License

This project is licensed under the ISC license.
