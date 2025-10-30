"use client"

import React, { createContext, useContext, useCallback, ReactNode } from "react"
import { useToast, toast as globalToast, type Toast, type ToastType } from "@/hooks/useToast"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useEffect } from "react"

/**
 * NotificationContext - Global notification system
 * 
 * Features:
 * - Toast notifications
 * - Real-time notifications via WebSocket
 * - In-app notification center
 * - Push notification support
 * - Notification preferences
 * - Read/unread tracking
 * - Action callbacks
 * 
 * @example
 * // Wrap your app with NotificationProvider
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 * 
 * // Use in components
 * const { notify, success, error, notifications } = useNotifications()
 */

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message?: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
  metadata?: Record<string, unknown>
}

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  // Toast methods
  notify: (title: string, message?: string, type?: ToastType) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  // Notification center methods
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismissNotification: (id: string) => void
  clearAll: () => void
  // Custom notification with action
  notifyWithAction: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
  enableRealtime?: boolean
  maxNotifications?: number
}

/**
 * NotificationProvider - Provides notification context to the entire app
 * 
 * Manages both toast notifications and in-app notification center
 */
export function NotificationProvider({ 
  children,
  enableRealtime = true,
  maxNotifications = 50
}: NotificationProviderProps) {
  const { toast, success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useToast()
  const [notifications, setNotifications] = React.useState<Notification[]>([])

  // Connect to WebSocket for real-time notifications
  const { subscribe } = useWebSocket({
    autoConnect: enableRealtime,
  })

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!enableRealtime) return

    const unsubscribe = subscribe("notification", (data: unknown) => {
      // Add to notification center
      addNotification({
        type: data.type || "info",
        title: data.title,
        message: data.message,
        action: data.action,
        metadata: data.metadata,
      })

      // Show toast
      const toastFn = data.type === "error" ? toastError :
                      data.type === "success" ? toastSuccess :
                      data.type === "warning" ? toastWarning :
                      toastInfo

      toastFn(data.title, data.message)
    })

    return unsubscribe
  }, [enableRealtime, subscribe, toastError, toastSuccess, toastWarning, toastInfo, addNotification])

  // Add notification to center
  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      // Keep only the most recent notifications
      return updated.slice(0, maxNotifications)
    })
  }, [maxNotifications])

  // Toast notification methods
  const notify = useCallback((title: string, message?: string, type: ToastType = "default") => {
    toast({ title, description: message, type })
    
    // Also add to notification center
    addNotification({
      type: type === "default" ? "info" : type,
      title,
      message,
    })
  }, [toast, addNotification])

  const success = useCallback((title: string, message?: string) => {
    toastSuccess(title, message)
    addNotification({ type: "success", title, message })
  }, [toastSuccess, addNotification])

  const error = useCallback((title: string, message?: string) => {
    toastError(title, message)
    addNotification({ type: "error", title, message })
  }, [toastError, addNotification])

  const warning = useCallback((title: string, message?: string) => {
    toastWarning(title, message)
    addNotification({ type: "warning", title, message })
  }, [toastWarning, addNotification])

  const info = useCallback((title: string, message?: string) => {
    toastInfo(title, message)
    addNotification({ type: "info", title, message })
  }, [toastInfo, addNotification])

  const notifyWithAction = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    toast({
      title: notification.title,
      description: notification.message,
      type: notification.type,
      action: notification.action,
    })
    
    addNotification(notification)
  }, [toast, addNotification])

  // Notification center methods
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    notify,
    success,
    error,
    warning,
    info,
    notifyWithAction,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

/**
 * useNotifications - Hook to access notification context
 * 
 * @throws {Error} If used outside of NotificationProvider
 * 
 * @example
 * const { success, error, notifications, unreadCount } = useNotifications()
 * 
 * // Show success toast
 * success('Document uploaded', 'Your file is being processed')
 * 
 * // Show error toast
 * error('Upload failed', 'Please try again')
 * 
 * // Access notification center
 * return (
 *   <div>
 *     <Badge count={unreadCount} />
 *     <NotificationList items={notifications} />
 *   </div>
 * )
 */
export function useNotifications() {
  const context = useContext(NotificationContext)
  
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  
  return context
}

/**
 * NotificationBell - Pre-built notification bell icon with badge
 * 
 * @example
 * import { NotificationBell } from '@/contexts/NotificationContext'
 * 
 * <NotificationBell onClick={openNotificationPanel} />
 */
export function NotificationBell({ 
  onClick,
  className = ""
}: { 
  onClick?: () => void
  className?: string 
}) {
  const { unreadCount } = useNotifications()

  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  )
}

/**
 * NotificationItem - Pre-built notification list item component
 */
export function NotificationItem({ 
  notification,
  onDismiss,
  onMarkAsRead
}: { 
  notification: Notification
  onDismiss?: (id: string) => void
  onMarkAsRead?: (id: string) => void
}) {
  const typeColors = {
    info: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-yellow-50 text-yellow-600",
    error: "bg-red-50 text-red-600",
  }

  const typeIcons = {
    info: "ℹ️",
    success: "✓",
    warning: "⚠",
    error: "✕",
  }

  return (
    <div
      className={`relative flex gap-3 rounded-lg border p-4 ${
        notification.read ? "bg-gray-50" : "bg-white"
      } transition-colors hover:bg-gray-50`}
    >
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${typeColors[notification.type]}`}>
        <span>{typeIcons[notification.type]}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
            {notification.message && (
              <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
            )}
          </div>
          
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead?.(notification.id)}
              className="text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap"
            >
              Mark read
            </button>
          )}
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {formatTimestamp(notification.timestamp)}
          </span>
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {notification.action.label}
            </button>
          )}
        </div>
      </div>
      
      <button
        onClick={() => onDismiss?.(notification.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// Helper function to format timestamp
function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

/**
 * Global notification functions (use outside React components)
 */
export const notify = {
  success: (title: string, message?: string) => {
    globalToast.success(title, message)
  },
  error: (title: string, message?: string) => {
    globalToast.error(title, message)
  },
  warning: (title: string, message?: string) => {
    globalToast.warning(title, message)
  },
  info: (title: string, message?: string) => {
    globalToast.info(title, message)
  },
}

