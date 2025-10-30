"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWebSocket } from "./useWebSocket"
import { useAuth } from "./useAuth"
import { notificationService } from "@/services/notificationService"
import type { Notification } from "@/components/dashboard/NotificationCenter"

/**
 * useNotifications - Enterprise notification management hook
 * 
 * Comprehensive notification system with real-time updates, API integration,
 * and WebSocket support for live notifications.
 * 
 * Features:
 * - Real-time notifications via WebSocket
 * - Mark as read/unread functionality
 * - Bulk operations (mark all read, clear all)
 * - Notification filtering and pagination
 * - Auto-refresh and polling fallback
 * - Optimistic updates
 * - Error handling and retry logic
 * 
 * @example
 * const {
 *   notifications,
 *   unreadCount,
 *   isLoading,
 *   error,
 *   markAsRead,
 *   markAllAsRead,
 *   clearAll,
 *   refresh
 * } = useNotifications()
 */

export interface UseNotificationsOptions {
  /** Enable real-time updates via WebSocket */
  enableRealtime?: boolean
  /** Auto-refresh interval in milliseconds (default: 30000) */
  refreshInterval?: number
  /** Maximum number of notifications to fetch */
  limit?: number
  /** Show only unread notifications */
  unreadOnly?: boolean
}

export interface UseNotificationsReturn {
  /** Array of notifications */
  notifications: Notification[]
  /** Number of unread notifications */
  unreadCount: number
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: string | null
  /** Mark a notification as read */
  markAsRead: (id: string) => Promise<void>
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>
  /** Clear all notifications */
  clearAll: () => Promise<void>
  /** Refresh notifications */
  refresh: () => Promise<void>
  /** Handle notification click */
  onNotificationClick: (notification: Notification) => void
}


export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    enableRealtime = true,
    refreshInterval = 30000,
    limit = 50,
    unreadOnly = false
  } = options

  const { user, session } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    url: `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace('http', 'ws')}/notifications`,
    autoConnect: enableRealtime && !!user && !!session,
    onMessage: (message) => {
      if (message.type === 'notification') {
        handleNewNotification(message.data)
      }
    }
  })

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setError(null)
      
      // Only fetch notifications if user is authenticated
      if (!user || !session) {
        setNotifications([])
        setIsLoading(false)
        return
      }
      
      const data = await notificationService.getNotifications({
        limit,
        unreadOnly
      })
      
      // Transform API response to Notification format
      const transformedNotifications: Notification[] = data.notifications?.map((n: {
        id: string
        title: string
        message: string
        type?: string
        isRead?: boolean
        createdAt?: string
        actionLabel?: string
        href?: string
        onAction?: () => void
      }) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: (n.type as Notification['type']) || 'info',
        isRead: n.isRead || false,
        timestamp: n.createdAt || new Date().toISOString(),
        actionLabel: n.actionLabel,
        href: n.href,
        onAction: n.onAction
      })) || []

      setNotifications(transformedNotifications)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        setNotifications(getMockNotifications())
      }
    } finally {
      setIsLoading(false)
    }
  }, [limit, unreadOnly, user, session])

  /**
   * Handle new notification from WebSocket
   */
  const handleNewNotification = useCallback((newNotification: {
    id: string
    title: string
    message: string
    type?: string
    createdAt?: string
    actionLabel?: string
    href?: string
  }) => {
    const transformedNotification: Notification = {
      id: newNotification.id,
      title: newNotification.title,
      message: newNotification.message,
      type: (newNotification.type as Notification['type']) || 'info',
      isRead: false,
      timestamp: newNotification.createdAt || new Date().toISOString(),
      actionLabel: newNotification.actionLabel,
      href: newNotification.href
    }

    setNotifications(prev => [transformedNotification, ...prev])
  }, [])

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )

      // Only make API call if user is authenticated
      if (user && session) {
        await notificationService.markAsRead(id)
      }
    } catch (err) {
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: false } : n)
      )
      console.error('Failed to mark notification as read:', err)
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
    }
  }, [user, session])

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      )

      // Only make API call if user is authenticated
      if (user && session) {
        await notificationService.markAllAsRead()
      }
    } catch (err) {
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: false }))
      )
      console.error('Failed to mark all notifications as read:', err)
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read')
    }
  }, [user, session])

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(async () => {
    try {
      // Only make API call if user is authenticated
      if (user && session) {
        await notificationService.clearAll()
      }
      setNotifications([])
    } catch (err) {
      console.error('Failed to clear all notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear all notifications')
    }
  }, [user, session])

  /**
   * Refresh notifications
   */
  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchNotifications()
  }, [fetchNotifications])

  /**
   * Handle notification click
   */
  const onNotificationClick = useCallback((notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id)
    }

    // Navigate to href if provided
    if (notification.href) {
      window.location.href = notification.href
    }

    // Execute custom action if provided
    if (notification.onAction) {
      notification.onAction()
    }
  }, [markAsRead])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Auto-refresh when WebSocket is disconnected
  useEffect(() => {
    if (!isConnected && refreshInterval > 0) {
      refreshTimeoutRef.current = setInterval(() => {
        fetchNotifications()
      }, refreshInterval)

      return () => {
        if (refreshTimeoutRef.current) {
          clearInterval(refreshTimeoutRef.current)
          refreshTimeoutRef.current = null
        }
      }
    }
  }, [isConnected, refreshInterval, fetchNotifications])

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }
    }
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearAll,
    refresh,
    onNotificationClick
  }
}

/**
 * Mock notifications for development
 */
function getMockNotifications(): Notification[] {
  return [
    {
      id: '1',
      title: 'Document Processing Complete',
      message: 'Your contract analysis has been completed successfully.',
      type: 'success',
      isRead: false,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      actionLabel: 'View Results',
      href: '/dashboard/documents'
    },
    {
      id: '2',
      title: 'Team Invitation',
      message: 'Sarah Johnson has invited you to join the Legal Team workspace.',
      type: 'info',
      isRead: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      actionLabel: 'Accept',
      href: '/dashboard/team'
    },
    {
      id: '3',
      title: 'Billing Update',
      message: 'Your subscription will renew on January 15, 2024.',
      type: 'warning',
      isRead: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      actionLabel: 'View Billing',
      href: '/dashboard/billing'
    },
    {
      id: '4',
      title: 'Security Alert',
      message: 'New login detected from a different device.',
      type: 'error',
      isRead: true,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      actionLabel: 'Review',
      href: '/dashboard/security'
    },
    {
      id: '5',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2-4 AM EST.',
      type: 'info',
      isRead: true,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    }
  ]
}
