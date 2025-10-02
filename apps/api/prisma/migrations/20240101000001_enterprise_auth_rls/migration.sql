-- Row-Level Security (RLS) Migration for LexiScanAI
-- This migration enables tenant isolation and security policies

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TENANT ISOLATION POLICIES
-- ============================================================================

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

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to set current tenant context
CREATE OR REPLACE FUNCTION set_current_tenant(tenant_id text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current tenant
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS text AS $$
BEGIN
  RETURN current_setting('app.current_tenant', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate user belongs to tenant
CREATE OR REPLACE FUNCTION user_belongs_to_tenant(user_id text, tenant_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM users 
    WHERE id = user_id AND tenant_id = user_belongs_to_tenant.tenant_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION user_has_permission(user_id text, permission_name text)
RETURNS boolean AS $$
DECLARE
  current_tenant_id text;
BEGIN
  current_tenant_id := get_current_tenant();
  
  RETURN EXISTS(
    SELECT 1 
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_id 
      AND ur.tenant_id = current_tenant_id
      AND p.name = permission_name
      AND p.tenant_id = current_tenant_id
      AND ur.expires_at IS NULL OR ur.expires_at > NOW()
      AND p.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_tenant_active ON users(tenant_id, is_active);
CREATE INDEX idx_sessions_tenant_user ON sessions(tenant_id, user_id);
CREATE INDEX idx_sessions_active ON sessions(is_active, expires_at);
CREATE INDEX idx_user_roles_tenant_user ON user_roles(tenant_id, user_id);
CREATE INDEX idx_role_permissions_tenant_role ON role_permissions(tenant_id, role_id);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at);
CREATE INDEX idx_documents_tenant_user ON documents(tenant_id, uploaded_by);
CREATE INDEX idx_documents_tenant_status ON documents(tenant_id, status);
CREATE INDEX idx_reviews_tenant_document ON reviews(tenant_id, document_id);
CREATE INDEX idx_embeddings_tenant_document ON embeddings(tenant_id, document_id);

-- Vector similarity search index
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- SECURITY FUNCTIONS
-- ============================================================================

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_tenant_id text,
  p_user_id text DEFAULT NULL,
  p_action text,
  p_resource text,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    tenant_id, user_id, action, resource, resource_id, 
    details, ip_address, user_agent, session_id
  ) VALUES (
    p_tenant_id, p_user_id, p_action, p_resource, p_resource_id,
    p_details, p_ip_address, p_user_agent, p_session_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to hash refresh tokens
CREATE OR REPLACE FUNCTION hash_refresh_token(token text)
RETURNS text AS $$
BEGIN
  RETURN encode(digest(token, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS FOR AUDIT LOGGING
-- ============================================================================

-- Trigger function for user changes
CREATE OR REPLACE FUNCTION audit_user_changes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      NEW.tenant_id,
      NEW.id,
      'user.created',
      'user',
      NEW.id,
      to_jsonb(NEW),
      NULL,
      NULL,
      NULL
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_audit_log(
      NEW.tenant_id,
      NEW.id,
      'user.updated',
      'user',
      NEW.id,
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)),
      NULL,
      NULL,
      NULL
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      OLD.tenant_id,
      OLD.id,
      'user.deleted',
      'user',
      OLD.id,
      to_jsonb(OLD),
      NULL,
      NULL,
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER user_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

-- ============================================================================
-- SESSION MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE sessions 
  SET is_active = false, revoked_at = NOW()
  WHERE expires_at < NOW() AND is_active = true;
  
  DELETE FROM sessions 
  WHERE revoked_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke all user sessions
CREATE OR REPLACE FUNCTION revoke_user_sessions(p_user_id text, p_tenant_id text)
RETURNS void AS $$
BEGIN
  UPDATE sessions 
  SET is_active = false, revoked_at = NOW()
  WHERE user_id = p_user_id AND tenant_id = p_tenant_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA SEEDING
-- ============================================================================

-- Create default permissions for each tenant
CREATE OR REPLACE FUNCTION create_default_permissions(p_tenant_id text)
RETURNS void AS $$
BEGIN
  -- Document permissions
  INSERT INTO permissions (name, resource, action, description, is_system, tenant_id)
  VALUES 
    ('documents.read', 'documents', 'read', 'Read documents', true, p_tenant_id),
    ('documents.create', 'documents', 'create', 'Create documents', true, p_tenant_id),
    ('documents.update', 'documents', 'update', 'Update documents', true, p_tenant_id),
    ('documents.delete', 'documents', 'delete', 'Delete documents', true, p_tenant_id),
    ('documents.manage', 'documents', 'manage', 'Manage all documents', true, p_tenant_id),
    
    -- User permissions
    ('users.read', 'users', 'read', 'Read user information', true, p_tenant_id),
    ('users.create', 'users', 'create', 'Create users', true, p_tenant_id),
    ('users.update', 'users', 'update', 'Update users', true, p_tenant_id),
    ('users.delete', 'users', 'delete', 'Delete users', true, p_tenant_id),
    ('users.manage', 'users', 'manage', 'Manage all users', true, p_tenant_id),
    
    -- Role permissions
    ('roles.read', 'roles', 'read', 'Read roles', true, p_tenant_id),
    ('roles.create', 'roles', 'create', 'Create roles', true, p_tenant_id),
    ('roles.update', 'roles', 'update', 'Update roles', true, p_tenant_id),
    ('roles.delete', 'roles', 'delete', 'Delete roles', true, p_tenant_id),
    ('roles.assign', 'roles', 'assign', 'Assign roles to users', true, p_tenant_id),
    
    -- Billing permissions
    ('billing.read', 'billing', 'read', 'Read billing information', true, p_tenant_id),
    ('billing.manage', 'billing', 'manage', 'Manage billing', true, p_tenant_id),
    
    -- Admin permissions
    ('admin.manage', 'admin', 'manage', 'Full admin access', true, p_tenant_id)
  ON CONFLICT (name, tenant_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default roles for each tenant
CREATE OR REPLACE FUNCTION create_default_roles(p_tenant_id text)
RETURNS void AS $$
DECLARE
  admin_role_id text;
  lawyer_role_id text;
  paralegal_role_id text;
  viewer_role_id text;
BEGIN
  -- Create roles
  INSERT INTO roles (name, description, is_system, tenant_id)
  VALUES 
    ('Admin', 'Full administrative access', true, p_tenant_id),
    ('Lawyer', 'Legal professional with document access', true, p_tenant_id),
    ('Paralegal', 'Legal support staff', true, p_tenant_id),
    ('Viewer', 'Read-only access', true, p_tenant_id)
  ON CONFLICT (name, tenant_id) DO NOTHING
  RETURNING id INTO admin_role_id;
  
  -- Get role IDs
  SELECT id INTO admin_role_id FROM roles WHERE name = 'Admin' AND tenant_id = p_tenant_id;
  SELECT id INTO lawyer_role_id FROM roles WHERE name = 'Lawyer' AND tenant_id = p_tenant_id;
  SELECT id INTO paralegal_role_id FROM roles WHERE name = 'Paralegal' AND tenant_id = p_tenant_id;
  SELECT id INTO viewer_role_id FROM roles WHERE name = 'Viewer' AND tenant_id = p_tenant_id;
  
  -- Assign permissions to Admin role (all permissions)
  INSERT INTO role_permissions (role_id, permission_id, tenant_id)
  SELECT admin_role_id, id, p_tenant_id
  FROM permissions 
  WHERE tenant_id = p_tenant_id
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  -- Assign permissions to Lawyer role
  INSERT INTO role_permissions (role_id, permission_id, tenant_id)
  SELECT lawyer_role_id, id, p_tenant_id
  FROM permissions 
  WHERE tenant_id = p_tenant_id 
    AND name IN ('documents.read', 'documents.create', 'documents.update', 'users.read')
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  -- Assign permissions to Paralegal role
  INSERT INTO role_permissions (role_id, permission_id, tenant_id)
  SELECT paralegal_role_id, id, p_tenant_id
  FROM permissions 
  WHERE tenant_id = p_tenant_id 
    AND name IN ('documents.read', 'documents.create', 'users.read')
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  -- Assign permissions to Viewer role
  INSERT INTO role_permissions (role_id, permission_id, tenant_id)
  SELECT viewer_role_id, id, p_tenant_id
  FROM permissions 
  WHERE tenant_id = p_tenant_id 
    AND name IN ('documents.read', 'users.read')
  ON CONFLICT (role_id, permission_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

