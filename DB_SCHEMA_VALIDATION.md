# Database Schema Validation (Enterprise-Grade) — FurniSense

Date: 2026-03-25

## Scope & Method

This validation is based on the Sequelize model definitions in `backend/models/*.model.js` and their declared associations in `backend/models/index.js`. It does **not** introspect a live database (so it cannot confirm whether constraints/indexes already exist or whether existing data violates them). As of 2026-03-25, the codebase standardizes IDs/FKs on `BIGINT` and includes an initial migration to enforce constraints and indexes.

## 1) Relationship Validation (Code-Level)

### 1.1 Relationships that are structurally OK (type-compatible for FKs)

These have matching key types in the current model definitions (INTEGER ↔ INTEGER), so DB-level FK constraints can be enforced safely *assuming data is consistent*:

- `users.enterprize_fid` → `enterprizes.enterprize_id`
- `roles.enterprize_fid` → `enterprizes.enterprize_id`
- `pages.enterprize_fid` → `enterprizes.enterprize_id` (nullable OK)
- `customers.enterprize_fid` → `enterprizes.enterprize_id`
- `field_configurations.enterprize_fid` → `enterprizes.enterprize_id` (nullable OK)
- `audit_logs.enterprize_fid` → `enterprizes.enterprize_id` (nullable OK)
- `audit_logs.user_fid` → `users.user_id` (nullable OK)
- `user_roles.user_fid` → `users.user_id`
- `user_roles.role_fid` → `roles.role_id`
- `role_permissions.role_fid` → `roles.role_id`
- `role_permissions.permission_fid` → `permissions.permission_id`
- `role_page_permissions.role_fid` → `roles.role_id`
- `role_page_permissions.page_fid` → `pages.page_id`

An executable baseline FK+index script is provided in `backend/db/postgres_constraints_indexes.sql`.

### 1.2 Relationships that were previously NOT FK-enforceable (resolved)

Historical issue:
- `users.user_id` and `enterprizes.enterprize_id` were `INTEGER` while several auth/session/files tables used `BIGINT`.

Current status (2026-03-25):
- Model definitions now standardize IDs and FK columns on `BIGINT` across the schema to enable DB-level foreign keys for high-consistency workloads.

### 1.3 Missing relationships (not declared, but should exist for integrity)

- `user_sessions.enterprize_fid` should exist to avoid extra joins in hot paths (implemented; required by enterprise tenancy).

## 2) Enterprise Best-Practice Requirements (What’s Missing Today)

### 2.1 Controlled migrations (governance)
Current pattern: `sequelize.sync({ alter: true })` in `backend/config/database.js` (development only).

Enterprise requirement:
- Use explicit migrations (DDL is code-reviewed, repeatable, and auditable).
- Disallow `alter` in any shared environment (staging/prod) to avoid accidental destructive changes.

### 2.2 Uniqueness constraints for join tables (data consistency)
Expected constraints:
- `user_roles`: unique `(user_fid, role_fid)`
- `role_permissions`: unique `(role_fid, permission_fid)`
- `role_page_permissions`: unique `(role_fid, page_fid)`

Without these, duplicates inflate permissions and degrade performance.

### 2.3 Multi-tenant uniqueness strategy
`pages.page_name` and `pages.page_route` are marked `unique: true` in `backend/models/page.model.js`, which enforces *global* uniqueness if applied at DB level.

Enterprise best practice (for tenant isolation):
- Prefer composite unique indexes such as `(enterprize_fid, page_route)` and `(enterprize_fid, page_name)` if uniqueness is per-enterprise.

### 2.4 Indexing for high-volume workloads
At minimum, index:
- all FK columns,
- session lookup paths (`user_sessions.refresh_token`, `user_sessions.user_fid`, `user_sessions.is_active`),
- OTP lookup paths (`otp_verifications.otp_code`, `otp_verifications.expires_timestamp`),
- high-write log tables by access pattern (`audit_logs.enterprize_fid`, `audit_logs.created_timestamp`).

`backend/db/postgres_constraints_indexes.sql` includes a baseline set.

### 2.5 Cascades and deletion policy
High-consistency systems require an explicit policy per relationship:
- “hard delete” with cascades for join tables (`user_roles`, `role_permissions`, `role_page_permissions`)
- “soft delete” (status fields) for business entities
- `SET NULL` for audit logs to preserve history if a user is removed

The SQL script uses a conservative baseline (`RESTRICT` for core entities, `CASCADE` for join tables, `SET NULL` for audit logs).

## 3) Required Remediation: Type Standardization Plan (to unlock full FK integrity)

The codebase has now adopted the “Option A” approach and provides an initial migration:
- `backend/migrations/20260325_0001_enterprise_constraints_indexes.js`

## 4) What You Can Apply Immediately

1) Apply type-compatible FK constraints + baseline indexes:
- `backend/db/postgres_constraints_indexes.sql`

2) Add unique indexes for join tables (after confirming no duplicates).

3) Plan and execute the key-type standardization migration to enable the remaining critical FKs for sessions/OTP/files.
