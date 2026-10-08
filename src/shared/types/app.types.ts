// src/shared/types/app.types.ts
// Domain layer — clean architecture, enterprise domain model for CampusOS

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

export interface DepartmentEntity {
  readonly id: string;
  readonly name: string;
  readonly facultyHead: string | null;
  readonly code: string;
}

export type ClubCategory =
  | 'Cultural'
  | 'Technical'
  | 'Sports'
  | 'Literary'
  | 'Social'
  | 'Other';

export type EventCategory = 'Cultural' | 'Technical' | 'Sports';

export type EventLifecycle = 'draft' | 'published' | 'cancelled' | 'completed' | 'archived';

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

// ---- Profile & Passport ---------------------------------------

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly category: string;
}

export interface StudentSkill {
  readonly id: string;
  readonly studentId: string;
  readonly skillId: string;
  readonly skillName: string;
  readonly category?: string;
  readonly proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  readonly endorsementCount: number;
  readonly endorsedBy?: string;
  readonly evidenceUrl?: string;
  readonly status?: 'pending_review' | 'verified' | 'rejected';
  readonly submittedAt?: string;
}

export interface StudentAchievement {
  readonly id: string;
  readonly studentId: string;
  readonly title: string;
  readonly issuer: string;
  readonly issueDate: string;
  readonly badgeIcon: string;
  readonly isVerified: boolean;
  readonly certificateId?: string;
}

export interface Profile {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly rollNumber: string;
  readonly department: Department;
  readonly yearOfStudy: number;
  readonly role?: UserRole;
  readonly isVerified?: boolean;
  readonly avatarUrl?: string;
  readonly bio?: string;
  readonly githubUrl?: string;
  readonly linkedinUrl?: string;
  readonly createdAt: string;
  // Academic Metrics & Standing (Server authoritative)
  readonly gpa?: number | null;
  readonly attendance?: number | null;
  readonly degreeStatus?: string;
  readonly lastSyncBatch?: string;
  readonly enrollmentStatus?: string;
  readonly cohort?: string;
  // Campus Passport relational aggregations
  readonly skills?: StudentSkill[];
  readonly achievements?: StudentAchievement[];
}

export interface CreateProfileInput {
  fullName: string;
  email: string;
  rollNumber: string;
  department: Department;
  yearOfStudy: number;
  role?: UserRole;
  bio?: string;
  avatarUrl?: string;
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
  readonly startsAt?: string; // Canonical ISO timestamp
  readonly endsAt?: string;   // Canonical ISO timestamp
  readonly lifecycleStatus?: EventLifecycle;
  readonly maxCapacity?: number;
  readonly rsvpCount: number;
  readonly bannerGradient: BannerGradient;
  readonly coordinates?: { lat: number; lng: number };
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

// ---- Social Graph & Connections ------------------------------

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Connection {
  readonly id: string;
  readonly requesterId: string;
  readonly recipientId: string;
  readonly status: ConnectionStatus;
  readonly createdAt: string;
  readonly peerProfile?: Partial<Profile>;
}

// ---- Squad Matching & Intents --------------------------------

export interface ProjectIntent {
  readonly id: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly authorDepartment: Department;
  readonly projectTitle: string;
  readonly tagline: string;
  readonly description: string;
  readonly targetRoles: string[];
  readonly requiredSkills: string[];
  readonly isActive: boolean;
  readonly createdAt: string;
}

// ---- Ephemeral Realtime Chat ---------------------------------

export interface ChatMessage {
  readonly id: string;
  readonly roomId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly content: string;
  readonly createdAt: string;
}

export interface ChatRoom {
  readonly id: string;
  readonly title: string;
  readonly isEphemeral: boolean;
  readonly expiresAt?: string;
  readonly members?: Profile[];
  readonly lastMessage?: ChatMessage;
}

// ---- Campus Stories ------------------------------------------

export interface Story {
  readonly id: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly authorAvatar?: string;
  readonly mediaUrl: string;
  readonly caption?: string;
  readonly expiresAt: string;
  readonly createdAt: string;
}

// ---- Study Buddy Radar ---------------------------------------

export interface StudySession {
  readonly id: string;
  readonly studentId: string;
  readonly studentName: string;
  readonly department: Department;
  readonly subject: string;
  readonly venue: string;
  readonly availableUntil: string;
  readonly lookingFor?: string;
  readonly isActive: boolean;
  readonly createdAt: string;
}

// ---- Notifications -------------------------------------------

export interface NotificationItem {
  readonly id: string;
  readonly recipientId: string;
  readonly title: string;
  readonly body: string;
  readonly category: 'rsvp' | 'connection' | 'chat' | 'application' | 'system';
  readonly linkUrl?: string;
  readonly isRead: boolean;
  readonly createdAt: string;
}
