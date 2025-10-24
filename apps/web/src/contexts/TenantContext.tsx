"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useTenant as useTenantHook, type Tenant, type TenantMember, type TenantInvitation } from "@/hooks/useTenant"

/**
 * TenantContext - Multi-tenant organization management
 * 
 * Features:
 * - Organization data access
 * - Member management
 * - Invitation system
 * - Custom branding
 * - Tenant switching
 * - Usage quotas
 * 
 * @example
 * // Wrap your app with TenantProvider
 * <TenantProvider>
 *   <App />
 * </TenantProvider>
 * 
 * // Use in components
 * const { tenant, members, inviteMember } = useTenantContext()
 */

interface TenantContextValue {
  tenant: Tenant | null
  members: TenantMember[]
  invitations: TenantInvitation[]
  isLoading: boolean
  error: Error | null
  updateTenant: (data: Partial<Tenant>) => Promise<void>
  uploadLogo: (file: File) => Promise<string>
  inviteMember: (email: string, roleId: string) => Promise<void>
  removeMember: (userId: string) => Promise<void>
  updateMemberRoles: (userId: string, roleIds: string[]) => Promise<void>
  revokeInvitation: (invitationId: string) => Promise<void>
  resendInvitation: (invitationId: string) => Promise<void>
  switchTenant: (tenantId: string) => Promise<void>
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
}

/**
 * TenantProvider - Provides tenant/organization context to the entire app
 * 
 * This provider should be nested inside AuthProvider since it requires authentication
 */
export function TenantProvider({ children }: TenantProviderProps) {
  const tenant = useTenantHook()

  const value: TenantContextValue = {
    tenant: tenant.tenant,
    members: tenant.members,
    invitations: tenant.invitations,
    isLoading: tenant.isLoading,
    error: tenant.error,
    updateTenant: tenant.updateTenant,
    uploadLogo: tenant.uploadLogo,
    inviteMember: tenant.inviteMember,
    removeMember: tenant.removeMember,
    updateMemberRoles: tenant.updateMemberRoles,
    revokeInvitation: tenant.revokeInvitation,
    resendInvitation: tenant.resendInvitation,
    switchTenant: tenant.switchTenant,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

/**
 * useTenantContext - Hook to access tenant/organization context
 * 
 * @throws {Error} If used outside of TenantProvider
 * 
 * @example
 * const { tenant, members, inviteMember } = useTenantContext()
 * 
 * const handleInvite = async (email: string) => {
 *   await inviteMember(email, 'lawyer-role-id')
 * }
 * 
 * return (
 *   <div>
 *     <h1>{tenant?.name}</h1>
 *     <p>{members.length} members</p>
 *     <InviteButton onClick={handleInvite} />
 *   </div>
 * )
 */
export function useTenantContext() {
  const context = useContext(TenantContext)
  
  if (context === undefined) {
    throw new Error("useTenantContext must be used within a TenantProvider")
  }
  
  return context
}

/**
 * RequireTenant - Component wrapper that ensures tenant is loaded
 * 
 * @example
 * <RequireTenant>
 *   <OrganizationSettings />
 * </RequireTenant>
 */
export function RequireTenant({ 
  children,
  fallback
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  const { tenant, isLoading } = useTenantContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!tenant) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Organization Not Found</h2>
          <p className="text-gray-600">Unable to load organization data.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * TenantBranding - Component that applies tenant-specific branding
 * 
 * @example
 * <TenantBranding>
 *   <App />
 * </TenantBranding>
 */
export function TenantBranding({ children }: { children: ReactNode }) {
  const { tenant } = useTenantContext()

  React.useEffect(() => {
    if (typeof window === "undefined" || !tenant?.settings?.branding) return

    const branding = tenant.settings.branding

    // Apply custom colors
    if (branding.primaryColor) {
      document.documentElement.style.setProperty("--color-primary", branding.primaryColor)
    }
    if (branding.secondaryColor) {
      document.documentElement.style.setProperty("--color-secondary", branding.secondaryColor)
    }

    // Apply custom favicon
    if (branding.favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement("link")
      link.type = "image/x-icon"
      link.rel = "shortcut icon"
      link.href = branding.favicon
      if (!document.querySelector("link[rel*='icon']")) {
        document.getElementsByTagName("head")[0].appendChild(link)
      }
    }

    // Cleanup
    return () => {
      document.documentElement.style.removeProperty("--color-primary")
      document.documentElement.style.removeProperty("--color-secondary")
    }
  }, [tenant])

  return <>{children}</>
}

/**
 * withTenantAccess - HOC to protect components that require specific tenant access
 * 
 * @example
 * export default withTenantAccess(AdminPanel, { requireActive: true })
 */
export function withTenantAccess<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireActive?: boolean
    loadingComponent?: React.ComponentType
  }
) {
  return function TenantProtectedComponent(props: P) {
    const { tenant, isLoading } = useTenantContext()

    if (isLoading) {
      const LoadingComponent = options?.loadingComponent
      return LoadingComponent ? <LoadingComponent /> : (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!tenant) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Organization Required</h2>
            <p className="text-gray-600">You need to be part of an organization to access this.</p>
          </div>
        </div>
      )
    }

    if (options?.requireActive && !tenant.isActive) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Organization Inactive</h2>
            <p className="text-gray-600">This organization is currently inactive. Please contact support.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * useTenantSettings - Hook to access tenant-specific settings
 * 
 * @example
 * const { maxUsers, maxDocuments, features } = useTenantSettings()
 */
export function useTenantSettings() {
  const { tenant } = useTenantContext()

  return {
    maxUsers: tenant?.settings?.maxUsers,
    maxDocuments: tenant?.settings?.maxDocuments,
    maxStorage: tenant?.settings?.maxStorage,
    features: tenant?.settings?.features || [],
    branding: tenant?.settings?.branding,
    hasFeature: (feature: string) => {
      return tenant?.settings?.features?.includes(feature) || false
    },
  }
}

