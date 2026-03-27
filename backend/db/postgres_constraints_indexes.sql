-- FurniSense - Postgres Referential Integrity + Indexing (Enterprise Baseline)
-- Date: 2026-03-25
--
-- Notes:
-- - This script is additive (constraints/indexes only). It does NOT drop columns/tables.
-- - Some FKs cannot be created until data type mismatches are resolved (see DB_SCHEMA_VALIDATION.md).
-- - Run in a controlled maintenance window; FK/unique creation may fail if data is inconsistent.

-- =========================================================
-- 0) Core FK constraints (type-compatible in current models)
-- =========================================================

DO $$
BEGIN
  ALTER TABLE users
    ADD CONSTRAINT fk_users_enterprizes
    FOREIGN KEY (enterprize_fid)
    REFERENCES enterprizes (enterprize_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE roles
    ADD CONSTRAINT fk_roles_enterprizes
    FOREIGN KEY (enterprize_fid)
    REFERENCES enterprizes (enterprize_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE pages
    ADD CONSTRAINT fk_pages_enterprizes
    FOREIGN KEY (enterprize_fid)
    REFERENCES enterprizes (enterprize_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE customers
    ADD CONSTRAINT fk_customers_enterprizes
    FOREIGN KEY (enterprize_fid)
    REFERENCES enterprizes (enterprize_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE field_configurations
    ADD CONSTRAINT fk_field_configurations_enterprizes
    FOREIGN KEY (enterprize_fid)
    REFERENCES enterprizes (enterprize_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE audit_logs
    ADD CONSTRAINT fk_audit_logs_enterprizes
    FOREIGN KEY (enterprize_fid)
    REFERENCES enterprizes (enterprize_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE audit_logs
    ADD CONSTRAINT fk_audit_logs_users
    FOREIGN KEY (user_fid)
    REFERENCES users (user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE user_roles
    ADD CONSTRAINT fk_user_roles_users
    FOREIGN KEY (user_fid)
    REFERENCES users (user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE user_roles
    ADD CONSTRAINT fk_user_roles_roles
    FOREIGN KEY (role_fid)
    REFERENCES roles (role_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE role_permissions
    ADD CONSTRAINT fk_role_permissions_roles
    FOREIGN KEY (role_fid)
    REFERENCES roles (role_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE role_permissions
    ADD CONSTRAINT fk_role_permissions_permissions
    FOREIGN KEY (permission_fid)
    REFERENCES permissions (permission_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE role_page_permissions
    ADD CONSTRAINT fk_role_page_permissions_roles
    FOREIGN KEY (role_fid)
    REFERENCES roles (role_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE role_page_permissions
    ADD CONSTRAINT fk_role_page_permissions_pages
    FOREIGN KEY (page_fid)
    REFERENCES pages (page_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- =========================================================
-- 1) Baseline indexes (FK columns + hot filters)
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_users_enterprize_fid ON users (enterprize_fid);
CREATE INDEX IF NOT EXISTS idx_roles_enterprize_fid ON roles (enterprize_fid);
CREATE INDEX IF NOT EXISTS idx_pages_enterprize_fid ON pages (enterprize_fid);
CREATE INDEX IF NOT EXISTS idx_pages_model_name ON pages (model_name);
CREATE INDEX IF NOT EXISTS idx_pages_enterprize_model_active ON pages (enterprize_fid, model_name, is_active);

CREATE INDEX IF NOT EXISTS idx_customers_enterprize_fid ON customers (enterprize_fid);
CREATE INDEX IF NOT EXISTS idx_field_config_model_name ON field_configurations (model_name);
CREATE INDEX IF NOT EXISTS idx_field_config_enterprize_fid ON field_configurations (enterprize_fid);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_fid ON user_roles (user_fid);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_fid ON user_roles (role_fid);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_fid ON role_permissions (role_fid);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_fid ON role_permissions (permission_fid);

CREATE INDEX IF NOT EXISTS idx_role_page_permissions_role_fid ON role_page_permissions (role_fid);
CREATE INDEX IF NOT EXISTS idx_role_page_permissions_page_fid ON role_page_permissions (page_fid);

CREATE INDEX IF NOT EXISTS idx_audit_logs_enterprize_fid ON audit_logs (enterprize_fid);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_fid ON audit_logs (user_fid);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_timestamp ON audit_logs (created_timestamp);

-- Session/auth hot paths (type mismatches prevent FK, but indexes still help)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_fid ON user_sessions (user_fid);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions (refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions (is_active);

CREATE INDEX IF NOT EXISTS idx_login_history_user_email ON login_history (user_email);
CREATE INDEX IF NOT EXISTS idx_login_history_user_fid ON login_history (user_fid);

CREATE INDEX IF NOT EXISTS idx_otp_verifications_user_fid ON otp_verifications (user_fid);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_otp_code ON otp_verifications (otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires ON otp_verifications (expires_timestamp);

CREATE INDEX IF NOT EXISTS idx_user_files_enterprize_fid ON user_files (enterprize_fid);
CREATE INDEX IF NOT EXISTS idx_user_files_user_fid ON user_files (user_fid);
CREATE INDEX IF NOT EXISTS idx_user_files_parent_id ON user_files (parent_id);

-- =========================================================
-- 2) Uniqueness (recommended, but NOT auto-applied here)
-- =========================================================
-- These are enterprise-grade expectations for data consistency, but will fail
-- if duplicates already exist. Apply only after cleanup:
--
-- CREATE UNIQUE INDEX CONCURRENTLY ux_user_roles_user_role ON user_roles (user_fid, role_fid);
-- CREATE UNIQUE INDEX CONCURRENTLY ux_role_permissions_role_perm ON role_permissions (role_fid, permission_fid);
-- CREATE UNIQUE INDEX CONCURRENTLY ux_role_page_permissions_role_page ON role_page_permissions (role_fid, page_fid);
--
-- For multi-tenant uniqueness (if pages/roles should be unique per enterprise):
-- CREATE UNIQUE INDEX CONCURRENTLY ux_pages_enterprize_route ON pages (enterprize_fid, page_route);
-- CREATE UNIQUE INDEX CONCURRENTLY ux_pages_enterprize_name ON pages (enterprize_fid, page_name);
-- CREATE UNIQUE INDEX CONCURRENTLY ux_roles_enterprize_name ON roles (enterprize_fid, role_name);

