"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, Check, Settings, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * NotificationCenter - Enterprise notification panel
 * 
 * Comprehensive notification system with tabs, actions, and real-time updates.
 * 
 * Features:
 * - Unread/All tabs
 * - Mark as read/unread
 * - Bulk actions
 * - Notification types
 * - Real-time updates
 * - Action buttons
 * 
 * @example
 * <NotificationCenter
 *   notifications={notifications}
 *   unreadCount={5}
 *   onNotificationClick={(notification) => handleClick(notification)}
 * />
 */

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  timestamp: Date | string
  actionLabel?: string
  onAction?: () => void
  href?: string
}

export interface NotificationCenterProps {
  notifications: Notification[]
  unreadCount?: number
  isLoading?: boolean
  error?: string | null
  onNotificationClick?: (notification: Notification) => void
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onClearAll?: () => void
  onRetry?: () => void
  maxHeight?: string
}

export function NotificationCenter({
  notifications,
  unreadCount,
  isLoading = false,
  error = null,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onRetry,
  maxHeight = "400px",
}: NotificationCenterProps) {
  const [open, setOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("unread")
  
  const unreadNotifications = notifications.filter(n => !n.isRead)
  const displayCount = unreadCount !== undefined ? unreadCount : unreadNotifications.length
  
  const displayNotifications = activeTab === "unread" ? unreadNotifications : notifications
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {displayCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {displayCount > 99 ? "99+" : displayCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-2">
            {unreadNotifications.length > 0 && onMarkAllAsRead && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unread">
                Unread ({unreadNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            <div style={{ maxHeight }} className="overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-red-500 mb-4" />
                  <p className="text-sm text-red-600 mb-2">Failed to load notifications</p>
                  <p className="text-xs text-muted-foreground mb-4">{error}</p>
                  {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      Try Again
                    </Button>
                  )}
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "unread" ? "No unread notifications" : "No notifications"}
                  </p>
                </div>
              ) : (
                <div>
                  {displayNotifications.map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={onNotificationClick}
                      onMarkAsRead={onMarkAsRead}
                      isLast={index === displayNotifications.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {notifications.length > 0 && onClearAll && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full" onClick={onClearAll}>
                Clear all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

function NotificationItem({
  notification,
  onClick,
  onMarkAsRead,
  isLast,
}: {
  notification: Notification
  onClick?: (notification: Notification) => void
  onMarkAsRead?: (id: string) => void
  isLast?: boolean
}) {
  const timestamp = typeof notification.timestamp === "string" ? new Date(notification.timestamp) : notification.timestamp
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true })
  
  const typeColors = {
    info: "bg-blue-100 dark:bg-blue-950",
    success: "bg-green-100 dark:bg-green-950",
    warning: "bg-yellow-100 dark:bg-yellow-950",
    error: "bg-red-100 dark:bg-red-950",
  }
  
  return (
    <div
      className={cn(
        "group relative p-4 hover:bg-accent/50 transition-colors cursor-pointer",
        !notification.isRead && "bg-accent/30",
        !isLast && "border-b"
      )}
      onClick={() => onClick?.(notification)}
    >
      <div className="flex gap-3">
        <div className={cn("h-2 w-2 rounded-full mt-2 flex-shrink-0", !notification.isRead ? typeColors[notification.type] : "bg-transparent")} />
        
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
          
          {notification.actionLabel && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation()
                notification.onAction?.()
              }}
            >
              {notification.actionLabel}
            </Button>
          )}
        </div>
        
        {!notification.isRead && onMarkAsRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onMarkAsRead(notification.id)
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

