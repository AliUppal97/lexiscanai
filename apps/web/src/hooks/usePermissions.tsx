"use client"

import useSWR from "swr"
import { useAuth } from "./useAuth"
import { useCallback, useMemo } from "react"

export interface Role {
  id: string
  name: string
  description?: string
  isSystem: boolean
  isActive: boolean
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string // e.g., "documents.read", "users.create"
  resource: string // e.g., "documents", "users", "billing"
  action: string // e.g., "read", "create", "update", "delete", "manage"
  description?: string
}

interface UsePermissionsReturn {
  roles: Role[]
  permissions: Permission[]
  userRoles: Role[]
  userPermissions: Permission[]
  isLoading: boolean
  error: Error | null
  // Permission check functions
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  hasRole: (roleName: string) => boolean
  hasAnyRole: (roleNames: string[]) => boolean
  // Resource-specific checks
  canRead: (resource: string) => boolean
  canCreate: (resource: string) => boolean
  canUpdate: (resource: string) => boolean
  canDelete: (resource: string) => boolean
  canManage: (resource: string) => boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * usePermissions - Enterprise RBAC permission system
 * 
 * Features:
 * - Role-based access control (RBAC)
 * - Granular permission checks
 * - Multi-role support
 * - Permission inheritance
 * - Resource-based permissions
 * - Optimistic UI updates
 * - Type-safe permission checks
 * 
 * @example
 * const { hasPermission, canCreate, hasRole } = usePermissions()
 * 
 * // Check specific permission
 * if (hasPermission('documents.delete')) {
 *   return <DeleteButton />
 * }
 * 
 * // Check resource action
 * if (canCreate('documents')) {
 *   return <UploadButton />
 * }
 * 
 * // Check role
 * if (hasRole('Admin') || hasRole('Lawyer')) {
 *   return <AdvancedFeatures />
 * }
 * 
 * // Protect routes
 * if (!hasPermission('users.manage')) {
 *   return <Unauthorized />
 * }
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, session } = useAuth()

  // Fetch all available roles
  const { data: roles = [] } = useSWR<Role[]>(
    session?.accessToken ? [`${API_URL}/roles`, session.accessToken] : null,
    async ([url, token]) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch roles")
      return res.json()
    }
  )

  // Fetch all available permissions
  const { data: permissions = [] } = useSWR<Permission[]>(
    session?.accessToken ? [`${API_URL}/permissions`, session.accessToken] : null,
    async ([url, token]) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch permissions")
      return res.json()
    }
  )

  // Fetch user's roles and permissions
  const {
    data: userRolesData = [],
    error,
    isLoading,
  } = useSWR<Role[]>(
    session?.accessToken && user?.id
      ? [`${API_URL}/users/${user.id}/roles`, session.accessToken]
      : null,
    async ([url, token]) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch user roles")
      return res.json()
    },
    {
      revalidateOnFocus: false, // Don't revalidate on focus for security
      revalidateOnReconnect: true,
    }
  )

  // Flatten all permissions from all user roles
  const userPermissions = useMemo(() => {
    const permissionsMap = new Map<string, Permission>()
    
    userRolesData.forEach((role) => {
      role.permissions?.forEach((permission) => {
        permissionsMap.set(permission.id, permission)
      })
    })
    
    return Array.from(permissionsMap.values())
  }, [userRolesData])

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permissionName: string): boolean => {
      if (!user) return false
      
      // Admin role has all permissions
      const isAdmin = userRolesData.some((role) => 
        role.name.toLowerCase() === "admin" || 
        role.name.toLowerCase() === "super_admin"
      )
      if (isAdmin) return true

      return userPermissions.some((p) => p.name === permissionName)
    },
    [user, userRolesData, userPermissions]
  )

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback(
    (permissionNames: string[]): boolean => {
      return permissionNames.some((name) => hasPermission(name))
    },
    [hasPermission]
  )

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback(
    (permissionNames: string[]): boolean => {
      return permissionNames.every((name) => hasPermission(name))
    },
    [hasPermission]
  )

  // Check if user has a specific role
  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!user) return false
      return userRolesData.some(
        (role) => role.name.toLowerCase() === roleName.toLowerCase()
      )
    },
    [user, userRolesData]
  )

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roleNames: string[]): boolean => {
      return roleNames.some((name) => hasRole(name))
    },
    [hasRole]
  )

  // Resource-specific permission checks
  const canRead = useCallback(
    (resource: string): boolean => {
      return hasPermission(`${resource}.read`) || hasPermission(`${resource}.manage`)
    },
    [hasPermission]
  )

  const canCreate = useCallback(
    (resource: string): boolean => {
      return hasPermission(`${resource}.create`) || hasPermission(`${resource}.manage`)
    },
    [hasPermission]
  )

  const canUpdate = useCallback(
    (resource: string): boolean => {
      return hasPermission(`${resource}.update`) || hasPermission(`${resource}.manage`)
    },
    [hasPermission]
  )

  const canDelete = useCallback(
    (resource: string): boolean => {
      return hasPermission(`${resource}.delete`) || hasPermission(`${resource}.manage`)
    },
    [hasPermission]
  )

  const canManage = useCallback(
    (resource: string): boolean => {
      return hasPermission(`${resource}.manage`)
    },
    [hasPermission]
  )

  return {
    roles,
    permissions,
    userRoles: userRolesData,
    userPermissions,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canManage,
  }
}

/**
 * Higher-order component to protect components with permission checks
 * 
 * @example
 * export default withPermission(AdminPanel, 'users.manage')
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string | string[]
): React.ComponentType<P> {
  return function ProtectedComponent(props: P) {
    const { hasPermission, hasAnyPermission } = usePermissions()
    
    const hasAccess = Array.isArray(requiredPermission)
      ? hasAnyPermission(requiredPermission)
      : hasPermission(requiredPermission)

    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this resource.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * Hook to protect routes with role checks
 */
export function useRequireRole(roleName: string | string[]) {
  const { hasRole, hasAnyRole, isLoading } = usePermissions()
  const { user } = useAuth()

  const hasAccess = useMemo(() => {
    if (!user) return false
    return Array.isArray(roleName) ? hasAnyRole(roleName) : hasRole(roleName)
  }, [user, roleName, hasRole, hasAnyRole])

  return {
    hasAccess,
    isLoading,
  }
}

