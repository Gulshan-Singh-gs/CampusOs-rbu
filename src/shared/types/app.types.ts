// src/shared/types/app.types.ts
// Domain layer — clean architecture, no database or framework dependencies

export type Department =
  | 'CSE'
  | 'ECE'
  | 'ME'
  | 'CE'
  | 'EE'
  | 'IT'
  | 'BBA'
  | 'BCA'
  | 'MBA'
  | 'MCA'
  | 'B.COM'
  | 'M.Com'
  | 'Other';

export type ClubCategory =
  | 'Cultural'
  | 'Technical'
  | 'Sports'
  | 'Literary'
  | 'Social'
  | 'Other';

export type EventCategory = 'Cultural' | 'Technical' | 'Sports';

export type BannerGradient = 'cultural' | 'technical' | 'sports' | 'default';

export type DocType = 'venue' | 'financial' | 'noc';

export type ApplicationStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'Expired';

export type TargetAuthority =
  | 'Dean of Student Welfare'
  | 'Financial Aid Committee'
  | 'Head of Department';

export type UserRole =
  | 'student'
  | 'event_organizer'
  | 'club_admin'
  | 'teacher'
  | 'hod'
  | 'dsw_admin'
  | 'super_admin';

export interface AuditLog {
  readonly id: string;
  readonly actorId: string | null;
  readonly actorEmail: string | null;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string | null;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
}

export interface AttendanceTicket {
  readonly id: string;
  readonly eventId: string;
  readonly rsvpId: string;
  readonly studentId: string;
  readonly ticketToken: string;
  readonly isRedeemed: boolean;
  readonly expiresAt: string;
  readonly createdAt: string;
}

// ---- Profile -------------------------------------------------

export interface Profile {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly rollNumber: string;
  readonly department: Department;
  readonly yearOfStudy: number;
  readonly role?: UserRole;
  readonly isVerified?: boolean;
  readonly createdAt: string;
}

export interface CreateProfileInput {
  fullName: string;
  email: string;
  rollNumber: string;
  department: Department;
  yearOfStudy: number;
  role?: UserRole;
}

// ---- Club ----------------------------------------------------

export interface Club {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly category: ClubCategory;
  readonly description: string;
  readonly leadName: string;
  readonly memberCount: number;
  readonly icon: string | null;
}

// ---- Event ---------------------------------------------------

export interface CampusEvent {
  readonly id: string;
  readonly clubId: string;
  readonly title: string;
  readonly category: EventCategory;
  readonly description: string;
  readonly venue: string;
  readonly eventDate: string; // "YYYY-MM-DD"
  readonly eventTime: string; // "HH:MM"
  readonly rsvpCount: number;
  readonly bannerGradient: BannerGradient;
}

// ---- RSVP ----------------------------------------------------

export interface EventRsvp {
  readonly id: string;
  readonly eventId: string;
  readonly studentName: string;
  readonly studentEmail: string;
  readonly createdAt: string;
}

// ---- Application ---------------------------------------------

export interface DocumentApplication {
  readonly id: string;
  readonly docType: DocType;
  readonly title: string;
  readonly studentName: string;
  readonly rollNumber: string;
  readonly department: Department;
  readonly targetAuthority: TargetAuthority;
  readonly status: ApplicationStatus;
  readonly createdDate: string;
  readonly trackingRef: string;
  readonly formData: Record<string, unknown>;
  readonly createdAt: string;
}

export interface CreateApplicationInput {
  docType: DocType;
  title: string;
  studentName: string;
  rollNumber: string;
  department: Department;
  email: string;
  targetAuthority: TargetAuthority;
  formData: Record<string, unknown>;
}
