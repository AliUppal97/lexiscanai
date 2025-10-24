"use client"

import useSWR from "swr"
import { useAuth, type User } from "./useAuth"
import { useToast } from "./useToast"
import { useCallback } from "react"

export interface UserPreferences {
  theme?: "light" | "dark" | "system"
  language?: string
  timezone?: string
  notifications?: {
    email?: boolean
    push?: boolean
    documentProcessed?: boolean
    reviewCompleted?: boolean
    weeklyReport?: boolean
  }
  dashboard?: {
    layout?: "grid" | "list"
    itemsPerPage?: number
    defaultView?: string
  }
}

interface UseUserReturn {
  user: User | null
  preferences: UserPreferences | null
  isLoading: boolean
  error: Error | null
  updateProfile: (data: Partial<User>) => Promise<void>
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  deleteAvatar: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerification: () => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * useUser - User profile and preferences management
 * 
 * Features:
 * - User profile CRUD operations
 * - Preference management
 * - Avatar upload/delete
 * - Password change
 * - Email verification
 * - Optimistic updates with SWR
 * - Type-safe preferences
 * 
 * @example
 * const { user, preferences, updateProfile, updatePreferences } = useUser()
 * 
 * const handleThemeChange = async (theme: 'light' | 'dark') => {
 *   await updatePreferences({ theme })
 * }
 */
export function useUser(): UseUserReturn {
  const { user, session, updateUser } = useAuth()
  const { success, error: showError } = useToast()

  // Fetch user preferences
  const {
    data: preferences,
    error,
    isLoading,
    mutate: mutatePreferences,
  } = useSWR<UserPreferences>(
    session?.accessToken ? [`${API_URL}/users/preferences`, session.accessToken] : null,
    async ([url, token]) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch preferences")
      return res.json()
    }
  )

  // Update user profile
  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      try {
        await updateUser(data)
      } catch (err) {
        throw err
      }
    },
    [updateUser]
  )

  // Update preferences
  const updatePreferences = useCallback(
    async (prefs: Partial<UserPreferences>) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      try {
        // Optimistic update
        await mutatePreferences(
          async () => {
            const res = await fetch(`${API_URL}/users/preferences`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.accessToken}`,
              },
              body: JSON.stringify(prefs),
            })

            if (!res.ok) {
              throw new Error("Failed to update preferences")
            }

            return res.json()
          },
          {
            optimisticData: { ...preferences, ...prefs } as UserPreferences,
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          }
        )

        success("Preferences updated", "Your settings have been saved")
      } catch (err) {
        showError("Update failed", (err as Error).message)
        throw err
      }
    },
    [session, preferences, mutatePreferences, success, showError]
  )

  // Upload avatar
  const uploadAvatar = useCallback(
    async (file: File): Promise<string> => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      // Validate file
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"]

      if (file.size > maxSize) {
        throw new Error("File size must be less than 5MB")
      }

      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPEG, PNG, and WebP images are allowed")
      }

      try {
        const formData = new FormData()
        formData.append("avatar", file)

        const res = await fetch(`${API_URL}/users/avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: formData,
        })

        if (!res.ok) {
          throw new Error("Failed to upload avatar")
        }

        const data = await res.json()
        await updateUser({ avatar: data.url })
        
        success("Avatar updated", "Your profile picture has been updated")
        return data.url
      } catch (err) {
        showError("Upload failed", (err as Error).message)
        throw err
      }
    },
    [session, updateUser, success, showError]
  )

  // Delete avatar
  const deleteAvatar = useCallback(async () => {
    if (!session?.accessToken) {
      throw new Error("Not authenticated")
    }

    try {
      const res = await fetch(`${API_URL}/users/avatar`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to delete avatar")
      }

      await updateUser({ avatar: undefined })
      success("Avatar removed", "Your profile picture has been removed")
    } catch (err) {
      showError("Delete failed", (err as Error).message)
      throw err
    }
  }, [session, updateUser, success, showError])

  // Change password
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated")
      }

      try {
        const res = await fetch(`${API_URL}/users/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || "Failed to change password")
        }

        success("Password changed", "Your password has been updated successfully")
      } catch (err) {
        showError("Password change failed", (err as Error).message)
        throw err
      }
    },
    [session, success, showError]
  )

  // Verify email
  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        const res = await fetch(`${API_URL}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (!res.ok) {
          throw new Error("Failed to verify email")
        }

        await updateUser({ isEmailVerified: true })
        success("Email verified", "Your email has been verified successfully")
      } catch (err) {
        showError("Verification failed", (err as Error).message)
        throw err
      }
    },
    [updateUser, success, showError]
  )

  // Resend verification email
  const resendVerification = useCallback(async () => {
    if (!session?.accessToken) {
      throw new Error("Not authenticated")
    }

    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to resend verification email")
      }

      success("Email sent", "Verification email has been sent to your inbox")
    } catch (err) {
      showError("Failed to send email", (err as Error).message)
      throw err
    }
  }, [session, success, showError])

  return {
    user,
    preferences: preferences ?? null,
    isLoading,
    error,
    updateProfile,
    updatePreferences,
    uploadAvatar,
    deleteAvatar,
    changePassword,
    verifyEmail,
    resendVerification,
  }
}

