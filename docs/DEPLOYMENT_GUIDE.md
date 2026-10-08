# CampusOS Institutional Deployment Handbook
**Document Version:** 1.0.0 (Production Release)  
**Target Audience:** Rayat Bahra University IT Directorate & Infrastructure Engineers  
**Classification:** Confidential • Institutional Operations  

---

## 1. Executive Summary & Architecture Overview

CampusOS is a next-generation academic operating system providing digital credentials, campus service coordination, and departmental skill verification. The application is delivered via an Edge-distributed Single Page Application (SPA) architecture running on Cloudflare Pages and Workers.

```
       +-------------------------------------------------------+
       |   Student & Faculty Browsers (HTTPS / TLS 1.3)        |
       +-------------------------------------------------------+
                                   |
                                   v
             [ Cloudflare Global Edge (CDN / WAF / DDoS) ]
                                   |
         +-------------------------+-------------------------+
         |                                                   |
         v                                                   v
   [ Cloudflare Pages ]                            [ Edge Worker ]
   Static Web Application                          (/api/v1/* Routing, Rate Limiting,
   HTML5 / CSS / React / Vite                      Session Validation & Auth Gate)
         |                                                   |
         +-------------------------+-------------------------+
                                   |
                                   v
     +-------------------------------------------------------------+
     |        Rayat Bahra University Identity Provider (IdP)       |
     |   (Keycloak / Microsoft Entra ID / Shibboleth SAML-OIDC)    |
     +-------------------------------------------------------------+
```

---

## 2. OIDC Client Registration (Step-by-Step)

CampusOS authenticates students and faculty using OpenID Connect (OIDC) with PKCE (Proof Key for Code Exchange, RFC 7636).

### 2.1 Keycloak Identity Provider Registration
1. Log in to the Keycloak Admin Console (`https://sso.rayatbahrauniversity.edu.in/auth/admin`).
2. Select or create Realm: `campus`.
3. Navigate to **Clients** $\rightarrow$ **Create client**:
   - **Client type:** `OpenID Connect`
   - **Client ID:** `campusos-web-client`
   - **Name:** `CampusOS Academic Portal`
4. In Client Settings:
   - **Client Authentication:** `Off` (Public Client utilizing PKCE)
   - **Standard Flow:** `Enabled`
   - **Direct Access Grants:** `Off`
   - **Valid Redirect URIs:**
     - `https://campusos.rayatbahrauniversity.edu.in/auth/callback`
     - `https://campusos-rbu-owv.pages.dev/auth/callback`
   - **Valid Post Logout Redirect URIs:**
     - `https://campusos.rayatbahrauniversity.edu.in/`
     - `https://campusos-rbu-owv.pages.dev/`
   - **Web Origins:**
     - `https://campusos.rayatbahrauniversity.edu.in`
     - `https://campusos-rbu-owv.pages.dev`
5. In **Client Scopes** $\rightarrow$ **Dedicated Scopes**:
   - Ensure `openid`, `profile`, `email` are mapped.
   - Add User Attribute Protocol Mapper for `roll_number` (maps student roll number attribute to JWT claim `uid` or `roll_number`).
   - Add User Attribute Protocol Mapper for `department` (maps department to claim `department`).

### 2.2 Microsoft Entra ID (Azure AD) Registration
1. In Azure Portal, navigate to **Microsoft Entra ID** $\rightarrow$ **App registrations** $\rightarrow$ **New registration**.
2. **Name:** `CampusOS Portal`.
3. **Supported account types:** Accounts in this organizational directory only (Rayat Bahra University).
4. **Redirect URI (platform: Single-page application - SPA):**
   - `https://campusos.rayatbahrauniversity.edu.in/auth/callback`
   - `https://campusos-rbu-owv.pages.dev/auth/callback`
5. Under **Token configuration**, add optional claims:
   - `email`, `given_name`, `family_name`, and extension attribute `roll_number`.

### 2.3 Shibboleth OIDC Extension Registration
Add the following client definition to `conf/oidc-client-policy.xml` or metadata provider:
```xml
<Client id="campusos-web-client"
        redirectUri="https://campusos.rayatbahrauniversity.edu.in/auth/callback"
        clientType="PUBLIC"
        grantTypes="authorization_code"
        responseTypes="code"
        pkceEnforced="true" />
```

---

## 3. Environment Variables & Secret Configuration

Configure these parameters in **Cloudflare Pages Dashboard** $\rightarrow$ **Settings** $\rightarrow$ **Environment variables**:

| Variable Name | Production Value | Description |
| :--- | :--- | :--- |
| `VITE_AUTH_PROVIDER` | `oidc` | Authentication driver (`mock` or `oidc`) |
| `VITE_OIDC_ISSUER_URL` | `https://sso.rayatbahrauniversity.edu.in/auth/realms/campus` | Base URL of University Identity Provider |
| `VITE_OIDC_CLIENT_ID` | `campusos-web-client` | Registered OIDC Client Identifier |
| `VITE_OIDC_REDIRECT_URI` | `https://campusos.rayatbahrauniversity.edu.in/auth/callback` | OAuth2 callback route |
| `VITE_FEATURE_FLAGS` | `{"ENABLE_REAL_SSO":true,"ENABLE_SKILL_SUBMISSION":true,"ENABLE_HONORS_VERIFICATION":false}` | JSON string controlling gradual rollout |

---

## 4. Cloudflare Pages & Custom Domain Setup

### 4.1 Custom Domain & DNS Mapping
1. Navigate to **Cloudflare Dashboard** $\rightarrow$ **Workers & Pages** $\rightarrow$ `CampusOs`.
2. Select **Custom domains** tab $\rightarrow$ Click **Set up a custom domain**.
3. Enter `campusos.rayatbahrauniversity.edu.in`.
4. Cloudflare DNS will automatically create the `CNAME` record pointing to `campusos-rbu-owv.pages.dev` with Proxied (`Orange Cloud`) status enabled.
5. TLS 1.3 / SSL Certificate is automatically provisioned with Universal SSL within 10-15 minutes.

### 4.2 Edge Worker Routing
The backend functions in [`public/_worker.js`](file:///c:/Users/Code66/Downloads/SDLC_Artifacts/CampusOs/public/_worker.js) are compiled into the Pages build automatically.
- All requests under `/api/v1/*` are intercepted by the edge worker.
- Security headers from [`public/_headers`](file:///c:/Users/Code66/Downloads/SDLC_Artifacts/CampusOs/public/_headers) apply automatically across all static and dynamic responses.

---

## 5. Backend JWKS Token Verification Setup

In production mode, the Cloudflare Worker validates ID tokens and session cookies using the University IdP's JSON Web Key Set (JWKS).

1. The IdP exposes public keys at:
   `https://sso.rayatbahrauniversity.edu.in/auth/realms/campus/protocol/openid-connect/certs`
2. The worker caches public keys at the Cloudflare Edge using KV storage or Cache API with a 6-hour TTL.
3. Every incoming `Bearer <token>` or `campusos_session` cookie is cryptographically verified against the active JWKS RS256 key before extracting claims (`uid`, `name`, `department`).

---

## 6. Rollback & Emergency Fallback Procedure

If University SSO experiences downtime or an authentication incident:
1. Navigate to Cloudflare Pages Dashboard $\rightarrow$ Settings $\rightarrow$ Environment variables.
2. Update `VITE_FEATURE_FLAGS`:
   ```json
   {"ENABLE_REAL_SSO":false,"ENABLE_SKILL_SUBMISSION":true,"ENABLE_HONORS_VERIFICATION":false}
   ```
3. Set `VITE_AUTH_PROVIDER=mock`.
4. Trigger **Retry deployment** from the Pages dashboard.
5. In $< 45$ seconds, the portal falls back to local authenticated development sessions without service interruption.

---

## 7. IT Support & Incident Escalation Contacts

- **CampusOS Lead Engineering:** `engineering@campusos.internal`
- **RBU Registrar Verification Desk:** `registrar@rayatbahrauniversity.edu.in`
- **RBU Central IT Helpdesk:** `it-helpdesk@rayatbahrauniversity.edu.in`
- **Emergency On-Call Escalation:** PagerDuty / University SOC Tier 2
