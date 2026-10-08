# CampusOS Final Pre-Deployment Institutional Checklist
**Project:** CampusOS — Rayat Bahra University Academic Platform  
**Target Hostname:** `campusos.rayatbahrauniversity.edu.in`  
**Deployment Platform:** Cloudflare Pages & Global Edge Workers  
**Target Release Date:** October 2026  

---

## 1. Domain, DNS & TLS Provisioning
- [x] **Primary Domain Routing:** Map `campusos.rayatbahrauniversity.edu.in` CNAME to `campusos-rbu-owv.pages.dev` in University DNS zone.
- [x] **Cloudflare SSL/TLS:** Universal SSL configured with TLS 1.3 Minimum, Full (Strict) encryption mode, and automatic HTTP $\rightarrow$ HTTPS redirection.
- [x] **HSTS Preload:** Strict-Transport-Security header configured: `max-age=31536000; includeSubDomains; preload` in `_headers`.

---

## 2. Cloudflare Pages Secrets & Environment Variables
- [x] **Driver Configuration:** Set `VITE_AUTH_PROVIDER=oidc` (or `mock` for staging verification).
- [x] **IdP Issuer Endpoint:** Set `VITE_OIDC_ISSUER_URL=https://sso.rayatbahrauniversity.edu.in/auth/realms/campus`.
- [x] **Client ID:** Set `VITE_OIDC_CLIENT_ID=campusos-web-client`.
- [x] **Callback URI:** Set `VITE_OIDC_REDIRECT_URI=https://campusos.rayatbahrauniversity.edu.in/auth/callback`.
- [x] **Feature Flags:** Set `VITE_FEATURE_FLAGS={"ENABLE_REAL_SSO":true,"ENABLE_SKILL_SUBMISSION":true,"ENABLE_HONORS_VERIFICATION":false}`.

---

## 3. Security, Access Control & Edge Headers
- [x] **Security Headers Active:** `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] **Auth Cache Invalidation:** `Cache-Control: no-store, no-cache, must-revalidate` active on all `/api/v1/*` endpoints.
- [x] **Edge Rate Limiting:** Enforce 10 req/min limit per IP on `/api/v1/*` routes to safeguard university ERP backend systems from abusive request patterns.
- [x] **Server-side Logout:** `POST /api/v1/auth/logout` invalidates session and issues expired cookie headers.

---

## 4. Accessibility & User Experience
- [x] **WCAG 2.1 AA Compliance:** Contrast ratio $\ge 4.5:1$ across all text tokens in light and dark modes.
- [x] **Focus Traps Verified:** Modal dialogs trap Tab/Shift+Tab, close on Escape, and restore focus to trigger buttons.
- [x] **Real-Time Skill Submission:** Submit button displays loading spinner, disables during transit, preserves form inputs on error, and confirms via toast notification upon success.
- [x] **High Contrast Support:** `@media (prefers-contrast: more)` styles enabled.

---

## 5. Observability, Monitoring & Disaster Recovery
- [x] **Edge Audit Logging:** Worker emits structured JSON logs including timestamp, method, path, and client IP.
- [x] **Frontend Telemetry:** Anonymized, PII-sanitized telemetry module captures auth lifecycle and unhandled errors via ErrorBoundary.
- [x] **Emergency SSO Fallback:** In case of university IdP outage, switch `VITE_FEATURE_FLAGS` to `{"ENABLE_REAL_SSO":false}` and redeploy in $< 45$ seconds.
- [x] **Registrar & IT Contacts Published:** Support emails and escalation channels documented in Deployment Handbook.
