/**
 * CampusOS Authentication Adapter
 * Abstract interface for authentication supporting both Mock JWT (development)
 * and OpenID Connect (OIDC / OAuth 2.0 PKCE) for production university SSO.
 *
 * Configured via:
 * VITE_AUTH_PROVIDER = 'mock' | 'oidc' (default: 'mock')
 */

import { trackEvent } from '@/lib/telemetry';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  rollNumber: string;
  department: string;
  yearOfStudy?: number;
  role: 'student' | 'admin' | 'faculty';
  isVerified?: boolean;
}

export interface AuthAdapter {
  providerName: 'mock' | 'oidc';
  getCurrentUser(): Promise<AuthUser | null>;
  login(credentials?: { email?: string; rollNumber?: string; password?: string }): Promise<AuthUser>;
  logout(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
  refreshToken?(): Promise<string | null>;
  getAccessToken(): string | null;
}

export interface OIDCConfig {
  issuerUrl: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  responseType: string;
}

/**
 * Default OIDC Configuration template
 * Fill in with University SSO identity provider details (e.g., Keycloak, Okta, Azure AD / Entra ID, Shibboleth OIDC)
 */
export const defaultOidcConfig: OIDCConfig = {
  issuerUrl: import.meta.env.VITE_OIDC_ISSUER_URL || 'https://sso.rbu.ac.in/auth/realms/campus',
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID || 'campusos-web-client',
  redirectUri: import.meta.env.VITE_OIDC_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  scopes: ['openid', 'profile', 'email', 'eduPersonPrincipalName'],
  responseType: 'code', // Authorization Code Flow with PKCE
};

/**
 * Cookie Helper: Secure token management using cookies
 */
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secureFlag}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Mock Auth Adapter (Development / Staging)
 */
export class MockAuthAdapter implements AuthAdapter {
  public providerName = 'mock' as const;
  private currentUser: AuthUser | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    const sessionCookie = getCookie('campusos_session');
    if (sessionCookie) {
      try {
        let claims: any = null;
        if (sessionCookie.includes('.')) {
          const parts = sessionCookie.split('.');
          if (parts.length === 3) {
            claims = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          }
        } else {
          claims = JSON.parse(sessionCookie);
        }

        if (claims) {
          this.currentUser = {
            id: claims.sub || 'e29f1092-2309-425b-9ff1-91d8487b2938',
            email: claims.email || 'student@rbu.ac.in',
            fullName: claims.name || claims.fullName || 'Gaurav Sen',
            rollNumber: claims.uid || 'RBU21CSE045',
            department: claims.department || 'Computer Science & Engineering',
            yearOfStudy: claims.yearOfStudy || 4,
            role: 'student',
            isVerified: true,
          };
        }
      } catch {
        this.currentUser = null;
      }
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!this.currentUser) {
      this.restoreSession();
    }
    return this.currentUser;
  }

  async login(credentials?: { email?: string; rollNumber?: string; password?: string }): Promise<AuthUser> {
    const roll = (credentials?.rollNumber || 'RBU21CSE045').toUpperCase();
    const mockClaims = {
      sub: 'e29f1092-2309-425b-9ff1-91d8487b2938',
      uid: roll,
      name: credentials?.email ? credentials.email.split('@')[0] : 'Gaurav Sen',
      email: credentials?.email || `${roll.toLowerCase()}@rbu.ac.in`,
      department: 'Computer Science & Engineering',
      role: 'student',
      exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    };

    const header = { alg: 'RS256', typ: 'JWT', kid: 'rbu-idp-key-2026' };
    const b64Header = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const b64Payload = btoa(JSON.stringify(mockClaims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const b64Signature = btoa('mock_development_rs256_signature_bytes_authenticated').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `${b64Header}.${b64Payload}.${b64Signature}`;
    setCookie('campusos_session', token, 7);

    this.currentUser = {
      id: mockClaims.sub,
      email: mockClaims.email,
      fullName: mockClaims.name,
      rollNumber: mockClaims.uid,
      department: mockClaims.department,
      yearOfStudy: 4,
      role: 'student',
      isVerified: true,
    };

    trackEvent('AUTH_LOGIN_SUCCESS', 'info', {
      provider: 'mock',
      department: mockClaims.department,
    });

    return this.currentUser;
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.warn('Backend logout call notice:', err);
    }

    deleteCookie('campusos_session');
    deleteCookie('sb-access-token');
    this.currentUser = null;

    trackEvent('AUTH_LOGOUT', 'info', { provider: 'mock' });
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  async refreshToken(): Promise<string | null> {
    // In mock mode, renew the cookie expiration
    const cookie = getCookie('campusos_session');
    if (cookie) {
      setCookie('campusos_session', cookie, 7);
      return cookie;
    }
    return null;
  }

  getAccessToken(): string | null {
    return getCookie('campusos_session');
  }
}

/**
 * Production OIDC / OAuth2 PKCE Auth Adapter
 * Integrates with standard OpenID Connect compliant identity providers.
 */
export class OidcAuthAdapter implements AuthAdapter {
  public providerName = 'oidc' as const;
  private config: OIDCConfig;
  private currentUser: AuthUser | null = null;

  constructor(config: Partial<OIDCConfig> = {}) {
    this.config = { ...defaultOidcConfig, ...config };
    this.checkSessionFromCookie();
  }

  private checkSessionFromCookie() {
    const sessionCookie = getCookie('campusos_session');
    if (sessionCookie) {
      try {
        const parts = sessionCookie.split('.');
        if (parts.length >= 2) {
          const claims = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          this.currentUser = {
            id: claims.sub,
            email: claims.email || '',
            fullName: claims.name || claims.preferred_username || 'SSO User',
            rollNumber: claims.roll_number || claims.uid || 'RBU21CSE045',
            department: claims.department || 'Computer Science & Engineering',
            role: claims.role || 'student',
            isVerified: true,
          };
        }
      } catch {
        // invalid token
      }
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!this.currentUser) {
      this.checkSessionFromCookie();
    }
    return this.currentUser;
  }

  /**
   * Generates PKCE code challenge and redirects to OIDC identity provider
   */
  async login(): Promise<AuthUser> {
    const state = crypto.randomUUID();
    sessionStorage.setItem('oidc_state', state);

    // PKCE code verifier and challenge
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = Array.from(array, (dec) => dec.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('oidc_code_verifier', codeVerifier);

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: this.config.responseType,
      scope: this.config.scopes.join(' '),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${this.config.issuerUrl}/protocol/openid-connect/auth?${params.toString()}`;
    window.location.href = authUrl;

    // Return current user placeholder pending redirect
    return new Promise(() => {});
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.warn('Backend logout error:', err);
    }

    deleteCookie('campusos_session');
    deleteCookie('sb-access-token');
    sessionStorage.removeItem('oidc_state');
    sessionStorage.removeItem('oidc_code_verifier');
    this.currentUser = null;

    // Optional federated RP-initiated logout
    const logoutUrl = `${this.config.issuerUrl}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
      window.location.origin
    )}`;
    // If issuer is configured, redirect to IDP logout
    if (this.config.issuerUrl && !this.config.issuerUrl.includes('localhost')) {
      window.location.href = logoutUrl;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  async refreshToken(): Promise<string | null> {
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        return data.token || null;
      }
    } catch {
      // refresh failure
    }
    return null;
  }

  getAccessToken(): string | null {
    return getCookie('campusos_session');
  }
}

/**
 * Factory creating active AuthAdapter instance based on environment
 */
export function createAuthAdapter(): AuthAdapter {
  const provider = (import.meta.env.VITE_AUTH_PROVIDER || 'mock').toLowerCase();
  if (provider === 'oidc') {
    return new OidcAuthAdapter();
  }
  return new MockAuthAdapter();
}

export const authAdapter = createAuthAdapter();
