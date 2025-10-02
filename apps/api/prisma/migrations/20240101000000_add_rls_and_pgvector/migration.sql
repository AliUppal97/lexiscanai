-- Enable Row Level Security on all tenant-scoped tables
-- This migration should be run after the initial schema setup

-- Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Enable RLS on billing table
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- Enable RLS on embeddings table
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant isolation
-- Users can only access their own tenant's data
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_documents ON documents
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_reviews ON reviews
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_billing ON billing
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_embeddings ON embeddings
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  USING (tenant_id = current_setting('app.current_tenant')::text);

-- Create function to set current tenant
CREATE OR REPLACE FUNCTION set_current_tenant(tenant_id text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_id, true);
END;
$$ LANGUAGE plpgsql;

-- Create function to get current tenant
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS text AS $$
BEGIN
  RETURN current_setting('app.current_tenant', true);
END;
$$ LANGUAGE plpgsql;

-- Add indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_reviews_tenant_id ON reviews(tenant_id);
CREATE INDEX idx_billing_tenant_id ON billing(tenant_id);
CREATE INDEX idx_embeddings_tenant_id ON embeddings(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- Add composite indexes for common queries
CREATE INDEX idx_documents_tenant_user ON documents(tenant_id, uploaded_by);
CREATE INDEX idx_reviews_tenant_document ON reviews(tenant_id, document_id);
CREATE INDEX idx_embeddings_tenant_document ON embeddings(tenant_id, document_id);

-- Add pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create index for vector similarity search
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
