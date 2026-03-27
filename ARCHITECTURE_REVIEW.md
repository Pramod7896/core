# FurniSense Architecture Review (Enterprise-Grade Assessment)

Date: 2026-03-25

## 1) Executive Summary

The repo is a monorepo with:
- `backend/`: Express API + Sequelize (Postgres), dynamic “page-driven” CRUD, RBAC, uploads, audit logs.
- `frontend/`: React (CRA) app with Context-based auth + an “admin console” style dynamic page renderer.

Overall, the codebase is functional but not yet “enterprise-grade” due to **security risks**, **data integrity gaps**, and **scalability/performance bottlenecks** primarily caused by:
- token/session design (refresh/access tokens stored in DB and in browser localStorage),
- dynamic model access (“CRUD by model_name/tableName”),
- missing DB constraints/indexes/migrations,
- repeated N+1 query patterns in auth/RBAC/page-data flows,
- permissive CORS and risky upload-path handling.

## 2) High-Level Architecture (As-Is)

### Backend
- `backend/server.js`: Express bootstrap, routes under `/api/v1/*`, uploads exposed via `/uploads`.
- `backend/config/database.js`: Sequelize Postgres connection. Uses `sequelize.sync({ alter: true })` in `development`.
- `backend/models/*`: Sequelize models + relationships in `backend/models/index.js`.
- `backend/services/*`: Auth, RBAC, dynamic page CRUD, dynamic page data retrieval, audit log service.
- `backend/middlewares/*`: JWT auth, RBAC/authorization, request logging, upload middleware, validations.

### Frontend
- `frontend/src/contexts/AuthContext.js`: stores auth state and persists tokens + RBAC data to `localStorage`.
- `frontend/src/api/*`: axios wrapper with refresh-on-401, plus per-feature API functions.
- `frontend/src/components/CommonPage/*`: “dynamic page” UI that renders tables/forms from server-provided config + data.

## 3) Database Schema & Relationships (Observed)

### Declared relationships (from `backend/models/index.js`)
- Enterprize `1:N` Users (`users.enterprize_fid`)
- Enterprize `1:N` Roles (`roles.enterprize_fid`)
- Enterprize `1:N` Pages (`pages.enterprize_fid`)
- Enterprize `1:N` AuditLogs (`audit_logs.enterprize_fid`)
- Enterprize `1:N` UserFiles (`user_files.enterprize_fid`)
- Enterprize `1:N` Customers (`customers.enterprize_fid`)
- Users `N:N` Roles via `user_roles` (`user_roles.user_fid`, `user_roles.role_fid`)
- Roles `N:N` Permissions via `role_permissions` (`role_permissions.role_fid`, `role_permissions.permission_fid`)
- Roles `N:N` Pages via `role_page_permissions` (`role_page_permissions.role_fid`, `role_page_permissions.page_fid`)
- User `1:N` AuditLogs (`audit_logs.user_fid`)
- LoginHistory `1:N` UserSessions (`user_sessions.login_history_fid`)
- User `1:N` UserSessions (`user_sessions.user_fid`)
- User `1:N` OTPVerification (`otp_verifications.user_fid`)
- User `1:N` UserFiles (`user_files.user_fid`)

### Missing or weak relationships (recommended)
1) `login_history.user_fid` should be associated to `users.user_id` (even if nullable for failed logins).
2) `user_files.parent_id` should be a **self-referential FK** to support folder hierarchies safely.
3) Many “*_fid” columns are **not guaranteed** to have DB-level foreign keys/constraints (Sequelize model definitions don’t enforce DB FKs by themselves).
4) Multi-tenant uniqueness likely needs **composite unique constraints** (e.g., `page_route`, `page_name`, `role_name`) if these should be unique per enterprise, not globally.

### Integrity/indexing gaps (recommended)
- Join tables should enforce uniqueness:
  - `user_roles`: unique `(user_fid, role_fid)`
  - `role_permissions`: unique `(role_fid, permission_fid)`
  - `role_page_permissions`: unique `(role_fid, page_fid)`
- Add indexes for hot paths:
  - `user_sessions(session_id, is_active)`, `user_sessions(refresh_token)`, `user_sessions(user_fid)`
  - `otp_verifications(user_fid, expires_timestamp)`
  - `audit_logs(enterprize_fid, created_timestamp)`
  - `pages(enterprize_fid, model_name, is_active)`

## 4) Architectural Anti-Patterns / Maintainability Issues

### 4.1 “Dynamic CRUD by Model/Table” (major risk)
`backend/services/pageCrud.service.js` and `backend/services/pageData.service.js` dynamically resolve Sequelize models by `model_name` or `tableName`.

Risks:
- Expands the attack surface (authorization mistakes become catastrophic).
- Encourages mass assignment bugs and inconsistent validation.
- Makes schema evolution harder (because the UI and API are driven by runtime config rather than strongly-typed contracts).

Enterprise recommendation:
- Limit dynamic CRUD to an explicit allowlist of models, with per-model validation + field allowlists.
- Prefer a “module-per-domain” API design (customers, users, files, etc.) and keep dynamic pages as an admin-only abstraction on top.

### 4.2 Inconsistent naming/shape across layers
Examples:
- `req.user` uses `roleIds` but other middleware expected `role_ids`.
- Some code expects `req.user.id` but auth middleware used `user_id`.
- Backend `config` uses `nodeEnv` but server logging used `config.env` previously.

Enterprise recommendation:
- Define a single canonical `RequestUser` shape (TypeScript or JSDoc typedef) and enforce it everywhere.

### 4.3 Mixed timestamp strategies
Some models use `timestamps: false` with manual `created_timestamp/updated_timestamp` defaults; others use Sequelize timestamps with custom fields.

Enterprise recommendation:
- Standardize to Sequelize timestamps across all tables (or use DB triggers), and ensure `updated_timestamp` is reliably updated.

### 4.4 Seed-on-startup behavior
`backend/server.js` runs `seeders/initialSuperAdmin.seed.js` on every startup.

Enterprise recommendation:
- Move seeding to a one-time CLI/admin workflow and require an explicit env flag in non-dev environments.

## 5) Performance Bottlenecks / Scalability Risks

### 5.1 N+1 queries in auth and page flows
Observed patterns:
- `backend/services/auth.service.js`: roles/permissions/pages computed via multiple sequential queries; page permissions sometimes fetched per-page in a loop.
- `backend/middlewares/auth.middleware.js`: recalculates roles + permissions **on every request**.
- `backend/services/pageData.service.js`: loops across rows and dynamic fields and issues per-row/per-field DB queries.

Enterprise recommendation:
- Replace per-request role/permission fetch with:
  - cached authorization snapshot (short TTL) keyed by `(user_id, session_id)`, OR
  - single query with joins/includes to reduce round-trips.
- In page data service, prefetch reference tables in bulk and map in memory, or add explicit joins.
- Implement server-side pagination/filtering for dynamic pages.

### 5.2 Client-side pagination/search on large datasets
`frontend/src/components/CommonPage/hooks/usePageData.js` fetches all rows then filters/paginates in the browser.

Enterprise recommendation:
- Move to server-side pagination + search (`?page=…&limit=…&q=…`) with indexed columns.

### 5.3 External IP geolocation call on login
`backend/utils/iputils.js` calls an external IP API during login.

Enterprise recommendation:
- Make this optional (feature flag), async/offline (queue), and rate-limited.
- Avoid logging request headers / IP responses (PII).

## 6) Security Gaps (High Priority)

1) Token storage:
   - Frontend stores tokens in `localStorage` (XSS risk).
   - Backend stores access/refresh tokens in `user_sessions` as plaintext.
   - Refresh tokens are not rotated and expiry checks are not consistently enforced.

   Recommendation:
   - Prefer httpOnly secure cookies for refresh tokens.
   - Store only hashed refresh tokens (and possibly access token `jti`), not raw JWTs.
   - Enforce refresh expiry; rotate refresh tokens on use; revoke old tokens.

2) Upload path trust:
   - `backend/middlewares/uploadMiddleware.js` previously allowed untrusted `parent_path` overrides.

   Recommendation:
   - Allow only paths within the user’s uploads root; sanitize inputs; validate folder ownership in DB.

3) CORS:
   - `origin: true` with `credentials: true` is too permissive for production.

   Recommendation:
   - Restrict allowed origins by environment and add CSRF defenses if cookies are used.

4) Disabled Helmet / missing hardening:
   - Helmet is commented out in `backend/server.js`.

   Recommendation:
   - Enable Helmet with explicit CSP/COEP settings tailored to the UI and uploads.

5) Rate limiting / brute-force protection:
   - Login rate limiting is commented out in routes.

   Recommendation:
   - Add rate limiting for auth endpoints + OTP flows, and lockout/backoff policies.

6) Hard-coded superadmin seed password:
   - `seeders/initialSuperAdmin.seed.js` uses a default password.

   Recommendation:
   - Require an env-provided password, or generate a one-time secret and print it once.

## 7) Redundant / Unnecessary Code (Cleanup Candidates)

- `frontend/src/hooks/useAuth.js` appears empty (candidate for deletion).
- Multiple RBAC middlewares exist (`authorizeResource`, `rbac.middleware.js`, `authorizePage`) with overlapping purpose; consolidate.
- Excessive `console.log` in `backend/utils/iputils.js` leaks request headers and is noisy.
- CRA build artifacts under `frontend/build/` in-repo can be removed if CI builds deployments.

## 8) Recommended Refactor Roadmap

### Phase 0 (Immediate, safety/security)
- Fix RBAC user-shape mismatches everywhere (`roleIds`/`role_ids`, `id`/`user_id`).
- Lock down uploads path handling and file size/type limits.
- Restrict CORS for production and enable Helmet with correct config.
- Add rate limiting for `/auth/*` and OTP flows.

### Phase 1 (Data integrity + DB governance)
- Introduce migrations (Sequelize CLI or another tool) and stop relying on `sync({ alter: true })`.
- Add foreign keys + unique constraints + indexes for join tables and session/otp tables.
- Normalize timestamp strategy across all models.

### Phase 2 (Scalability + performance)
- Server-side pagination/filtering for dynamic pages.
- Replace N+1 patterns with includes/joins/bulk fetch and/or caching.
- Move IP geolocation to async job (queue) or make optional.

### Phase 3 (Enterprise architecture)
- Replace “dynamic model CRUD” with explicit domain APIs, keeping dynamic pages as admin UI only.
- Add input validation schemas (Zod/Joi) consistently across all routes.
- Add structured logging (JSON) + correlation IDs, environment-based log levels, and PII redaction.

## 9) Fixes Applied During This Review

To reduce production risk and align naming across modules, the following small fixes were applied:
- `backend/server.js`: log `config.nodeEnv` instead of `config.env`.
- `backend/middlewares/auth.middleware.js`: add compatibility aliases on `req.user` (`id`, `role_ids`).
- `backend/middlewares/requestLogger.middleware.js` / `backend/middlewares/error.middleware.js`: log `user_id` correctly.
- `backend/middlewares/error.middleware.js`: add and export `AppError` (used by `rbac.middleware.js`).
- `backend/middlewares/authorizePage.middleware.js`: accept both `roleIds` and `role_ids`.
- `backend/middlewares/uploadMiddleware.js`: constrain `parent_path` to the user’s uploads root (prevents path traversal).

