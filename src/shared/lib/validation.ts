import { z } from 'zod';

export const DepartmentSchema = z.enum([
  'CSE',
  'ECE',
  'ME',
  'CE',
  'EE',
  'IT',
  'BBA',
  'BCA',
  'MBA',
  'MCA',
  'B.COM',
  'M.Com',
  'Other',
]);

export const RoleSchema = z.enum([
  'student',
  'event_organizer',
  'club_admin',
  'teacher',
  'hod',
  'dsw_admin',
  'super_admin',
]);

export const DocTypeSchema = z.enum(['venue', 'financial', 'noc']);

export const ApplicationStatusSchema = z.enum([
  'Pending Review',
  'Approved',
  'Rejected',
  'Expired',
]);

export const TargetAuthoritySchema = z.enum([
  'Dean of Student Welfare',
  'Financial Aid Committee',
  'Head of Department',
]);

// 1. Profile / Onboarding Validation
export const ProfileInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Valid email address required'),
  rollNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(5, 'Roll number must be at least 5 alphanumeric characters')
    .max(20, 'Roll number cannot exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Roll number must be alphanumeric'),
  department: DepartmentSchema,
  yearOfStudy: z.number().int().min(1).max(6),
});

// 2. RSVP Input Validation
export const RsvpInputSchema = z.object({
  eventId: z.string().uuid('Invalid event UUID'),
  studentName: z.string().trim().min(2).max(100),
  studentEmail: z.string().trim().toLowerCase().email(),
});

// 3. Document Application Input Validation
export const CreateApplicationInputSchema = z.object({
  docType: DocTypeSchema,
  title: z.string().trim().min(3).max(200),
  studentName: z.string().trim().min(2).max(100),
  rollNumber: z.string().trim().toUpperCase().min(5).max(20),
  department: DepartmentSchema,
  email: z.string().trim().toLowerCase().email(),
  targetAuthority: TargetAuthoritySchema,
  formData: z.record(z.unknown()),
});

// 4. Secure QR Ticket Validation
export const QrAttendancePayloadSchema = z.object({
  ticketId: z.string().uuid(),
  eventId: z.string().uuid(),
  rsvpId: z.string().uuid(),
  issuedAt: z.number(),
  expiresAt: z.number(),
  sig: z.string().min(16),
});
