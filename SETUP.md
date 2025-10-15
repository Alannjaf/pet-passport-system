# Pet Passport System - Setup Guide

## Quick Start

Follow these steps to get the Pet Passport System running locally.

### 1. Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database (free tier available at https://neon.tech)
- Git

### 2. Clone and Install

```bash
# Install dependencies
npm install
```

### 3. Database Setup

1. Create a free Neon PostgreSQL database at https://neon.tech
2. Copy your connection string (looks like: `postgresql://user:password@host/database`)

### 4. Environment Configuration

Create a `.env.local` file in the root directory with the following:

```env
# Database - Replace with your Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host/database

# NextAuth - Generate a random secret (see below)
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Admin Login - Set your desired admin credentials
ADMIN_USERNAME=syndicate_admin
ADMIN_PASSWORD=YourSecurePassword123
```

#### Generate NextAuth Secret

Run this command to generate a secure secret:

**Linux/Mac:**

```bash
openssl rand -base64 32
```

**Windows (PowerShell):**

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Push Database Schema

Push the schema to your Neon database:

```bash
npm run db:push
```

This will create all necessary tables.

### 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## First Steps After Setup

### 1. Login as Syndicate Admin

1. Go to http://localhost:3000
2. Click "Login"
3. Enter the `ADMIN_USERNAME` and `ADMIN_PASSWORD` you set in `.env.local`

### 2. Create a Clinic Account

1. In the Syndicate dashboard, go to "Clinics"
2. Click "Add New Clinic"
3. Enter clinic name and contact information
4. **IMPORTANT**: Copy the generated account number and password
5. Give these credentials to the clinic

### 3. Generate QR Codes

1. Go to "QR Generator" in the Syndicate dashboard
2. Enter the number of QR codes you want (e.g., 10)
3. Click "Generate QR Codes"
4. Download as PDF for printing

### 4. Test as Clinic

1. Logout from Syndicate
2. Login with the clinic credentials you created
3. Click "Scan QR Code"
4. Enter one of the generated QR code IDs
5. Fill in a test pet profile

### 5. Test as Pet Owner (Public View)

1. Logout from Clinic
2. Go to http://localhost:3000
3. Click "Scan QR Code"
4. Enter the same QR code ID you used in step 4
5. View the pet profile in read-only mode

## Default Logins

### Syndicate (Admin)

- **Account Number**: Value of `ADMIN_USERNAME` in `.env.local`
- **Password**: Value of `ADMIN_PASSWORD` in `.env.local`

### Clinics

- Created by Syndicate
- Account numbers follow format: `CLN-XXXXX`
- Passwords are randomly generated

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Check that `DATABASE_URL` in `.env.local` is correct
2. Verify your Neon database is active
3. Check that your IP is allowed (Neon allows all IPs by default)

### NextAuth Errors

If you get NextAuth session errors:

1. Make sure `NEXTAUTH_SECRET` is set in `.env.local`
2. Verify `NEXTAUTH_URL` matches your local URL
3. Clear browser cookies and try again

### Build Errors

If you encounter build errors:

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## Database Management

### View Database

Use Drizzle Studio to view and manage your database:

```bash
npm run db:studio
```

This opens a web interface at https://local.drizzle.studio

### Reset Database

To start fresh (WARNING: This deletes all data):

```bash
# Drop all tables and recreate
npm run db:push
```

## Language

The system is available in English only.

## Production Deployment

See README.md for Vercel deployment instructions.

## Support

For issues or questions:

1. Check this setup guide
2. Review the README.md file
3. Check the code comments in key files

## Key Files Reference

- `lib/db/schema.ts` - Database schema
- `lib/auth/auth.ts` - Authentication configuration
- `app/api/*` - API routes
- `messages/*.json` - Translation files
- `components/*` - Reusable components
