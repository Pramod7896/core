# FurniSense Database Architecture (Enterprise Baseline)

Date: 2026-03-25

## Goals

- **Referential integrity** enforced at the database layer (FKs + cascades).
- **Scalable keyspace** and consistent joins (standardized on `BIGINT` IDs).
- **Multi-tenant correctness** via `enterprize_fid` on tenant-owned entities.
- **High-volume performance** via indexes on hot paths (auth/session, RBAC joins, audit logs).
- **Safe schema evolution** via migrations, with optional `sequelize.sync({ alter: true })` for development only.

## Core Entities & Relationships

### Tenancy
- `enterprizes` is the tenant root entity.
- Tenant-owned tables include an `enterprize_fid` referencing `enterprizes.enterprize_id`.

### Identity & Access Management (IAM)

**Users**
- `users (user_id PK)` belongs to one `enterprize` (`users.enterprize_fid FK`).
- Uniqueness is enforced per tenant:
  - unique `(enterprize_fid, user_name)`
  - unique `(enterprize_fid, user_email)`

**Roles**
- `roles (role_id PK)` belongs to one `enterprize` (`roles.enterprize_fid FK`).
- unique `(enterprize_fid, role_name)`

**Permissions**
- `permissions (permission_id PK)` is global.
- unique `(permission_resource, permission_action)`

**Joins**
- `user_roles` (N:N users ↔ roles), unique `(user_fid, role_fid)`
- `role_permissions` (N:N roles ↔ permissions), unique `(role_fid, permission_fid)`

### Navigation / Page-Level RBAC

**Pages**
- `pages (page_id PK)` belongs to an `enterprize` via `pages.enterprize_fid` (nullable allowed for legacy/global pages).
- Uniqueness is enforced per tenant:
  - unique `(enterprize_fid, page_route)`
  - unique `(enterprize_fid, page_name)`
  - unique `(enterprize_fid, model_name)`

**Page permissions**
- `role_page_permissions` (N:N roles ↔ pages + per-action booleans), unique `(role_fid, page_fid)`

### Sessions / Authentication

**Login history**
- `login_history` stores login events and can reference `users.user_id` (`login_history.user_fid FK`, nullable for cases where the user is unknown).

**Sessions**
- `user_sessions` tracks active tokens:
  - `user_sessions.user_fid FK → users.user_id`
  - `user_sessions.enterprize_fid FK → enterprizes.enterprize_id`
  - `user_sessions.login_history_fid FK → login_history.login_history_id` (nullable)
  - unique `user_sessions.refresh_token`

### Audit & Change Tracking

- `audit_logs` references both tenant and actor:
  - `audit_logs.enterprize_fid FK → enterprizes.enterprize_id` (nullable, `SET NULL` on delete)
  - `audit_logs.user_fid FK → users.user_id` (nullable, `SET NULL` on delete)

### Dynamic Configuration

- `field_configurations` is tenant-scoped (`enterprize_fid` optional) and drives dynamic UI/form fields.

### Files (Hierarchical)

- `user_files` is tenant- and user-scoped:
  - `user_files.user_fid FK → users.user_id`
  - `user_files.enterprize_fid FK → enterprizes.enterprize_id`
  - `user_files.parent_id FK → user_files.user_files_id` (self-reference, `SET NULL` on delete)

### Customers

- `customers` is tenant-scoped:
  - `customers.enterprize_fid FK → enterprizes.enterprize_id`

## Normalization Notes

- N:N relationships are normalized into join tables (`user_roles`, `role_permissions`, `role_page_permissions`) with unique constraints to prevent duplicate edges.
- Audit logs store denormalized “what happened” text; actor/tenant references are preserved via FKs.
- Session tables avoid “computed joins” in hot paths by storing `enterprize_fid` directly in `user_sessions`.

## Indexing Strategy (High-Volume Baseline)

Minimum indexes (in addition to PKs and unique indexes):
- All FK columns (`*_fid`) for join efficiency.
- `user_sessions(refresh_token)` for refresh token lookup (unique).
- `user_sessions(user_fid, is_active)` for session validation and user-session queries.
- `otp_verifications(otp_code)` and `otp_verifications(expires_timestamp)` for OTP workflows.
- `audit_logs(enterprize_fid)` and `audit_logs(created_timestamp)` for tenant audit trails.
- `pages(enterprize_fid, model_name, is_active)` for dynamic page loading.

## Data Integrity Constraints

- Foreign keys with explicit `ON DELETE` policy:
  - Join tables cascade deletes from parents.
  - Audit logs keep history (`SET NULL` for actor/tenant).
  - Tenant root uses `RESTRICT` for most business entities to prevent accidental tenant deletion.

## Schema Evolution / Migrations

### Recommended process
- Use migrations for controlled changes (`backend/migrations/*`).
- Apply at startup (dev) or via command (CI/prod):
  - `npm --prefix backend run migrate`

### Development convenience
`sequelize.sync({ alter: true })` is supported only when:
- `DB_SYNC_ALTER=true` OR `NODE_ENV=development`

This is meant for local iteration only; migrations remain the source of truth for enterprise environments.

## Files Implementing This Architecture

- Sequelize models: `backend/models/*.model.js`
- Associations: `backend/models/index.js`
- Migration runner: `backend/db/migrationsRunner.js`
- Migrations: `backend/migrations/20260325_0001_enterprise_constraints_indexes.js`
- App DB bootstrap: `backend/config/database.js`
- Seed workflow: `backend/seeders/initialSuperAdmin.seed.js` (run via `npm --prefix backend run seed` or `RUN_SEEDS_ON_START=true`)

