# CLAUDE.md — Pet Passport System

## Project Overview

A veterinary syndicate management system for pet passport registration, QR code tracking, and veterinary membership management. Built for the Kurdistan Region veterinary syndicate.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript 5.9 (strict mode)
- **Database**: Neon PostgreSQL (serverless) via Drizzle ORM
- **Auth**: NextAuth.js v5 (JWT strategy, 8-hour sessions, credentials provider)
- **Styling**: Tailwind CSS 3.4 (utility-first, no component library)
- **Validation**: Zod
- **Email**: Nodemailer (SMTP)
- **PDF**: jsPDF + html-to-image
- **QR**: html5-qrcode (scanner) + qrcode (generator)
- **i18n**: next-intl (English only, infrastructure ready for Kurdish/Arabic)
- **Deployment**: Netlify (configured) or Vercel

## Folder Structure

```
app/                    # Next.js App Router
  api/                  # API route handlers (GET/POST/PATCH/DELETE per route.ts)
  clinic/               # Clinic dashboard pages
  syndicate/            # Admin dashboard pages
  branch/               # Branch office pages
  login/                # Auth page
  scan/                 # QR scanner
  verify/               # Public verification
  apply/                # Public vet application form
components/             # Reusable React components
  forms/                # Form components
  syndicate/            # Syndicate-specific components
lib/
  auth/                 # NextAuth config (auth.ts)
  db/                   # Drizzle schema (schema.ts) and client (index.ts)
  email/                # Email templates and sender
  pdf/                  # PDF generation utilities
  utils/                # Helpers: audit, crypto, date, validation, rate-limit
types/                  # TypeScript type definitions
messages/               # i18n translation files (en.json)
i18n/                   # Internationalization config
drizzle/                # Database migration files
public/                 # Static assets (Logo.svg, fonts)
```

## Coding Conventions

### Naming
- **Files**: kebab-case (`pet-profile.tsx`)
- **Components**: PascalCase (`VetApplicationForm`)
- **Functions**: camelCase (`validateBase64Image`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_BASE64_SIZE`)
- **DB tables/columns**: snake_case (`pet_profiles`, `national_id_number`)

### Imports
- Path alias `@/*` maps to root directory
- Example: `import { db } from '@/lib/db'`, `import { auth } from '@/lib/auth/auth'`

### TypeScript
- Strict mode enabled. Use Drizzle-inferred types: `typeof table.$inferSelect` / `$inferInsert`
- Inline interfaces in component files; shared types in `types/`

## Common Patterns

### Client vs Server Components
- Pages are server components by default (async, can query DB directly)
- Client components use `"use client"` directive and manage state with `useState`/`useEffect`
- Heavy client components use `dynamic(() => import(...))` with loading fallbacks

### API Routes
- Located at `app/api/[resource]/route.ts`
- Always check session with `const session = await auth()`
- Use Drizzle query builder with `eq()`, `and()`, `or()` for conditions
- Return `NextResponse.json(...)` with appropriate status codes
- Rate limiting applied on auth and public submission endpoints

### Authentication & Roles
Three roles: `syndicate` (super admin from env vars), `branch_head` (admin_users table), `clinic` (users table). Route protection via `proxy.ts` middleware. Session includes `role` and `assignedCityIds`.

### Database
- Schema defined in `lib/db/schema.ts` using Drizzle `pgTable`
- Client exported from `lib/db/index.ts` using Neon HTTP adapter
- No foreign key constraints in DB; relationships via ID fields
- Migrations: `npm run db:generate` then `npm run db:migrate`

### Pet Profile Versioning
Edits create a new row in `pet_profile_versions` with the full pet data snapshot (JSONB). The `pet_profiles` table holds the current state.

### Image Handling
- Images are base64-encoded, validated for MIME type (JPEG/PNG/WebP/GIF) and size (5MB max)
- Stored directly in PostgreSQL text/JSONB fields
- Client-side cropping with `react-easy-crop` before upload

### Email
- SMTP via Nodemailer; falls back to console logging if not configured
- HTML templates in `lib/email/send.ts`

## Key Commands

```bash
npm run dev            # Start dev server (Turbopack)
npm run build          # Production build
npm run lint           # ESLint (next/core-web-vitals)
npm run db:generate    # Generate Drizzle migrations
npm run db:migrate     # Run migrations
npm run db:push        # Push schema directly to DB
npm run db:studio      # Open Drizzle Studio GUI
```

## Environment Variables

Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`
Optional: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Notes

- No test framework is set up. No test files exist.
- Primary color is emerald (#059669). UI uses inline Tailwind classes throughout.
- Custom fonts loaded for Arabic/Kurdish script: Rabar.ttf, NotoNaskhArabic.ttf.
- Rate limiting is in-memory (not persistent across restarts).
- Security headers configured in `next.config.ts` (X-Frame-Options, Content-Type-Options, Permissions-Policy).
