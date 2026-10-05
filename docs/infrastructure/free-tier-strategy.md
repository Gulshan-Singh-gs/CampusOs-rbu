# CAMPUSOS — FREE-TIER INFRASTRUCTURE STRATEGY

## 1. Principles
Every infrastructure dependency in CampusOS is governed by:
1. **Free-tier Availability**: Must offer a permanent or sustainable free allocation for MVP/pilot workloads (1,000–5,000 active students).
2. **Quota Transparency**: System behavior must gracefully degrade if quotas approach saturation.
3. **Zero Lock-In**: Code abstractions allow plug-and-play migration to self-hosted or alternative providers without re-architecting domain logic.

---

## 2. Infrastructure Inventory & Free Allowance Audit

| Service / Provider | Purpose | Free Tier Quota / Allowance | CampusOS Expected Usage (Pilot: 2,500 students) | Saturation Risk | Fallback Strategy | Migration / Future Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Pages** | Static SPA Hosting, Edge CDN, TLS | Unlimited requests, 500 builds/month, 100 custom domains | ~100k requests/month, ~20 builds/month | **Negligible** | Local static hosting (NGINX / Vercel Hobby) | $0/mo forever on standard plan |
| **Supabase PostgreSQL & PostgREST** | Primary Relational DB, Auth, RLS, Indexes | 500 MB database storage, 5 GB bandwidth, 50k MAU | ~80 MB initial data, ~1.5 GB bandwidth/mo | **Low** (managed via pruning & archival) | Self-hosted Supabase Docker / PostgreSQL RDS | $25/mo Pro tier if >500MB |
| **Supabase Auth** | User identity, JWT sessions, RLS claims | 50,000 Monthly Active Users | ~2,500 MAU | **Very Low** | Self-hosted GoTrue / Keycloak | Included in free tier up to 50k MAU |
| **Supabase Storage** | Profile avatars, event banners, club logos | 1 GB storage, 2 GB egress bandwidth/mo | ~300 MB compressed assets, ~1.2 GB egress | **Moderate** | Client-side Canvas image compression before upload; Cloudflare R2 | Cloudflare R2 (10GB free/mo) or Supabase Pro ($25/mo) |
| **Supabase Realtime** | Ephemeral match chat, live notifications | 200 concurrent connections, 2M messages/month | ~40-80 concurrent active, ~200k msgs/mo | **Moderate** | Selective channel subscriptions (no global tables), graceful fallback to polling | Supabase Pro ($25/mo) |
| **OpenStreetMap & Leaflet** | Campus Map & Venue Visualizer | Unlimited public tile server access (under OSM tile usage policy) | Static tile caching via Leaflet client | **Negligible** | Cached SVG campus blueprint fallback | Free / Self-hosted Tile Server |
| **Browser Push API & Local Notifications** | Timely event reminders & team matches | Free (Native browser capability + standard WebPush VAPID) | In-app notification center default + opt-in WebPush | **Zero** | In-app notification feed | Free (VAPID requires zero third-party push server fees) |
| **Client-Side PDF Generation** | Verified Campus Resume download | Native browser `window.print()` with `@media print` styling | Client-side only | **Zero** | Zero server resource cost | $0/mo |

---

## 3. Quota Management & Defensive Engineering

1. **Selective Subscriptions**:
   Clients only subscribe to specific chat rooms (`chat:room_id`) or notification queues (`user:auth_uid`). Global table broadcasts (`*`) are strictly forbidden.
2. **Client-Side Compression**:
   All image uploads (avatars, event recap photos) are normalized and compressed via HTML5 Canvas to WebP/JPEG under 400KB before Supabase Storage upload.
3. **Data Pruning**:
   Stories are tagged with `expires_at = now() + interval '24 hours'`. Expired stories are filtered at query time and periodic vacuum cleanups prevent database bloat.
4. **Deterministic Matching**:
   Collaborative matchmaking and study radar compute affinities using indexed PostgreSQL relational queries and client-side scoring rather than calling paid LLM APIs.
