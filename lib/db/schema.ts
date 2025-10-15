import { pgTable, text, timestamp, integer, serial, jsonb, pgEnum } from 'drizzle-orm/pg-core'

// Enums
export const userStatusEnum = pgEnum('user_status', ['active', 'blocked'])
export const qrStatusEnum = pgEnum('qr_status', ['generated', 'filled'])
export const roleEnum = pgEnum('role', ['syndicate', 'clinic'])

// Admin Users Table (Syndicate)
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').default('syndicate').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Clinic Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  accountNumber: text('account_number').notNull().unique(),
  password: text('password').notNull(),
  clinicName: text('clinic_name').notNull(),
  contactInfo: text('contact_info'),
  status: userStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: text('created_by').notNull(),
})

// QR Code Batches Table
export const qrCodeBatches = pgTable('qr_code_batches', {
  id: serial('id').primaryKey(),
  quantity: integer('quantity').notNull(),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  generatedBy: text('generated_by').notNull(),
  generatedByName: text('generated_by_name').notNull(),
})

// QR Codes Table
export const qrCodes = pgTable('qr_codes', {
  id: serial('id').primaryKey(),
  batchId: integer('batch_id'),
  qrCodeId: text('qr_code_id').notNull().unique(),
  status: qrStatusEnum('status').default('generated').notNull(),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  generatedBy: text('generated_by').notNull(),
})

// Pet Profiles Table (Current State)
export const petProfiles = pgTable('pet_profiles', {
  id: serial('id').primaryKey(),
  qrCodeId: text('qr_code_id').notNull().unique(),
  petName: text('pet_name'),
  species: text('species'),
  breed: text('breed'),
  dateOfBirth: text('date_of_birth'),
  age: text('age'),
  gender: text('gender'),
  color: text('color'),
  microchipNumber: text('microchip_number'),
  ownerName: text('owner_name'),
  ownerPhone: text('owner_phone'),
  ownerEmail: text('owner_email'),
  ownerAddress: text('owner_address'),
  secondaryContact: text('secondary_contact'),
  photoBase64: text('photo_base64'),
  allergies: text('allergies'),
  chronicConditions: text('chronic_conditions'),
  currentMedications: text('current_medications'),
  additionalNotes: text('additional_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastEditedBy: text('last_edited_by'),
  lastEditedByName: text('last_edited_by_name'),
  lastEditedAt: timestamp('last_edited_at'),
})

// Pet Profile Versions Table (Full History)
export const petProfileVersions = pgTable('pet_profile_versions', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').notNull(),
  versionNumber: integer('version_number').notNull(),
  editorId: integer('editor_id'),
  editorName: text('editor_name').notNull(),
  editorRole: text('editor_role').notNull(),
  editedAt: timestamp('edited_at').defaultNow().notNull(),
  petData: jsonb('pet_data').notNull(),
  changeDescription: text('change_description'),
})

// Vaccinations Table (Linked to Versions)
export const vaccinations = pgTable('vaccinations', {
  id: serial('id').primaryKey(),
  versionId: integer('version_id').notNull(),
  vaccinationType: text('vaccination_type').notNull(),
  vaccinationDate: text('vaccination_date').notNull(),
  nextDueDate: text('next_due_date'),
  batchNumber: text('batch_number'),
  notes: text('notes'),
})

// Types
export type AdminUser = typeof adminUsers.$inferSelect
export type NewAdminUser = typeof adminUsers.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type QrCodeBatch = typeof qrCodeBatches.$inferSelect
export type NewQrCodeBatch = typeof qrCodeBatches.$inferInsert
export type QrCode = typeof qrCodes.$inferSelect
export type NewQrCode = typeof qrCodes.$inferInsert
export type PetProfile = typeof petProfiles.$inferSelect
export type NewPetProfile = typeof petProfiles.$inferInsert
export type PetProfileVersion = typeof petProfileVersions.$inferSelect
export type NewPetProfileVersion = typeof petProfileVersions.$inferInsert
export type Vaccination = typeof vaccinations.$inferSelect
export type NewVaccination = typeof vaccinations.$inferInsert

