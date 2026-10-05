import { describe, it, expect } from 'vitest';
import {
  ProfileInputSchema,
  RsvpInputSchema,
  CreateApplicationInputSchema,
  QrAttendancePayloadSchema,
  ProjectIntentInputSchema,
  StudySessionInputSchema,
  ChatMessageInputSchema,
  StoryInputSchema,
} from '../src/shared/lib/validation';

describe('CampusOS Security Validation Suite', () => {
  it('rejects oversized and malicious profile inputs', () => {
    const maliciousProfile = {
      fullName: 'A'.repeat(150), // exceeds max 100
      email: 'invalid-email',
      rollNumber: 'RBU<script>alert(1)</script>',
      department: 'CSE',
      yearOfStudy: 10, // exceeds max 6
    };

    const result = ProfileInputSchema.safeParse(maliciousProfile);
    expect(result.success).toBe(false);
  });

  it('validates authentic student roll numbers and rejects SQL injection characters', () => {
    const sqlInjectionRoll = {
      fullName: 'Aarav Singh',
      email: 'aarav@rayatbahrauniversity.edu.in',
      rollNumber: "RBU21'; DROP TABLE profiles;--",
      department: 'CSE',
      yearOfStudy: 3,
    };

    const result = ProfileInputSchema.safeParse(sqlInjectionRoll);
    expect(result.success).toBe(false);
  });

  it('enforces UUID validation on RSVP event targets', () => {
    const invalidRsvp = {
      eventId: 'not-a-uuid-1234',
      studentName: 'Aarav Singh',
      studentEmail: 'aarav@gmail.com',
    };

    const result = RsvpInputSchema.safeParse(invalidRsvp);
    expect(result.success).toBe(false);
  });

  it('validates document application schema and authority targets', () => {
    const validApp = {
      docType: 'venue' as const,
      title: 'Auditorium Permission for Annual Cultural Showcase',
      studentName: 'Simran Kaur',
      rollNumber: 'RBU22CSE102',
      department: 'CSE' as const,
      email: 'simran@rayatbahrauniversity.edu.in',
      targetAuthority: 'Dean of Student Welfare' as const,
      formData: {
        venue: 'Main Auditorium',
        expectedAttendance: 500,
      },
    };

    const result = CreateApplicationInputSchema.safeParse(validApp);
    expect(result.success).toBe(true);
  });

  it('validates attendance ticket structure and signed token constraints', () => {
    const ticketPayload = {
      ticketId: 'e0111111-1111-1111-1111-111111111111',
      eventId: 'b0222222-2222-2222-2222-222222222222',
      rsvpId: 'c0333333-3333-3333-3333-333333333333',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      sig: 'a8f9c0e2d4b6a8f9c0e2d4b6',
    };

    const result = QrAttendancePayloadSchema.safeParse(ticketPayload);
    expect(result.success).toBe(true);
  });

  it('enforces validation on squad matching project intents', () => {
    const validIntent = {
      projectTitle: 'Autonomous Solar Drone',
      tagline: 'Embedded flight controller for surveillance',
      description: 'Compete in hackathon with autonomous payload tracking',
      targetRoles: ['Hardware Engineer', 'CV Specialist'],
      requiredSkills: ['Python', 'PX4 Autopilot'],
    };

    const result = ProjectIntentInputSchema.safeParse(validIntent);
    expect(result.success).toBe(true);

    const invalidIntent = {
      projectTitle: 'X', // too short
      tagline: 'Y',
      description: 'Z',
      targetRoles: [],
      requiredSkills: [],
    };
    expect(ProjectIntentInputSchema.safeParse(invalidIntent).success).toBe(false);
  });

  it('validates privacy-first study buddy sessions without coordinates', () => {
    const validSession = {
      subject: 'Operating Systems',
      venue: 'Central Library Floor 2',
      durationHours: 3,
      lookingFor: 'Solving past exam papers',
    };
    const result = StudySessionInputSchema.safeParse(validSession);
    expect(result.success).toBe(true);

    // Reject session longer than max 8 hours
    const invalidSession = {
      subject: 'Operating Systems',
      venue: 'Central Library',
      durationHours: 24,
    };
    expect(StudySessionInputSchema.safeParse(invalidSession).success).toBe(false);
  });

  it('enforces chat message boundaries and room UUID validation', () => {
    const validMsg = {
      roomId: '11111111-1111-1111-1111-111111111111',
      content: 'Hello project squad!',
    };
    expect(ChatMessageInputSchema.safeParse(validMsg).success).toBe(true);

    const emptyMsg = {
      roomId: '11111111-1111-1111-1111-111111111111',
      content: '   ',
    };
    expect(ChatMessageInputSchema.safeParse(emptyMsg).success).toBe(false);
  });

  it('validates 24-hr story media payload and URL safety', () => {
    const validStory = {
      mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
      caption: 'Hackathon launch in Main Auditorium!',
    };
    expect(StoryInputSchema.safeParse(validStory).success).toBe(true);

    const invalidStory = {
      mediaUrl: 'not-a-valid-url',
      caption: 'Story',
    };
    expect(StoryInputSchema.safeParse(invalidStory).success).toBe(false);
  });
});
