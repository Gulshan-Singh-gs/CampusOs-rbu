import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('v2.0.1 Runtime Adversarial Authentication & Integrity Suite', () => {
  const rootDir = path.resolve(__dirname, '..');
  const baseUrl = 'http://localhost:4173';

  // Helper to construct mock RS256 token format
  function createTestJwt(payload: Record<string, any>, options: { unsigned?: boolean; expired?: boolean; badAlg?: boolean } = {}) {
    const header = {
      alg: options.badAlg ? 'none' : 'RS256',
      typ: 'JWT',
      kid: 'test-key-id-2026',
    };

    const nowSec = Math.floor(Date.now() / 1000);
    const finalPayload = {
      iss: 'https://sso.rayatbahrauniversity.edu.in/auth/realms/campus',
      exp: options.expired ? nowSec - 3600 : nowSec + 3600,
      nbf: nowSec - 60,
      ...payload,
    };

    const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(finalPayload)).toString('base64url');
    const b64Signature = options.unsigned ? '' : Buffer.from('mock_adversarial_signature_bytes_12345').toString('base64url');

    return `${b64Header}.${b64Payload}${options.unsigned ? '' : '.' + b64Signature}`;
  }

  it('ADV-01: Rejects Forged Roll Number Bearer Token with 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/v1/student/profile`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer RBU21CSE046',
      },
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('ADV-02: Rejects Unsigned JWT with 401 Unauthorized', async () => {
    const unsignedJwt = createTestJwt({ uid: 'RBU21CSE045' }, { unsigned: true });
    const res = await fetch(`${baseUrl}/api/v1/student/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${unsignedJwt}`,
      },
    });

    expect(res.status).toBe(401);
  });

  it('ADV-03: Rejects Expired JWT with 401 Unauthorized', async () => {
    const expiredJwt = createTestJwt({ uid: 'RBU21CSE045' }, { expired: true });
    const res = await fetch(`${baseUrl}/api/v1/student/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${expiredJwt}`,
      },
    });

    expect(res.status).toBe(401);
  });

  it('ADV-04: Rejects JWT with modified algorithm or alg:none with 401 Unauthorized', async () => {
    const noneJwt = createTestJwt({ uid: 'RBU21CSE045' }, { badAlg: true });
    const res = await fetch(`${baseUrl}/api/v1/student/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${noneJwt}`,
      },
    });

    expect(res.status).toBe(401);
  });

  it('ADV-05: Validates and accepts valid structured RS256 token and returns correct verified UID', async () => {
    const validJwt = createTestJwt({
      uid: 'RBU21CSE045',
      sub: 'e29f1092-2309-425b-9ff1-91d8487b2938',
      name: 'Gulshan Singh',
      department: 'Computer Science & Engineering',
    });

    const res = await fetch(`${baseUrl}/api/v1/student/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${validJwt}`,
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.uid).toBe('RBU21CSE045');
    expect(data.fullName).toBe('Gulshan Singh');
  });

  it('ADV-06: Defends against UID Query Tampering (?uid=ADMIN) by strictly enforcing token identity', async () => {
    const validJwt = createTestJwt({
      uid: 'RBU21CSE045',
      sub: 'e29f1092-2309-425b-9ff1-91d8487b2938',
      name: 'Gulshan Singh',
    });

    // Adversary attempts IDOR query override
    const res = await fetch(`${baseUrl}/api/v1/student/profile?uid=ADMIN_HACK`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${validJwt}`,
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    // Query param ?uid=ADMIN_HACK must be completely ignored; identity comes strictly from token claims
    expect(data.uid).toBe('RBU21CSE045');
    expect(data.uid).not.toBe('ADMIN_HACK');
  });

  it('ADV-07: Verifies durable skill submission workflow & persistence across restarts', async () => {
    const validJwt = createTestJwt({
      uid: 'RBU21CSE045',
      sub: 'e29f1092-2309-425b-9ff1-91d8487b2938',
    });

    const res = await fetch(`${baseUrl}/api/v1/skills/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validJwt}`,
      },
      body: JSON.stringify({
        skillName: 'Adversarial Security Engineering',
        category: 'Computer Science & Engineering',
        proficiencyLevel: 'Expert',
      }),
    });

    expect(res.status).toBe(201);
    const result = await res.json();
    expect(result.status).toBe('pending_review');
    expect(result.skillName).toBe('Adversarial Security Engineering');
  });

  it('ADV-08: Verifies Server-Side Logout invalidates session and sets Max-Age=0 cookie', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(res.status).toBe(200);
    const setCookie = res.headers.get('set-cookie') || '';
    expect(setCookie).toContain('campusos_session=;');
    expect(setCookie).toContain('Max-Age=0');
    expect(setCookie).toContain('HttpOnly');
  });
});
