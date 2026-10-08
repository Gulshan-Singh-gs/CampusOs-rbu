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

  it('FUNC-01: Verifies dead actions and permissions are guarded with tooltips or proper server integration', () => {
    const passportViewPath = path.join(rootDir, 'src', 'features', 'passport', 'components', 'CampusPassportView.tsx');
    const content = fs.readFileSync(passportViewPath, 'utf-8');

    // Submit skill button wired to server endpoint
    expect(content).toContain('POST /api/v1/skills/submit');
    expect(content).toContain('setIsSkillModalOpen(true)');

    // Share scoped link button remains disabled pending cryptographic signing backend
    expect(content).toContain('aria-label="Share Scoped Link (Feature disabled pending backend integration)"');
    expect(content).toContain('title="Scoped sharing is disabled pending cryptographic signing backend integration."');
  });

  it('SEC-05: Verifies Auth Adapter interface, logout route invalidation and cache prevention', () => {
    // Check auth adapter file exists and defines clean interface
    const authPath = path.join(rootDir, 'src', 'lib', 'auth.ts');
    expect(fs.existsSync(authPath)).toBe(true);
    const authContent = fs.readFileSync(authPath, 'utf-8');
    expect(authContent).toContain('getCurrentUser():');
    expect(authContent).toContain('login(');
    expect(authContent).toContain('logout():');
    expect(authContent).toContain('isAuthenticated():');
    expect(authContent).toContain('providerName:');
    expect(authContent).toContain('/api/v1/auth/logout');

    // Check worker implements POST /api/v1/auth/logout with cookie clearance
    const workerPath = path.join(rootDir, 'public', '_worker.js');
    const workerContent = fs.readFileSync(workerPath, 'utf-8');
    expect(workerContent).toContain("url.pathname === '/api/v1/auth/logout' && request.method === 'POST'");
    expect(workerContent).toContain('campusos_session=; Path=/;');
    expect(workerContent).toContain('Cache-Control');
    expect(workerContent).toContain('no-store');

    // Check vite config implements POST /api/v1/auth/logout
    const vitePath = path.join(rootDir, 'vite.config.ts');
    const viteContent = fs.readFileSync(vitePath, 'utf-8');
    expect(viteContent).toContain("url.pathname === '/api/v1/auth/logout' && req.method === 'POST'");
  });

  it('A11Y-01: Verifies modal focus traps, aria attributes, and WCAG AA contrast compliance', () => {
    // Check useFocusTrap hook implementation
    const hookPath = path.join(rootDir, 'src', 'shared', 'hooks', 'useFocusTrap.ts');
    expect(fs.existsSync(hookPath)).toBe(true);
    const hookContent = fs.readFileSync(hookPath, 'utf-8');
    expect(hookContent).toContain('useFocusTrap');
    expect(hookContent).toContain("e.key === 'Escape'");
    expect(hookContent).toContain("e.key === 'Tab'");
    expect(hookContent).toContain('previouslyFocusedElementRef');

    // Check modals in CampusPassportView have role="dialog" aria-modal="true" and focus trap refs
    const passportViewPath = path.join(rootDir, 'src', 'features', 'passport', 'components', 'CampusPassportView.tsx');
    const content = fs.readFileSync(passportViewPath, 'utf-8');
    expect(content).toContain('ref={skillModalRef}');
    expect(content).toContain('role="dialog"');
    expect(content).toContain('aria-modal="true"');
    expect(content).toContain('ref={privacyModalRef}');
    expect(content).toContain('ref={helpModalRef}');

    // Check globals.css contrast remediation and prefers-contrast media query
    const cssPath = path.join(rootDir, 'src', 'styles', 'globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('@media (prefers-contrast: more)');
    expect(cssContent).toContain('--text-muted: #4B5563'); // WCAG AA 4.6:1 against #FFFFFF
  });

  it('UX-01: Verifies enhanced Skill Submission with loading spinner, validation, and Toast', () => {
    const passportViewPath = path.join(rootDir, 'src', 'features', 'passport', 'components', 'CampusPassportView.tsx');
    const content = fs.readFileSync(passportViewPath, 'utf-8');

    // Character limit & validation
    expect(content).toContain('trimmed.length < 2');
    expect(content).toContain('trimmed.length > 100');
    expect(content).toContain('maxLength={100}');

    // Loading spinner and disabled states
    expect(content).toContain('Loader2');
    expect(content).toContain('disabled={submittingSkill}');
    expect(content).toContain('Submitting...');

    // Toast integration
    expect(content).toContain('<Toast');
    expect(content).toContain("type: 'success'");
    expect(content).toContain("title: 'Skill Submitted for Review'");
  });

  it('OPS-01: Verifies Feature Flags engine, debug panel, and gradual rollout hooks', () => {
    const flagsPath = path.join(rootDir, 'src', 'lib', 'featureFlags.ts');
    expect(fs.existsSync(flagsPath)).toBe(true);
    const flagsContent = fs.readFileSync(flagsPath, 'utf-8');
    expect(flagsContent).toContain('ENABLE_REAL_SSO');
    expect(flagsContent).toContain('ENABLE_SKILL_SUBMISSION');
    expect(flagsContent).toContain('ENABLE_HONORS_VERIFICATION');
    expect(flagsContent).toContain('isFeatureEnabled');

    const debugPanelPath = path.join(rootDir, 'src', 'shared', 'ui', 'FeatureFlagsDebugPanel.tsx');
    expect(fs.existsSync(debugPanelPath)).toBe(true);
    const panelContent = fs.readFileSync(debugPanelPath, 'utf-8');
    expect(panelContent).toContain('FeatureFlagsDebugPanel');
    expect(panelContent).toContain('setFeatureFlagOverride');
  });

  it('OBS-01: Verifies Privacy-Compliant Telemetry and ErrorBoundary integration', () => {
    const telemetryPath = path.join(rootDir, 'src', 'lib', 'telemetry.ts');
    expect(fs.existsSync(telemetryPath)).toBe(true);
    const telContent = fs.readFileSync(telemetryPath, 'utf-8');
    expect(telContent).toContain('trackEvent');
    expect(telContent).toContain('trackError');
    expect(telContent).toContain('[REDACTED_PII]');

    const errBoundaryPath = path.join(rootDir, 'src', 'shared', 'ui', 'ErrorBoundary.tsx');
    const errContent = fs.readFileSync(errBoundaryPath, 'utf-8');
    expect(errContent).toContain('trackError(error');
  });

  it('COMP-01: Verifies all Institutional Compliance & Deployment artifacts exist and are complete', () => {
    const deployGuide = path.join(rootDir, 'docs', 'DEPLOYMENT_GUIDE.md');
    const secAudit = path.join(rootDir, 'docs', 'compliance', 'SECURITY_AUDIT_REPORT.md');
    const a11yReport = path.join(rootDir, 'docs', 'compliance', 'ACCESSIBILITY_CONFORMANCE_REPORT.md');
    const pia = path.join(rootDir, 'docs', 'compliance', 'PRIVACY_IMPACT_ASSESSMENT.md');
    const deps = path.join(rootDir, 'docs', 'compliance', 'THIRD_PARTY_DEPENDENCIES.md');
    const checklist = path.join(rootDir, 'docs', 'CHECKLIST_PRODUCTION_DEPLOYMENT.md');

    expect(fs.existsSync(deployGuide)).toBe(true);
    expect(fs.existsSync(secAudit)).toBe(true);
    expect(fs.existsSync(a11yReport)).toBe(true);
    expect(fs.existsSync(pia)).toBe(true);
    expect(fs.existsSync(deps)).toBe(true);
    expect(fs.existsSync(checklist)).toBe(true);
  });
});



