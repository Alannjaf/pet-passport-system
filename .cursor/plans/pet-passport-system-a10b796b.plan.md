<!-- a10b796b-971f-4fec-a95f-a8ac974ac019 d7bf6732-2fe4-409a-881c-0abe36373a5e -->
# Pet Profile & Passport System - Implementation Plan

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 with credentials provider
- **Styling**: Tailwind CSS + shadcn/ui components
- **QR Codes**: qrcode library for generation, html5-qrcode for scanning
- **i18n**: next-intl for 3 languages (Kurdish Sorani, Arabic, English)
- **Deployment**: Vercel

## Database Schema (Drizzle ORM)

### Tables:

1. **users** - Clinic accounts

   - id, accountNumber (unique), password (hashed), clinicName, contactInfo, status (active/blocked), createdAt, createdBy (syndicate)

2. **pet_profiles** - Current state of each pet

   - id, qrCodeId (unique), petName, species, breed, age, ownerInfo, photoBase64, createdAt, updatedAt

3. **pet_profile_versions** - Full edit history

   - id, profileId (FK), versionNumber, editorId (clinic FK), editorName, editedAt, petData (JSONB with all fields), changeDescription

4. **vaccinations** - Vaccination records per version

   - id, versionId (FK), vaccinationType, vaccinationDate, nextDueDate, notes

5. **qr_codes** - QR tracking

   - id, qrCodeId (unique UUID), status (generated/filled), generatedAt, generatedBy

6. **admin_users** - Syndicate accounts

   - id, username, password (hashed), role ('syndicate')

## Project Structure

```
/app
  /(auth)
    /login - Unified login page
    /layout.tsx - Auth layout
  /(syndicate)
    /dashboard - Admin dashboard
    /clinics - Manage clinics (add/view/delete/block)
    /qr-generator - Bulk QR generation & download
    /history/[profileId] - View full version history
    /layout.tsx - Syndicate layout with nav
  /(clinic)
    /dashboard - Clinic dashboard
    /pets - View pets filled by this clinic
    /pets/[id]/edit - Edit pet profile
    /layout.tsx - Clinic layout with nav
  /(public)
    / - Landing page (multilingual)
    /scan/[qrCodeId] - QR scan endpoint
    /view/[profileId] - Pet owner view (read-only)
  /api
    /auth/[...nextauth] - NextAuth config
    /qr/generate - Generate QR codes
    /pets/[id] - CRUD operations
    /clinics - Clinic management
/components
  /ui - shadcn components
  /forms - PetProfileForm, VaccinationForm
  /qr - QRGenerator, QRScanner
  /layouts - Headers, Footers, Nav
/lib
  /db - Drizzle schema & client
  /auth - NextAuth config & helpers
  /i18n - Translation files
/messages
  /en.json, /ar.json, /ckb.json (Kurdish Sorani)
```

## Key Implementation Details

### 1. Landing Page

- Beautiful hero section with pet images
- Features showcase (3 stakeholder sections)
- Language switcher (EN/AR/CKB) in header
- RTL support for Arabic
- CTA buttons: "Clinic Login", "Scan QR Code"

### 2. Authentication Flow (NextAuth.js)

- Credentials provider with role-based routing
- Syndicate: Hardcoded credentials or env variables (ADMIN_USERNAME, ADMIN_PASSWORD)
- Clinics: Account number + password validation against users table
- Session includes: userId, role (syndicate/clinic), clinicName
- Middleware for route protection: /syndicate/ *requires syndicate role, /clinic/* requires clinic role

### 3. Syndicate Dashboard Features

- **Add Clinic**: Generate account number (e.g., CLN-XXXXX), random password, email credentials
- **Manage Clinics**: Table view with block/unblock, delete, reset password
- **Bulk QR Generation**: 
  - Input: quantity (e.g., 100)
  - Generate UUIDs, insert into qr_codes table
  - Create QR codes with URL: `{domain}/scan/{qrCodeId}`
  - Download as PDF sheet or ZIP of individual PNGs
- **View Version History**: For any pet profile, see all versions with diff highlighting

### 4. QR Scan & Pet Profile Creation

- `/scan/[qrCodeId]` checks:
  - If qrCodeId doesn't exist in DB → Create new record in qr_codes + pet_profiles (status: empty)
  - Check user session:
    - **No session (public)**: 
      - If profile empty → Show "This QR needs to be activated by a clinic"
      - If profile filled → Redirect to `/view/[profileId]` (read-only view)
    - **Clinic session**:
      - If profile empty → Redirect to `/clinic/pets/new?qrCodeId={id}` (create form)
      - If profile filled → Redirect to `/clinic/pets/[id]/edit` (edit form, create new version)
    - **Syndicate session**: Same as clinic but with full access

### 5. Pet Profile Form (Clinic/Syndicate)

**Fields:**

- Basic Info: Pet name*, species*, breed, date of birth/age*, gender, color, microchip number
- Owner Info: Owner name*, phone*, email, address, secondary contact
- Photo: Image upload (convert to base64, max 2MB)
- Vaccinations: Dynamic list
  - Type* (dropdown: Rabies, Parvo, Distemper, FVRCP, etc.)
  - Date administered*, Next due date, Batch number, Notes
- Medical History: Allergies, chronic conditions, current medications
- Notes: Additional clinic notes (text area)

**Save Logic:**

1. Insert/update pet_profiles table (current state)
2. Insert new row in pet_profile_versions with versionNumber = previous + 1
3. Insert vaccinations linked to version
4. Update qr_codes status to 'filled'
5. Toast success: "Pet profile saved successfully"

### 6. Clinic Dashboard

- Welcome header with clinic name
- Stats: Total pets filled by this clinic
- Recent pets table: Pet name, Species, Last edited, Actions (View, Edit)
- Filter/search functionality

### 7. Pet Owner View (Public Read-Only)

- Beautiful card-based layout
- Pet photo (large)
- Basic information grid
- Vaccination timeline with visual indicators (due soon, overdue)
- QR code display (for re-sharing)
- Language switcher
- "Last updated by [Clinic Name] on [Date]"
- Download as PDF button

### 8. Multilingual Support (next-intl)

**Setup:**

- Middleware to detect locale from URL or browser
- Translation files in `/messages/{locale}.json`
- Kurdish Sorani (ckb): Right-to-left support
- Arabic (ar): Right-to-left support  
- English (en): Default
- All forms, labels, buttons, errors translated

**Challenges:**

- RTL CSS adjustments for Arabic/Kurdish
- Date formatting per locale
- Number formatting

### 9. Version History View (Syndicate Only)

- `/syndicate/history/[profileId]`
- Timeline view showing all versions
- Each version card shows:
  - Version number, Editor (clinic name), Date/time
  - Changed fields highlighted
  - Expand to see full data snapshot
- Compare versions side-by-side

### 10. Security & Validation

- Server-side validation with Zod schemas
- Rate limiting on auth endpoints
- XSS protection (sanitize user inputs)
- SQL injection protection (Drizzle ORM parameterized queries)
- Image size validation (max 2MB, convert to base64)
- CSRF protection via NextAuth
- Secure password hashing (bcrypt)

## Environment Variables

```env
DATABASE_URL=neon_postgres_connection_string
NEXTAUTH_SECRET=random_secret_key
NEXTAUTH_URL=http://localhost:3000
ADMIN_USERNAME=syndicate_admin
ADMIN_PASSWORD=secure_password
```

## Deployment Steps

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy
5. Run database migrations via Drizzle Kit

## Testing Checklist

- [ ] Syndicate can create clinic accounts
- [ ] Clinic can login with account number
- [ ] Bulk QR generation works (10+ codes)
- [ ] QR scan redirects correctly based on user role
- [ ] Pet profile creation saves all fields + version
- [ ] Editing creates new version, keeps history
- [ ] Pet owner sees read-only view
- [ ] All 3 languages display correctly
- [ ] RTL works for Arabic/Kurdish
- [ ] Password reset by syndicate works
- [ ] Blocked clinics cannot login
- [ ] Image upload converts to base64

### To-dos

- [ ] Initialize Next.js 14 project with TypeScript, Tailwind CSS, and install dependencies (NextAuth, Drizzle ORM, next-intl, qrcode, shadcn/ui)
- [ ] Configure Neon PostgreSQL connection, create Drizzle schema with all 6 tables, and run migrations
- [ ] Implement NextAuth.js with credentials provider, role-based session, and middleware for route protection
- [ ] Configure next-intl with 3 languages (en/ar/ckb), create translation files, and add RTL support
- [ ] Create multilingual landing page with hero section, features, and language switcher
- [ ] Build syndicate dashboard: clinic management (CRUD), bulk QR generator, and version history viewer
- [ ] Implement QR scan endpoint with role-based redirection and auto-creation of pet profile records
- [ ] Create pet profile form with all fields, image upload (base64), vaccinations, and version creation logic
- [ ] Build clinic dashboard with pet list, search/filter, and edit functionality
- [ ] Create read-only pet owner view with beautiful UI, vaccination timeline, and PDF download
- [ ] Test all workflows, fix bugs, add loading states, and deploy to Vercel