/**
 * Notification Service - API client for notification management
 * 
 * Handles all notification-related API calls with proper error handling,
 * authentication, and type safety.
 */

import type { Notification } from "@/components/dashboard/NotificationCenter"
import type { JsonObject } from "@lexiscan/shared-types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export interface NotificationApiResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}

export interface CreateNotificationRequest {
  title: string
  message: string
  type: Notification['type']
  targetUserId?: string
  data?: JsonObject
  channels?: string[]
}

class NotificationService {
  private getAuthToken(): string | null {
    // Try localStorage first
    const token = localStorage.getItem('auth_token')
    if (token) return token

    // Fallback to cookies
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1]

    return cookieToken || null
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken()
    
    if (!token) {
      // Return empty data instead of throwing error when no token is available
      // This allows the app to work without authentication
      if (endpoint.includes('/notifications')) {
        return {
          notifications: [],
          total: 0,
          unreadCount: 0
        } as T
      }
      // For other endpoints, return empty object
      return {} as T
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Fetch notifications for the current user
   */
  async getNotifications(options: {
    unreadOnly?: boolean
    limit?: number
    offset?: number
  } = {}): Promise<NotificationApiResponse> {
    const params = new URLSearchParams()
    
    if (options.unreadOnly) params.append('unreadOnly', 'true')
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.offset) params.append('offset', options.offset.toString())

    const queryString = params.toString()
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`

    return this.makeRequest<NotificationApiResponse>(endpoint)
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await this.makeRequest('/notifications/mark-all-read', {
      method: 'PUT',
    })
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.makeRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    await this.makeRequest('/notifications/clear-all', {
      method: 'DELETE',
    })
  }

  /**
   * Send a notification (admin function)
   */
  async sendNotification(request: CreateNotificationRequest): Promise<void> {
    await this.makeRequest('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<{
    email: boolean
    push: boolean
    inApp: boolean
    sms: boolean
  }> {
    return this.makeRequest('/notifications/preferences')
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: {
    email?: boolean
    push?: boolean
    inApp?: boolean
    sms?: boolean
  }): Promise<void> {
    await this.makeRequest('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    })
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export class for testing
export { NotificationService }
