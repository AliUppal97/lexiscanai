"use client"

import * as React from "react"
import { 
  Upload, 
  Users, 
  Share2, 
  Plus,
  Search,
  type LucideIcon 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * QuickActions - Enterprise quick action buttons component
 * 
 * Provides easy access to common tasks and frequent operations.
 * Ideal for dashboards, command centers, and productivity tools.
 * 
 * Features:
 * - Customizable action buttons
 * - Icon support
 * - Keyboard shortcuts display
 * - Badge notifications
 * - Loading states
 * - Tooltips
 * - Grid and list layouts
 * - Responsive design
 * 
 * @example
 * <QuickActions
 *   actions={[
 *     {
 *       id: "upload",
 *       label: "Upload Document",
 *       icon: Upload,
 *       onClick: () => handleUpload(),
 *       shortcut: "⌘U"
 *     }
 *   ]}
 * />
 */

export interface QuickAction {
  id: string
  label: string
  description?: string
  icon: LucideIcon
  onClick: () => void
  href?: string
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  shortcut?: string
  disabled?: boolean
  variant?: "default" | "outline" | "ghost" | "secondary"
  color?: "blue" | "green" | "purple" | "red" | "orange"
}

export interface QuickActionsProps {
  actions: QuickAction[]
  title?: string
  description?: string
  layout?: "grid" | "list"
  columns?: 2 | 3 | 4
  showShortcuts?: boolean
  className?: string
}

export function QuickActions({
  actions,
  title = "Quick Actions",
  description,
  layout = "grid",
  columns = 3,
  showShortcuts = true,
  className,
}: QuickActionsProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      
      <CardContent>
        {layout === "grid" ? (
          <div className={cn("grid gap-3", gridCols[columns])}>
            {actions.map((action) => (
              <QuickActionButton
                key={action.id}
                action={action}
                showShortcut={showShortcuts}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map((action) => (
              <QuickActionListItem
                key={action.id}
                action={action}
                showShortcut={showShortcuts}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * QuickActionButton - Grid layout button
 */

interface QuickActionButtonProps {
  action: QuickAction
  showShortcut?: boolean
}

function QuickActionButton({ action, showShortcut }: QuickActionButtonProps) {
  const Icon = action.icon
  const colorClass = getColorClass(action.color)
  
  const button = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "group relative flex flex-col items-center justify-center gap-3 rounded-lg border p-4 transition-all",
              "hover:border-primary hover:shadow-md",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:shadow-none",
              colorClass.border
            )}
          >
            {/* Badge */}
            {action.badge && (
              <Badge 
                variant={action.badgeVariant || "destructive"} 
                className="absolute top-2 right-2 h-5 min-w-5 px-1"
              >
                {action.badge}
              </Badge>
            )}
            
            {/* Icon */}
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
              colorClass.bg,
              "group-hover:scale-110 transition-transform"
            )}>
              <Icon className={cn("h-6 w-6", colorClass.text)} />
            </div>
            
            {/* Label */}
            <div className="text-center">
              <p className="text-sm font-medium leading-none">{action.label}</p>
              {action.description && (
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              )}
            </div>
            
            {/* Keyboard Shortcut */}
            {showShortcut && action.shortcut && (
              <div className="absolute bottom-2 right-2">
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 group-hover:flex">
                  {action.shortcut}
                </kbd>
              </div>
            )}
          </button>
        </TooltipTrigger>
        {action.description && (
          <TooltipContent>
            <p>{action.description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
  
  if (action.href) {
    return <a href={action.href}>{button}</a>
  }
  
  return button
}

/**
 * QuickActionListItem - List layout item
 */

interface QuickActionListItemProps {
  action: QuickAction
  showShortcut?: boolean
}

function QuickActionListItem({ action, showShortcut }: QuickActionListItemProps) {
  const Icon = action.icon
  const colorClass = getColorClass(action.color)
  
  return (
    <button
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        "group flex w-full items-center gap-4 rounded-lg border p-3 transition-all text-left",
        "hover:border-primary hover:shadow-md",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:shadow-none"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0",
        colorClass.bg
      )}>
        <Icon className={cn("h-5 w-5", colorClass.text)} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{action.label}</p>
          {action.badge && (
            <Badge variant={action.badgeVariant || "secondary"} className="h-5">
              {action.badge}
            </Badge>
          )}
        </div>
        {action.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
        )}
      </div>
      
      {/* Keyboard Shortcut */}
      {showShortcut && action.shortcut && (
        <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium opacity-100 group-hover:flex">
          {action.shortcut}
        </kbd>
      )}
    </button>
  )
}

/**
 * Get color classes based on color prop
 */

function getColorClass(color?: string): { bg: string; text: string; border: string } {
  const colors = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-950 group-hover:bg-blue-200 dark:group-hover:bg-blue-900",
      text: "text-blue-600 dark:text-blue-400",
      border: "hover:border-blue-500/50"
    },
    green: {
      bg: "bg-green-100 dark:bg-green-950 group-hover:bg-green-200 dark:group-hover:bg-green-900",
      text: "text-green-600 dark:text-green-400",
      border: "hover:border-green-500/50"
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-950 group-hover:bg-purple-200 dark:group-hover:bg-purple-900",
      text: "text-purple-600 dark:text-purple-400",
      border: "hover:border-purple-500/50"
    },
    red: {
      bg: "bg-red-100 dark:bg-red-950 group-hover:bg-red-200 dark:group-hover:bg-red-900",
      text: "text-red-600 dark:text-red-400",
      border: "hover:border-red-500/50"
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-950 group-hover:bg-orange-200 dark:group-hover:bg-orange-900",
      text: "text-orange-600 dark:text-orange-400",
      border: "hover:border-orange-500/50"
    },
  }
  
  return colors[color as keyof typeof colors] || {
    bg: "bg-gray-100 dark:bg-gray-900 group-hover:bg-gray-200 dark:group-hover:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    border: ""
  }
}

/**
 * Pre-built action sets
 */

export const DocumentActions: QuickAction[] = [
  {
    id: "upload",
    label: "Upload Document",
    description: "Upload a new document for review",
    icon: Upload,
    onClick: () => {},
    shortcut: "⌘U",
    color: "blue",
  },
  {
    id: "create",
    label: "Create Document",
    description: "Start a new document from scratch",
    icon: Plus,
    onClick: () => {},
    shortcut: "⌘N",
    color: "green",
  },
  {
    id: "search",
    label: "Search Documents",
    description: "Find documents quickly",
    icon: Search,
    onClick: () => {},
    shortcut: "⌘K",
    color: "purple",
  },
]

export const TeamActions: QuickAction[] = [
  {
    id: "invite",
    label: "Invite Team Member",
    description: "Add someone to your team",
    icon: Users,
    onClick: () => {},
    color: "blue",
  },
  {
    id: "share",
    label: "Share Document",
    description: "Share with team members",
    icon: Share2,
    onClick: () => {},
    color: "green",
  },
]

/**
 * Compact Quick Actions for sidebars
 */

export function CompactQuickActions({ 
  actions,
  maxItems = 4 
}: { 
  actions: QuickAction[]
  maxItems?: number 
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.slice(0, maxItems).map((action) => {
        const Icon = action.icon
        const colorClass = getColorClass(action.color)
        
        return (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all",
              "hover:border-primary hover:shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {action.badge && (
              <Badge 
                variant={action.badgeVariant || "destructive"} 
                className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 text-xs"
              >
                {action.badge}
              </Badge>
            )}
            
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              colorClass.bg
            )}>
              <Icon className={cn("h-4 w-4", colorClass.text)} />
            </div>
            
            <p className="text-xs font-medium text-center leading-tight">{action.label}</p>
          </button>
        )
      })}
    </div>
  )
}

