import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// In-memory rate limiting map for local dev/preview
const devRateLimitMap = new Map();

function checkDevRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 10;
  let record = devRateLimitMap.get(ip);
  if (!record || now - record.startTime > windowMs) {
    record = { startTime: now, count: 1 };
    devRateLimitMap.set(ip, record);
    return { allowed: true, remaining: maxRequests - 1 };
  }
  record.count += 1;
  if (record.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: maxRequests - record.count };
}

const authoritativeAcademicRecords = {
  RBU21CSE045: {
    uid: 'RBU21CSE045',
    studentId: 'e29f1092-2309-425b-9ff1-91d8487b2938',
    fullName: 'Gulshan Singh',
    email: 'gulshan@rayatbahrauniversity.edu.in',
    department: 'Computer Science & Engineering',
    yearOfStudy: 4,
    degreeStatus: 'Active • Good Academic Standing',
    gpa: 8.8,
    attendance: 92,
    lastSyncBatch: 'SIS Batch #441 • Registrar Validated',
    enrollmentStatus: 'Enrolled Student • Verified by Registrar',
    cohort: '2021-2025',
    verifiedAt: '2026-10-07T10:00:00Z',
    signature: 'MOCK_SIG_SHA256_OFFICIAL_REGISTRAR_2026',
  },
  DEFAULT: {
    uid: 'RBU22CSE101',
    studentId: 'a10b2030-4050-6070-8090-a0b0c0d0e0f0',
    fullName: 'Aarav Sharma',
    email: 'aarav@rayatbahrauniversity.edu.in',
    department: 'Computer Science & Engineering',
    yearOfStudy: 3,
    degreeStatus: 'Active • In Good Standing',
    gpa: 8.4,
    attendance: 88,
    lastSyncBatch: 'SIS Batch #441 • Registrar Validated',
    enrollmentStatus: 'Enrolled Student • Verified by Registrar',
    cohort: '2022-2026',
    verifiedAt: '2026-10-07T10:00:00Z',
    signature: 'MOCK_SIG_SHA256_OFFICIAL_REGISTRAR_2026',
  },
};

const devSkillsSubmissions = [];

function parseAuthToken(req) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookieHeader = req.headers['cookie'] || '';
  const match = cookieHeader.match(/campusos_session=([^;]+)/) || cookieHeader.match(/sb-access-token=([^;]+)/);
  return match ? match[1] : '';
}

function verifyAndExtractClaims(token) {
  if (!token) return null;
  if (token.includes('.')) {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
        return JSON.parse(payloadJson);
      }
    } catch {}
  }
  try {
    return JSON.parse(decodeURIComponent(token));
  } catch {
    if (/^RBU\d{2}[A-Z]{2,4}\d{3}$/i.test(token)) {
      return { uid: token.toUpperCase(), sub: token.toUpperCase() };
    }
    if (token === 'valid_mock_token' || token === 'mock_token_admin') {
      return { uid: 'RBU21CSE045', sub: 'e29f1092-2309-425b-9ff1-91d8487b2938' };
    }
  }
  return null;
}

function configureApiRoutes(server) {
  server.middlewares.use((req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const clientIp = req.socket.remoteAddress || '127.0.0.1';

    // CORS & Security headers
    res.setHeader('Access-Control-Allow-Origin', url.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (url.pathname.startsWith('/api/v1/')) {
      // Structured logging
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          method: req.method,
          path: url.pathname,
          clientIp,
        })
      );

      // Rate limiting: 10 req/min
      const rate = checkDevRateLimit(clientIp);
      if (!rate.allowed) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Retry-After', '60');
        res.end(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded: 10 requests per minute allowed.',
          })
        );
        return;
      }
    }

    // POST /api/v1/auth/logout
    if (url.pathname === '/api/v1/auth/logout' && req.method === 'POST') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Set-Cookie', [
        'campusos_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax',
        'sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax',
      ]);
      res.end(
        JSON.stringify({
          success: true,
          message: 'Logged out successfully. Session invalidated.',
        })
      );
      return;
    }

    // GET /api/v1/student/profile
    if (url.pathname === '/api/v1/student/profile' && req.method === 'GET') {
      const token = parseAuthToken(req);
      if (!token) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
        res.end(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Authentication token required to access academic profile.',
          })
        );
        return;
      }

      // Security check: Ignore ?uid= query param! Always extract from token claims.
      const claims = verifyAndExtractClaims(token);
      if (!claims || !claims.uid) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Forbidden',
            message: 'Invalid or forged authentication token claims.',
          })
        );
        return;
      }

      const requestedUid = claims.uid.toUpperCase();
      const record = authoritativeAcademicRecords[requestedUid] || {
        ...authoritativeAcademicRecords.DEFAULT,
        uid: requestedUid,
        fullName: claims.name || claims.fullName || 'Authenticated Student',
      };

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store, private');
      res.end(JSON.stringify(record));
      return;
    }

    // POST /api/v1/skills/submit
    if (url.pathname === '/api/v1/skills/submit' && req.method === 'POST') {
      const token = parseAuthToken(req);
      if (!token) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
        res.end(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Authentication token required to submit skills for review.',
          })
        );
        return;
      }

      const claims = verifyAndExtractClaims(token);
      if (!claims || !claims.uid) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Forbidden',
            message: 'Invalid token claims.',
          })
        );
        return;
      }

      const handlePayload = (body) => {
        const skillName = typeof body.skillName === 'string' ? body.skillName.trim() : '';
        const category = typeof body.category === 'string' ? body.category.trim() : 'Computer Science & Engineering';
        const proficiencyLevel = body.proficiencyLevel || 'Intermediate';
        const evidenceUrl = typeof body.evidenceUrl === 'string' ? body.evidenceUrl.trim() : undefined;

        if (!skillName || skillName.length < 2) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Bad Request',
              message: 'Skill name must be at least 2 characters.',
            })
          );
          return;
        }

        const submission = {
          id: 'skill-sub-' + Math.random().toString(36).substring(2, 10),
          studentUid: claims.uid,
          skillName,
          category,
          proficiencyLevel,
          evidenceUrl,
          status: 'pending_review',
          submittedAt: new Date().toISOString(),
        };

        devSkillsSubmissions.push(submission);

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            id: submission.id,
            status: 'pending_review',
            skillName: submission.skillName,
            category: submission.category,
            proficiencyLevel: submission.proficiencyLevel,
            submittedAt: submission.submittedAt,
          })
        );
      };

      if ((req as any).body) {
        try {
          const body = typeof (req as any).body === 'string' ? JSON.parse((req as any).body) : (req as any).body;
          handlePayload(body);
          return;
        } catch {}
      }

      const chunks: any[] = [];
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });
      req.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString('utf-8');
          const body = JSON.parse(raw || '{}');
          handlePayload(body);
        } catch (err) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Bad Request', message: 'Invalid JSON payload: ' + (err as any).message }));
        }
      });
      return;
    }

    next();
  });
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'edge-api-dev-middleware',
      configureServer(server) {
        configureApiRoutes(server);
      },
      configurePreviewServer(server) {
        configureApiRoutes(server);
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
