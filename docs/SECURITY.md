# GoYatrio — Security Architecture & Hardening Guide (Phase 20)

## 1. Security Architecture Summary

GoYatrio implements defense-in-depth across the API and frontend layers, ensuring data confidentiality, integrity, availability, and strict adherence to the **Permanent Admin Editable Architecture Rule**:

- **Layered API Boundary**: Express 5 service (`apps/api`) running behind a reverse proxy/Next.js rewrite proxy with `trust proxy` enabled.
- **Header Hardening**: `helmet` on the backend and comprehensive HTTP security headers on Next.js 15 (`apps/web`).
- **Tiered Rate Limiting**: `express-rate-limit` enforces rate quotas across authentication, public inquiry submissions, and general API endpoints.
- **Strong Authentication**: Salted bcrypt password hashing (12 rounds), stateless JWT access tokens, and cryptographically random, revocable refresh tokens with automatic token rotation.
- **Role-Based Authorization**: Strict server-side verification (`requireAdmin`) on all mutating endpoints and administrative views.
- **Zero Raw SQL Injections**: 100% of domain database interactions utilize Prisma ORM with parameterized queries.
- **Strict Input Validation**: Zod schemas validate request bodies, URL params, and query filters.

---

## 2. Authentication Security

### Access Tokens & Signatures

- Signed via HMAC-SHA256 (`HS256`) using `JWT_SECRET`.
- Valid for 1 hour (`JWT_EXPIRES_IN=1h`).
- In production, `apps/api/src/config/env.ts` enforces that `JWT_SECRET` is at least 32 characters and rejects default development secrets.

### Refresh Tokens & Token Rotation

- 40-byte cryptographically secure pseudo-random hex tokens (`crypto.randomBytes(40).toString("hex")`).
- Stored in the `refresh_tokens` database table with indexed `userId` and `token` columns.
- Expiration: 7 days.
- **Rotation**: Whenever `/api/auth/refresh` is called, the supplied token is marked `isRevoked: true` and an entirely new refresh token is issued. Replaying an old or revoked token immediately fails.

### Password Security

- Passwords are salted and hashed using `bcryptjs` with a work factor of 12.
- Minimum length: 8 characters, maximum 128 characters.
- Passwords and `passwordHash` are never logged, never returned in API payloads (`sanitizeUser`), and never exposed to the client.

### Production Environment Isolation

- Development mock authentication fallbacks (`!process.env.DATABASE_URL`) are strictly guarded with `env.NODE_ENV !== "production"`. Development mock credentials can never be used in a production environment.

---

## 3. Authorization & Access Control

### Server-Side Role Enforcement

- Client-side navigation guards (`AdminGuard`) provide UX protection, but authorization is strictly enforced on the server:
  - `authenticate` extracts and verifies the Bearer JWT.
  - `requireAdmin` checks `(req as AuthenticatedRequest).user?.role === UserRole.ADMIN`.
- Any non-admin account attempting to access `/api/admin/*` receives HTTP 403 `ADMIN_ACCESS_REQUIRED`.

### Privilege Escalation Defense

- Customer self-registration (`POST /api/auth/register`) hard-codes `role: UserRole.CUSTOMER`.
- Admin roles can only be provisioned directly in the database or via authorized administrative management.

---

## 4. Rate Limiting & DoS Defense

Implemented in `apps/api/src/middleware/rate-limiter.ts`:

| Limiter              | Target Routes                                                        | Quota        | Window     | Purpose                                            |
| :------------------- | :------------------------------------------------------------------- | :----------- | :--------- | :------------------------------------------------- |
| **`authLimiter`**    | `/api/auth/login`, `/api/auth/register`, `/api/auth/change-password` | 10 requests  | 15 minutes | Protects against credential stuffing & brute-force |
| **`inquiryLimiter`** | `POST /api/inquiries`                                                | 10 requests  | 1 hour     | Prevents lead form spam & notification flood       |
| **`apiLimiter`**     | All `/api/*` routes                                                  | 120 requests | 1 minute   | General protection against high-frequency crawling |

Health probes (`/health`, `/api/status`, `/api/health`) are explicitly exempt from rate limiting to prevent false-positive failures on orchestrator health checks.

---

## 5. Security Headers & Next.js Protection

Configured in `apps/web/next.config.ts`:

- **`X-Content-Type-Options: nosniff`**: Prevents MIME-type sniffing by browsers.
- **`X-Frame-Options: SAMEORIGIN`**: Protects against clickjacking attacks.
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Guards referrer privacy when transitioning to external links.
- **`X-XSS-Protection: 1; mode=block`**: Enables browser cross-site scripting filters.
- **`Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`**: Restricts access to sensitive browser device hardware.
- **`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`**: Forces HTTPS connections in production.

---

## 6. Media & Upload Security

- **Whitelisted MIME Types**: Only safe image types (JPEG, PNG, WebP, GIF, AVIF), videos (MP4, WebM, QuickTime), and business documents (PDF, Word, Excel, PowerPoint) are accepted.
- **Size Limits**: Capped at 10 MB for images/documents, and 100 MB for video files.
- **Signed Cloudinary Uploads**: Direct client uploads require authenticated SHA-1 HMAC signatures generated server-side using the private `CLOUDINARY_API_SECRET`.
- **Public vs. Private Access**: Public visitors can only query `ACTIVE` assets via read-only endpoints. Only authenticated administrators can upload, replace, or delete media.

---

## 7. Production Security Deployment Checklist

1. [ ] **`NODE_ENV=production`**: Set in all production runtime environments.
2. [ ] **`JWT_SECRET`**: Set to a unique, random string with at least 32 characters (e.g., generated with `openssl rand -hex 32`). Never use development defaults.
3. [ ] **`DATABASE_URL`**: Valid Supabase / PostgreSQL SSL connection string (`sslmode=require`).
4. [ ] **`API_CORS_ORIGIN`**: Set to the exact canonical production domains (e.g., `https://goyatrio.com,https://admin.goyatrio.com`).
5. [ ] **Cloudinary Secrets**: Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
6. [ ] **No Git Secrets**: Verify that `.env` files are never tracked in Git (checked via `.gitignore`).
