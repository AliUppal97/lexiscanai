-- Enable Row Level Security on all tenant-scoped tables
-- This migration should be run after the initial schema setup

-- Note: pgvector extension not available in this PostgreSQL setup
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on permissions table
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on role_permissions table
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mfa_devices table
ALTER TABLE mfa_devices ENABLE ROW LEVEL SECURITY;

-- Enable RLS on sso_providers table
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on invitations table
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Enable RLS on billing table
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- Enable RLS on embeddings table
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant isolation
-- Users can only access their own tenant's data
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_roles ON roles
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_permissions ON permissions
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_user_roles ON user_roles
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_role_permissions ON role_permissions
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_sessions ON sessions
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_mfa_devices ON mfa_devices
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_sso_providers ON sso_providers
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_invitations ON invitations
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_documents ON documents
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_reviews ON reviews
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_billing ON billing
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_embeddings ON embeddings
  USING (tenant_id = current_setting('app.current_tenant')::text);

-- Create function to set current tenant
CREATE OR REPLACE FUNCTION set_current_tenant(tenant_id text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current tenant
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS text AS $$
BEGIN
  RETURN current_setting('app.current_tenant', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_permissions_tenant_id ON permissions(tenant_id);
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_role_permissions_tenant_id ON role_permissions(tenant_id);
CREATE INDEX idx_sessions_tenant_id ON sessions(tenant_id);
CREATE INDEX idx_mfa_devices_tenant_id ON mfa_devices(tenant_id);
CREATE INDEX idx_sso_providers_tenant_id ON sso_providers(tenant_id);
CREATE INDEX idx_invitations_tenant_id ON invitations(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_reviews_tenant_id ON reviews(tenant_id);
CREATE INDEX idx_billing_tenant_id ON billing(tenant_id);
CREATE INDEX idx_embeddings_tenant_id ON embeddings(tenant_id);

-- Add composite indexes for common queries
CREATE INDEX idx_documents_tenant_user ON documents(tenant_id, uploaded_by);
CREATE INDEX idx_reviews_tenant_document ON reviews(tenant_id, document_id);
CREATE INDEX idx_embeddings_tenant_document ON embeddings(tenant_id, document_id);

-- Note: Vector similarity search index not available without pgvector extension
-- CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
