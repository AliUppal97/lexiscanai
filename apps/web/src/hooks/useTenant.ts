"use client"

import useSWR from "swr"
import { useAuth } from "./useAuth"
import { useToast } from "./useToast"
import { useCallback } from "react"

export interface Tenant {
  id: string
  internalId: number
  name: string
  slug: string
  domain?: string
  logo?: string
  settings?: {
    maxUsers?: number
    maxDocuments?: number
    maxStorage?: number
    features?: string[]
    branding?: {
      primaryColor?: string
      secondaryColor?: string
      favicon?: string
    }
  }
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface TenantMember {
  id: string
  userId: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  roles: string[]
  isActive: boolean
  joinedAt: string
}

export interface TenantInvitation {
  id: string
  email: string
  roleId: string
  invitedBy: string
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"
  expiresAt: string
  createdAt: string
}

interface UseTenantReturn {
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * useTenant - Multi-tenant organization management
 * 
 * Features:
 * - Tenant data management
 * - Member management (invite, remove, update roles)
 * - Invitation system
 * - Tenant switching for multi-org users
 * - Organization settings
 * - Custom branding
 * - Usage limits and quotas
 * 
 * @example
 * const { tenant, members, inviteMember, updateTenant } = useTenant()
 * 
 * const handleInvite = async (email: string) => {
 *   await inviteMember(email, 'lawyer-role-id')
 * }
 */
export function useTenant(): UseTenantReturn {
  const { user, session } = useAuth()
  const { success, error: showError } = useToast()

  // Fetch tenant data
  const {
    data: tenant,
    error: tenantError,
    isLoading: tenantLoading,
    mutate: mutateTenant,
  } = useSWR<Tenant>(
    session?.accessToken && user?.tenantId
      ? [`${API_URL}/tenants/${user.tenantId}`, session.accessToken]
      : null,
    async ([url, token]) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch tenant")
      return res.json()
    }
  )

  // Fetch tenant members
  const {
    data: members = [],
    mutate: mutateMembers,
  } = useSWR<TenantMember[]>(
    session?.accessToken && user?.tenantId
      ? [`${API_URL}/tenants/${user.tenantId}/members`, session.accessToken]
      : null,
    async ([url, token]) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch members")
      return res.json()
    }
  )

  // Fetch pending invitations
  const {
    data: invitations = [],
    mutate: mutateInvitations,
  } = useSWR<TenantInvitation[]>(
    session?.accessToken && user?.tenantId
      ? [`${API_URL}/tenants/${user.tenantId}/invitations`, session.accessToken]
      : null,
    async ([url, token]) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch invitations")
      return res.json()
    }
  )

  // Update tenant
  const updateTenant = useCallback(
    async (data: Partial<Tenant>) => {
      if (!session?.accessToken || !user?.tenantId) {
        throw new Error("Not authenticated")
      }

      try {
        await mutateTenant(
          async () => {
            const res = await fetch(`${API_URL}/tenants/${user.tenantId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.accessToken}`,
              },
              body: JSON.stringify(data),
            })

            if (!res.ok) {
              throw new Error("Failed to update organization")
            }

            return res.json()
          },
          {
            optimisticData: { ...tenant, ...data } as Tenant,
            rollbackOnError: true,
            populateCache: true,
          }
        )

        success("Organization updated", "Your changes have been saved")
      } catch (err) {
        showError("Update failed", (err as Error).message)
        throw err
      }
    },
    [session, user, tenant, mutateTenant, success, showError]
  )

  // Upload logo
  const uploadLogo = useCallback(
    async (file: File): Promise<string> => {
      if (!session?.accessToken || !user?.tenantId) {
        throw new Error("Not authenticated")
      }

      // Validate file
      const maxSize = 2 * 1024 * 1024 // 2MB
      const allowedTypes = ["image/png", "image/svg+xml"]

      if (file.size > maxSize) {
        throw new Error("Logo must be less than 2MB")
      }

      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only PNG and SVG logos are allowed")
      }

      try {
        const formData = new FormData()
        formData.append("logo", file)

        const res = await fetch(`${API_URL}/tenants/${user.tenantId}/logo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: formData,
        })

        if (!res.ok) {
          throw new Error("Failed to upload logo")
        }

        const data = await res.json()
        await mutateTenant({ ...tenant, logo: data.url } as Tenant, false)
        
        success("Logo updated", "Your organization logo has been updated")
        return data.url
      } catch (err) {
        showError("Upload failed", (err as Error).message)
        throw err
      }
    },
    [session, user, tenant, mutateTenant, success, showError]
  )

  // Invite member
  const inviteMember = useCallback(
    async (email: string, roleId: string) => {
      if (!session?.accessToken || !user?.tenantId) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/tenants/${user.tenantId}/invitations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ email, roleId }),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || "Failed to send invitation")
        }

        await mutateInvitations()
        success("Invitation sent", `An invitation has been sent to ${email}`)
      } catch (err) {
        showError("Invitation failed", (err as Error).message)
        throw err
      }
    },
    [session, user, mutateInvitations, success, showError]
  )

  // Remove member
  const removeMember = useCallback(
    async (userId: string) => {
      if (!session?.accessToken || !user?.tenantId) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/tenants/${user.tenantId}/members/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to remove member")
        }

        await mutateMembers(members.filter((m) => m.userId !== userId), false)
        success("Member removed", "The member has been removed from your organization")
      } catch (err) {
        showError("Remove failed", (err as Error).message)
        throw err
      }
    },
    [session, user, members, mutateMembers, success, showError]
  )

  // Update member roles
  const updateMemberRoles = useCallback(
    async (userId: string, roleIds: string[]) => {
      if (!session?.accessToken || !user?.tenantId) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/tenants/${user.tenantId}/members/${userId}/roles`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ roleIds }),
        })

        if (!res.ok) {
          throw new Error("Failed to update member roles")
        }

        await mutateMembers()
        success("Roles updated", "Member roles have been updated")
      } catch (err) {
        showError("Update failed", (err as Error).message)
        throw err
      }
    },
    [session, user, mutateMembers, success, showError]
  )

  // Revoke invitation
  const revokeInvitation = useCallback(
    async (invitationId: string) => {
      if (!session?.accessToken || !user?.tenantId) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/tenants/${user.tenantId}/invitations/${invitationId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to revoke invitation")
        }

        await mutateInvitations(invitations.filter((i) => i.id !== invitationId), false)
        success("Invitation revoked", "The invitation has been revoked")
      } catch (err) {
        showError("Revoke failed", (err as Error).message)
        throw err
      }
    },
    [session, user, invitations, mutateInvitations, success, showError]
  )

  // Resend invitation
  const resendInvitation = useCallback(
    async (invitationId: string) => {
      if (!session?.accessToken || !user?.tenantId) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(
          `${API_URL}/tenants/${user.tenantId}/invitations/${invitationId}/resend`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        )

        if (!res.ok) {
          throw new Error("Failed to resend invitation")
        }

        success("Invitation resent", "The invitation has been sent again")
      } catch (err) {
        showError("Resend failed", (err as Error).message)
        throw err
      }
    },
    [session, user, success, showError]
  )

  // Switch tenant (for users who belong to multiple organizations)
  const switchTenant = useCallback(
    async (tenantId: string) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/auth/switch-tenant`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ tenantId }),
        })

        if (!res.ok) {
          throw new Error("Failed to switch organization")
        }

        // Reload the page to refresh all tenant-specific data
        window.location.reload()
      } catch (err) {
        showError("Switch failed", (err as Error).message)
        throw err
      }
    },
    [session, showError]
  )

  return {
    tenant: tenant ?? null,
    members,
    invitations,
    isLoading: tenantLoading,
    error: tenantError,
    updateTenant,
    uploadLogo,
    inviteMember,
    removeMember,
    updateMemberRoles,
    revokeInvitation,
    resendInvitation,
    switchTenant,
  }
}

