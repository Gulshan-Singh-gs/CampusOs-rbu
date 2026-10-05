# CAMPUSOS — CAPACITY & FREE-TIER COHORT SIZING MODEL

## 1. Workload Sizing Scenarios

This capacity model evaluates resource consumption across four student cohort tiers under real university usage patterns:

1. **Cohort 1 (MVP Pilot)**: 500 active students
2. **Cohort 2 (Departmental Rollout)**: 2,500 active students
3. **Cohort 3 (Full University Campus)**: 5,000 active students
4. **Cohort 4 (Multi-Campus Scale)**: 10,000 active students

---

## 2. Resource Consumption Estimates

| Dimension | MVP (500) | Pilot (2,500) | Campus (5,000) | Multi-Campus (10,000) | Supabase Free Limit | Status / Threshold Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Active Auth Users (MAU)** | 500 | 2,500 | 5,000 | 10,000 | 50,000 MAU | **Well within free tier** for all tiers |
| **Database Storage (Est.)** | 25 MB | 120 MB | 260 MB | 550 MB | 500 MB | **Safe up to 7,500 students**; at >7,500 students, prune expired audit logs or upgrade |
| **Storage Assets (Avatars/Recaps)** | 80 MB | 450 MB | 850 MB | 1.8 GB | 1 GB | **Safe up to 5,000 students** with client-side 400KB image compressor; Cloudflare R2 fallback |
| **Realtime Concurrent Connections** | 15–30 | 50–120 | 110–220 | 250–500 | 200 concurrent | **Free tier sustains up to 4,500 students**; enable heartbeat disconnects & polling fallback for high load |
| **Egress Bandwidth (Monthly)** | 350 MB | 1.8 GB | 3.6 GB | 7.5 GB | 5 GB | **Free tier sustains ~6,000 students**; Cloudflare CDN edge-caches all public assets |

---

## 3. Scaling Guardrails & Graceful Degradation Points

* **At 150 Realtime Connections**: Realtime subscriptions switch to active tab only (background tabs disconnect and poll every 60s).
* **At 400 MB DB Usage**: Trigger server-side vacuum and auto-purge expired document application drafts and notifications older than 90 days.
* **At 800 MB Storage**: Enforce stricter client-side JPEG/WebP compression (maximum 200KB per photo).
