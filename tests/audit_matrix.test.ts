import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('SEC & FUNC Post-Containment Defect Audit Suite', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('SEC-01: Verifies Edge Auth Gate in _worker.js and App route boundary', () => {
    const workerPath = path.join(rootDir, 'public', '_worker.js');
    expect(fs.existsSync(workerPath)).toBe(true);

    const workerContent = fs.readFileSync(workerPath, 'utf-8');
    // Verifies edge intercept on /passport
    expect(workerContent).toContain("url.pathname === '/passport'");
    expect(workerContent).toContain('Response.redirect');
    expect(workerContent).toContain('302');
    expect(workerContent).toContain('401');

    // Verifies client-side RequireAuth boundary in App.tsx
    const appPath = path.join(rootDir, 'src', 'App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf-8');
    expect(appContent).toContain('<RequireAuth>');
  });

  it('SEC-02: Confirms complete elimination of fabricated cryptographic claims', () => {
    const srcDir = path.join(rootDir, 'src');
    const walkFiles = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(walkFiles(fullPath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.html')) {
          results.push(fullPath);
        }
      });
      return results;
    };

    const files = walkFiles(srcDir);
    for (const f of files) {
      const content = fs.readFileSync(f, 'utf-8');
      expect(content).not.toContain('SHA256-RBU-PASSPORT-2026');
      expect(content).not.toContain('ed25519-valid');
      expect(content).not.toContain('Zero-Trust');
      expect(content).not.toContain('Officially Verified');
    }
  });

  it('SEC-03: Verifies client-side IDOR prevention and user authorization integrity', () => {
    const passportViewPath = path.join(rootDir, 'src', 'features', 'passport', 'components', 'CampusPassportView.tsx');
    const content = fs.readFileSync(passportViewPath, 'utf-8');

    // Check that isSelf strictly validates loggedInProfile against targetUid
    expect(content).toContain('const isSelf = useMemo(');
    expect(content).toContain('loggedInProfile?.rollNumber?.toUpperCase() === targetUid.toUpperCase()');
    
    // Check that sensitive controls (privacy, skill submission) are restricted to isSelf
    expect(content).toContain('{isSelf && (');
  });

  it('SEC-04: Confirms all strict security headers are configured in _headers and _worker.js', () => {
    const headersPath = path.join(rootDir, 'public', '_headers');
    expect(fs.existsSync(headersPath)).toBe(true);
    const headersContent = fs.readFileSync(headersPath, 'utf-8');

    expect(headersContent).toContain('X-Frame-Options: SAMEORIGIN');
    expect(headersContent).toContain('X-Content-Type-Options: nosniff');
    expect(headersContent).toContain('Referrer-Policy: strict-origin-when-cross-origin');
    expect(headersContent).toContain('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    expect(headersContent).toContain('Content-Security-Policy:');
    expect(headersContent).toContain('Permissions-Policy:');
  });

  it('FUNC-01: Verifies dead actions are disabled with aria-disabled and tooltips', () => {
    const passportViewPath = path.join(rootDir, 'src', 'features', 'passport', 'components', 'CampusPassportView.tsx');
    const content = fs.readFileSync(passportViewPath, 'utf-8');

    // Submit skill button
    expect(content).toContain('aria-label="Submit Skill for Review (Feature unavailable - backend integration pending)"');
    expect(content).toContain('aria-disabled="true"');
    expect(content).toContain('disabled');

    // Share scoped link button
    expect(content).toContain('aria-label="Share Scoped Link (Feature disabled pending backend integration)"');
    expect(content).toContain('title="Scoped sharing is disabled pending cryptographic signing backend integration."');
  });
});
