// Cloudflare Pages Advanced Mode Edge Worker: _worker.js
// Intercepts and enforces edge authentication gate and security controls on sensitive routes.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1.1 Hard Auth Gate at Edge Level:
    // Intercepts ALL requests to /passport and /passport/*
    if (url.pathname === '/passport' || url.pathname.startsWith('/passport/')) {
      const authHeader = request.headers.get('Authorization') || '';
      const cookieHeader = request.headers.get('Cookie') || '';
      const hasAuthSession =
        authHeader.startsWith('Bearer ') ||
        cookieHeader.includes('sb-access-token') ||
        cookieHeader.includes('campusos_session');

      if (!hasAuthSession) {
        // Return 302 Redirect to /onboarding or 401 Unauthorized, NEVER 200
        const isApiOrDirectHead = request.method === 'HEAD' || request.headers.get('Accept')?.includes('application/json');
        if (isApiOrDirectHead) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Authentication required to access academic credentials' }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'WWW-Authenticate': 'Bearer error="invalid_token"',
              'X-Frame-Options': 'SAMEORIGIN',
              'X-Content-Type-Options': 'nosniff',
              'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            },
          });
        }

        const redirectUrl = new URL('/onboarding', request.url);
        redirectUrl.searchParams.set('redirect', url.pathname);
        return Response.redirect(redirectUrl.toString(), 302);
      }
    }

    // Default: pass request through to static assets
    const response = await env.ASSETS.fetch(request);
    const newHeaders = new Headers(response.headers);

    // Ensure edge security headers are attached to all outbound responses
    newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    newHeaders.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self';"
    );
    newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
