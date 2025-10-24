"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { 
  FileText, 
  Users, 
  Share2, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Clock,
  type LucideIcon 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * ActivityFeed - Enterprise activity timeline component
 * 
 * Displays a real-time feed of user activities, system events, and notifications.
 * Perfect for dashboards, audit logs, and user activity tracking.
 * 
 * Features:
 * - Real-time activity updates
 * - Activity type icons and colors
 * - User avatars
 * - Relative timestamps
 * - Activity grouping
 * - Infinite scroll support
 * - Filter by activity type
 * - Clickable activities
 * 
 * @example
 * <ActivityFeed
 *   activities={activities}
 *   onActivityClick={(activity) => navigate(`/activity/${activity.id}`)}
 *   showFilters
 * />
 */

export type ActivityType = 
  | "document_created"
  | "document_updated"
  | "document_shared"
  | "document_deleted"
  | "user_joined"
  | "user_left"
  | "comment_added"
  | "review_completed"
  | "status_changed"
  | "custom"

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string
  user?: {
    id: string
    name: string
    avatar?: string
    email?: string
  }
  timestamp: Date | string
  metadata?: Record<string, unknown>
  href?: string
  icon?: LucideIcon
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

export interface ActivityFeedProps {
  activities: Activity[]
  isLoading?: boolean
  maxHeight?: string
  showFilters?: boolean
  onActivityClick?: (activity: Activity) => void
  onLoadMore?: () => void
  hasMore?: boolean
  emptyMessage?: string
  title?: string
  description?: string
  className?: string
}

export function ActivityFeed({
  activities,
  isLoading = false,
  maxHeight = "600px",
  showFilters = false,
  onActivityClick,
  onLoadMore,
  hasMore = false,
  emptyMessage = "No recent activity",
  title = "Recent Activity",
  description,
  className,
}: ActivityFeedProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<ActivityType | "all">("all")
  
  const filteredActivities = React.useMemo(() => {
    if (selectedFilter === "all") return activities
    return activities.filter(activity => activity.type === selectedFilter)
  }, [activities, selectedFilter])
  
  const filters: Array<{ label: string; value: ActivityType | "all" }> = [
    { label: "All", value: "all" },
    { label: "Documents", value: "document_created" },
    { label: "Shared", value: "document_shared" },
    { label: "Comments", value: "comment_added" },
    { label: "Reviews", value: "review_completed" },
  ]
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showFilters && (
            <div className="flex gap-2">
              {filters.map((filter) => (
                <Badge
                  key={filter.value}
                  variant={selectedFilter === filter.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedFilter(filter.value)}
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {[...Array(5)].map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div style={{ maxHeight }} className="overflow-auto px-6">
            <div className="space-y-4 py-4">
              {filteredActivities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onClick={onActivityClick}
                  isLast={index === filteredActivities.length - 1}
                />
              ))}
              
              {hasMore && (
                <button
                  onClick={onLoadMore}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Load more activities...
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * ActivityItem - Individual activity item
 */

interface ActivityItemProps {
  activity: Activity
  onClick?: (activity: Activity) => void
  isLast?: boolean
}

function ActivityItem({ activity, onClick, isLast }: ActivityItemProps) {
  const ActivityIcon = activity.icon || getActivityIcon(activity.type)
  const activityColor = getActivityColor(activity.type)
  
  const timestamp = typeof activity.timestamp === "string" 
    ? new Date(activity.timestamp) 
    : activity.timestamp
  
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true })
  
  return (
    <div
      className={cn(
        "group relative flex gap-4 pb-4",
        !isLast && "border-b border-border/50",
        onClick && "cursor-pointer hover:bg-accent/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
      )}
      onClick={() => onClick?.(activity)}
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-8 h-full w-px bg-border" />
      )}
      
      {/* Icon */}
      <div className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background z-10",
        activityColor.bg
      )}>
        <ActivityIcon className={cn("h-4 w-4", activityColor.text)} />
      </div>
      
      {/* Content */}
      <div className="flex-1 space-y-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium leading-none">{activity.title}</p>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
            )}
          </div>
          {activity.badge && (
            <Badge variant={activity.badgeVariant || "secondary"} className="text-xs">
              {activity.badge}
            </Badge>
          )}
        </div>
        
        {/* User & Timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {activity.user && (
            <>
              <Avatar className="h-5 w-5">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback className="text-xs">
                  {activity.user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{activity.user.name}</span>
              <span>•</span>
            </>
          )}
          <time dateTime={timestamp.toISOString()}>{timeAgo}</time>
        </div>
      </div>
    </div>
  )
}

/**
 * Get activity icon based on type
 */

function getActivityIcon(type: ActivityType): LucideIcon {
  const icons: Record<ActivityType, LucideIcon> = {
    document_created: FileText,
    document_updated: FileText,
    document_shared: Share2,
    document_deleted: FileText,
    user_joined: Users,
    user_left: Users,
    comment_added: MessageSquare,
    review_completed: CheckCircle,
    status_changed: AlertCircle,
    custom: Clock,
  }
  
  return icons[type] || Clock
}

/**
 * Get activity color scheme
 */

function getActivityColor(type: ActivityType): { bg: string; text: string } {
  const colors: Record<ActivityType, { bg: string; text: string }> = {
    document_created: { bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-600 dark:text-blue-400" },
    document_updated: { bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-600 dark:text-purple-400" },
    document_shared: { bg: "bg-green-100 dark:bg-green-950", text: "text-green-600 dark:text-green-400" },
    document_deleted: { bg: "bg-red-100 dark:bg-red-950", text: "text-red-600 dark:text-red-400" },
    user_joined: { bg: "bg-teal-100 dark:bg-teal-950", text: "text-teal-600 dark:text-teal-400" },
    user_left: { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-600 dark:text-orange-400" },
    comment_added: { bg: "bg-indigo-100 dark:bg-indigo-950", text: "text-indigo-600 dark:text-indigo-400" },
    review_completed: { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-400" },
    status_changed: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-600 dark:text-amber-400" },
    custom: { bg: "bg-gray-100 dark:bg-gray-900", text: "text-gray-600 dark:text-gray-400" },
  }
  
  return colors[type] || colors.custom
}

/**
 * ActivityItemSkeleton - Loading skeleton
 */

function ActivityItemSkeleton() {
  return (
    <div className="flex gap-4 pb-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

/**
 * ActivityFeedSkeleton - Full component skeleton
 */

export function ActivityFeedSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * Compact Activity Feed for sidebars
 */

export function CompactActivityFeed({
  activities,
  maxItems = 5,
  onViewAll,
}: {
  activities: Activity[]
  maxItems?: number
  onViewAll?: () => void
}) {
  return (
    <div className="space-y-3">
      {activities.slice(0, maxItems).map((activity) => {
        const ActivityIcon = activity.icon || getActivityIcon(activity.type)
        const activityColor = getActivityColor(activity.type)
        const timestamp = typeof activity.timestamp === "string" 
          ? new Date(activity.timestamp) 
          : activity.timestamp
        const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true })
        
        return (
          <div key={activity.id} className="flex gap-3">
            <div className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0",
              activityColor.bg
            )}>
              <ActivityIcon className={cn("h-3 w-3", activityColor.text)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
        )
      })}
      
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          View all activity
        </button>
      )}
    </div>
  )
}

