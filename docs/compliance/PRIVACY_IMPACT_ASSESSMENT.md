# CampusOS Privacy Impact Assessment (PIA)
**Institution:** Rayat Bahra University  
**Application:** CampusOS Academic Experience Platform  
**Data Protection Officer (DPO) Contact:** `dpo@rayatbahrauniversity.edu.in`  
**Date:** October 8, 2026  
**Status:** APPROVED FOR INSTITUTIONAL ROLLOUT  

---

## 1. System Overview & Scope

CampusOS processes student educational data, attendance summaries, event registrations, and curricular competencies. This assessment evaluates personal data flows, retention policies, and user privacy protections to ensure compliance with university data governance policies and applicable data protection legislation.

---

## 2. Personal Data Flow Diagram

```
[ Student / User Browser ]
           |
           | 1. Authenticate via OIDC SSO (PKCE)
           v
[ University IdP (Keycloak) ] ---> Returns ID Token (UID, Roll Number, Email, Name)
           |
           | 2. Session Token stored in Secure HttpOnly Cookie (campusos_session)
           v
[ CampusOS Edge Worker ]
           |
           | 3. Queries authoritative ERP data strictly by token claim UID
           v
[ Rayat Bahra University ERP / SIS Database ]
           |
           | 4. Returns GPA, Attendance, Degree Status
           v
[ CampusOS React SPA ] (Rendered on client; Granular Privacy Controls allow masking)
```

---

## 3. PII Inventory & Minimization Policy

| Data Element | Sensitivity | Processing Purpose | Storage Mechanism | Retention Period |
| :--- | :--- | :--- | :--- | :--- |
| **Student Roll Number (UID)** | Medium | Primary academic identity key | HttpOnly Cookie & Session Cache | Duration of enrollment + 1 semester |
| **Full Legal Name** | Medium | Certificate & diploma generation | Cached locally, encrypted in transit | Active student profile lifetime |
| **Institutional Email** | Medium | Official notices & document approvals | Auth token claims | Active student profile lifetime |
| **Cumulative GPA** | High | Academic portfolio display | Ephemeral in-memory (masked by default on share) | Session duration; refreshed per visit |
| **Attendance Percentage** | High | Coursework eligibility | Ephemeral in-memory (maskable) | Session duration |
| **Skill Submissions** | Low | Faculty review pipeline | Server database | Indefinite (Academic record) |

---

## 4. Student Privacy Rights & Granular Scope Controls

CampusOS implements student-controlled privacy switches:
1. **Right to Mask GPA:** Students can toggle "Display Cumulative GPA" off. External evaluators and peers see `Redacted by Student`.
2. **Right to Mask Attendance:** Students can toggle "Display Attendance Metrics" off.
3. **Right to Redact UID:** Students can mask their roll number (`••••••••••`) on public view.
4. **Right to Forgotten / Cache Purge:** When a student logs out (`POST /api/v1/auth/logout`), all cookies, local application caches, and temporary audit storage are immediately eradicated to prevent cross-account leakage on shared campus computer labs.

---

## 5. Security Safeguards & Redaction Guarantees

- **No Third-Party Tracking:** Zero commercial marketing SDKs, trackers, or ad-tech scripts are loaded.
- **Client-Side SHA-256 Hashing:** Checksums are generated on-device using browser `crypto.subtle`.
- **Telemetry Redaction:** The telemetry module automatically sanitizes all payloads, scrubbing emails, full names, passwords, secrets, and raw tokens into `[REDACTED_PII]` prior to in-memory buffering or error reporting.
- **Edge Audit Logging:** Cloudflare Workers log timestamps, HTTP methods, paths, and client IP addresses for rate limiting and threat detection. In accordance with university data governance, logs are retained in edge streams for a maximum of 7 days before automated deletion.
