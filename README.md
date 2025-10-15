# Pet Passport System

A comprehensive pet health management and digital passport solution built with Next.js 14, featuring three user roles: Syndicate (Admin), Registered Clinics, and Pet Owners.

## Features

### For Syndicate (Admin)

- Create and manage clinic accounts
- Generate bulk QR codes for pet passports
- View complete version history of all pet profiles
- Block/unblock clinic accounts
- Reset clinic passwords

### For Clinics

- Create and edit pet profiles
- Track vaccinations and medical history
- View all pets they've worked with
- Upload pet photos

### For Pet Owners

- View pet profiles by scanning QR codes
- See vaccination history and medical records
- Access pet information anytime, anywhere

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **QR Codes**: qrcode, html5-qrcode
- **PDF Generation**: jsPDF

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=your_neon_postgres_connection_string

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Admin Credentials
ADMIN_USERNAME=syndicate_admin
ADMIN_PASSWORD=secure_password_123
```

### 3. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

### 4. Set Up Database

Push the schema to your Neon database:

```bash
npm run db:push
```

Or generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

- **admin_users**: Syndicate admin accounts
- **users**: Clinic accounts
- **qr_codes**: Generated QR codes
- **pet_profiles**: Current state of each pet
- **pet_profile_versions**: Full edit history with version control
- **vaccinations**: Vaccination records per version

## User Roles & Workflows

### Syndicate Workflow

1. Login with admin credentials (set in .env.local)
2. Add clinic accounts (system generates account number and password)
3. Generate QR codes in bulk
4. Print QR codes as stickers
5. Monitor all pet profiles and version history

### Clinic Workflow

1. Login with account number and password provided by syndicate
2. Scan QR code to create or edit pet profile
3. Fill in pet information, vaccinations, medical history
4. Upload pet photo (converted to base64, max 2MB)
5. Save profile (creates new version)

### Pet Owner Workflow

1. Scan QR code on pet's passport
2. View pet profile with all information
3. See vaccination status and medical history
4. Download/share QR code

## Language

The system is available in English only.

## Version History

Every edit to a pet profile creates a new version that includes:

- Version number
- Editor name and role
- Timestamp
- Complete snapshot of all data
- List of vaccinations at that point in time

The syndicate can view all versions, while clinics and owners only see the current version.

## API Routes

- `POST /api/clinics` - Create clinic
- `PATCH /api/clinics/[id]` - Update clinic (block/unblock/reset password)
- `DELETE /api/clinics/[id]` - Delete clinic
- `POST /api/qr/generate` - Generate QR codes
- `POST /api/pets` - Create pet profile
- `PUT /api/pets` - Update pet profile

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Run database migrations if needed

### Environment Variables (Production)

Make sure to set all environment variables in your Vercel project settings:

- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL (your production URL)
- ADMIN_USERNAME
- ADMIN_PASSWORD

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Server-side validation
- CSRF protection via NextAuth
- SQL injection protection via Drizzle ORM
- XSS protection

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

ISC

## Support

For password reset or account issues, clinics should contact the syndicate administrator.
