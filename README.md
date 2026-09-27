# Learnify API

Backend API for a Learning Management System (LMS). Learnify provides JWT-based authentication, role-based access control, course management, student enrollment, and progress tracking.

## Features

- User signup, login, profile management, password changes, and password reset
- Three roles: `student`, `instructor`, and `admin`
- Course creation, publishing, suspension, activation, and search
- Student enrollment and progress tracking
- Instructor and admin enrollment statistics
- MongoDB persistence with Mongoose
- Request validation with Zod
- Security middleware with Helmet, CORS, and rate limiting
- Centralized API error handling

## Tech Stack

Node.js, TypeScript, Express 5, MongoDB, Mongoose, JWT, Zod, and pnpm.

## Requirements

- Node.js 20 or newer
- pnpm
- A MongoDB database, local or MongoDB Atlas

## Getting Started

```bash
git clone https://github.com/AL-Shewehi/Learnify.git
cd lms-backend
pnpm install
cp .env.example .env
```

Update `.env` with your MongoDB connection string and JWT secret, then start the development server:

```bash
pnpm dev
```

The API runs at `http://localhost:5000` by default. Verify it is running with:

```bash
curl http://localhost:5000/health
```

## Environment Variables

Create a `.env` file in the project root:

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

## Available Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the API with TypeScript watch mode |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run the compiled production server |
| `pnpm lint` | Check the source with ESLint |
| `pnpm lint:fix` | Automatically fix ESLint issues |
| `pnpm clean` | Remove the compiled output |
| `pnpm seed:admin` | Create the default admin account |
| `pnpm fix:indexes` | Rebuild Course MongoDB indexes |

After configuring MongoDB, you can create an admin account with:

```bash
pnpm seed:admin
```

The seed currently creates `admin@lms.com` with password `Admin@12345`. Change this password immediately in any non-local environment.

## API Overview

Base URL: `http://localhost:5000/api/v1`

Protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

### Health

| Method | Endpoint | Auth |
| --- | --- | --- |
| `GET` | `/health` | Public |

### Authentication

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Public | Register a student or instructor |
| `POST` | `/auth/login` | Public | Login and receive a JWT |
| `POST` | `/auth/forgot-password` | Public | Request a password reset email |
| `POST` | `/auth/reset-password/:token` | Public | Set a new password |
| `GET` | `/auth/me` | Any authenticated user | Get the current user |
| `PATCH` | `/auth/update-me` | Any authenticated user | Update name or email |
| `PATCH` | `/auth/change-password` | Any authenticated user | Change password |
| `DELETE` | `/auth/delete-me` | Any authenticated user | Deactivate the account |

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

| Method | Endpoint | Auth |
| --- | --- | --- |
| `GET` | `/courses` | Public, optional JWT |
| `GET` | `/courses/:id` | Public, optional JWT |
| `POST` | `/courses` | Instructor or admin |
| `PATCH` | `/courses/:id` | Course owner or admin |
| `DELETE` | `/courses` | Instructor or admin |
| `PATCH` | `/courses/:id/publish` | Course instructor |
| `PATCH` | `/courses/:id/unpublish` | Course instructor |
| `PATCH` | `/courses/:id/suspend` | Admin |
| `PATCH` | `/courses/:id/activate` | Admin |

Create a course with `title`, `price`, and `level`. The allowed levels are `beginner`, `intermediate`, and `advanced`.

```bash
curl -X POST http://localhost:5000/api/v1/courses \
	-H 'Content-Type: application/json' \
	-H 'Authorization: Bearer <instructor-token>' \
	-d '{"title":"TypeScript Fundamentals","description":"Learn TypeScript from scratch","price":49.99,"subject":"Programming","level":"beginner"}'
```

Course listing supports `page`, `limit`, `subject`, `level`, `sort`, and `search` query parameters. Public users and students see published courses; instructors also see their own drafts, while admins can see all courses.

### Enrollment and Progress

| Method | Endpoint | Auth |
| --- | --- | --- |
| `POST` | `/courses/:courseId/enroll` | Student |
| `GET` | `/enrollments/me` | Student |
| `GET` | `/courses/:courseId/enrollments` | Course instructor or admin |
| `PATCH` | `/courses/:courseId/progress` | Student |

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
src/
├── config/        Database configuration
├── controllers/   Request handlers and business logic
├── middlewares/   Authentication, roles, validation, and errors
├── models/        Mongoose models
├── routes/        Express route definitions
├── seeds/         Admin and index maintenance scripts
├── types/         TypeScript declarations
├── utils/         Shared errors, tokens, email, and helpers
├── app.ts         Express application setup
└── server.ts      Database connection and HTTP server
```

## License

This project is licensed under the ISC license.
