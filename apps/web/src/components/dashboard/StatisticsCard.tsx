"use client"

import * as React from "react"
import { ArrowUp, ArrowDown, Minus, FileText, Users, DollarSign, Activity, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

/**
 * StatisticsCard - Enterprise metrics display component
 * 
 * A comprehensive statistics card for displaying KPIs, metrics, and analytics.
 * Supports trends, comparisons, sparklines, and interactive features.
 * 
 * Features:
 * - Trend indicators (up, down, neutral)
 * - Percentage change display
 * - Comparison periods
 * - Color-coded trends
 * - Loading states
 * - Custom icons
 * - Sparkline charts
 * - Click actions
 * 
 * @example
 * <StatisticsCard
 *   title="Total Documents"
 *   value="1,247"
 *   change={12.5}
 *   trend="up"
 *   description="vs last month"
 *   icon={FileText}
 * />
 */

export type TrendType = "up" | "down" | "neutral"

export interface StatisticsCardProps {
  // Content
  title: string
  value: string | number
  description?: string
  
  // Trend data
  change?: number // Percentage change
  trend?: TrendType
  previousValue?: string | number
  comparisonPeriod?: string // e.g., "vs last month"
  
  // Visual
  icon?: LucideIcon
  iconColor?: string
  variant?: "default" | "primary" | "success" | "warning" | "danger"
  
  // States
  isLoading?: boolean
  
  // Actions
  onClick?: () => void
  href?: string
  
  // Styling
  className?: string
  
  // Advanced
  sparklineData?: number[]
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  showTrendIcon?: boolean
}

export function StatisticsCard({
  title,
  value,
  description,
  change,
  trend,
  previousValue,
  comparisonPeriod,
  icon: Icon,
  iconColor,
  variant = "default",
  isLoading = false,
  onClick,
  href,
  className,
  sparklineData,
  badge,
  badgeVariant = "secondary",
  showTrendIcon = true,
}: StatisticsCardProps) {
  // Auto-detect trend from change if not provided
  const computedTrend = trend || (change ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : "neutral")
  
  // Get trend colors
  const getTrendColor = () => {
    switch (computedTrend) {
      case "up":
        return "text-green-600 dark:text-green-500"
      case "down":
        return "text-red-600 dark:text-red-500"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }
  
  const getTrendBgColor = () => {
    switch (computedTrend) {
      case "up":
        return "bg-green-50 dark:bg-green-950/30"
      case "down":
        return "bg-red-50 dark:bg-red-950/30"
      default:
        return "bg-gray-50 dark:bg-gray-900"
    }
  }
  
  // Get variant colors
  const getVariantColor = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
      case "success":
        return "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
      case "warning":
        return "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400"
      case "danger":
        return "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
      default:
        return iconColor || "bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400"
    }
  }
  
  // Get trend icon
  const TrendIcon = computedTrend === "up" ? ArrowUp : computedTrend === "down" ? ArrowDown : Minus
  
  const content = (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("rounded-lg p-2", getVariantColor())}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            {/* Main Value */}
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{value}</div>
              {badge && (
                <Badge variant={badgeVariant} className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            
            {/* Trend & Description */}
            {(change !== undefined || description) && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {change !== undefined && (
                  <div className={cn("flex items-center gap-1 font-medium", getTrendColor())}>
                    {showTrendIcon && <TrendIcon className="h-3 w-3" />}
                    <span>
                      {change > 0 ? "+" : ""}{change.toFixed(1)}%
                    </span>
                  </div>
                )}
                {description && (
                  <CardDescription className="text-xs">
                    {description}
                  </CardDescription>
                )}
                {comparisonPeriod && (
                  <CardDescription className="text-xs">
                    {comparisonPeriod}
                  </CardDescription>
                )}
              </div>
            )}
            
            {/* Previous Value Comparison */}
            {previousValue && (
              <div className="mt-2 text-xs text-muted-foreground">
                Previous: {previousValue}
              </div>
            )}
            
            {/* Sparkline */}
            {sparklineData && sparklineData.length > 0 && (
              <div className="mt-3">
                <MiniSparkline data={sparklineData} trend={computedTrend} />
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {/* Trend Indicator Bar */}
      {change !== undefined && !isLoading && (
        <div className={cn("absolute bottom-0 left-0 h-1 w-full", getTrendBgColor())}>
          <div 
            className={cn(
              "h-full transition-all",
              computedTrend === "up" ? "bg-green-500" : computedTrend === "down" ? "bg-red-500" : "bg-gray-400"
            )}
            style={{ width: `${Math.min(Math.abs(change), 100)}%` }}
          />
        </div>
      )}
    </Card>
  )
  
  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    )
  }
  
  return content
}

/**
 * StatisticsCardGrid - Grid layout for multiple statistics cards
 */

interface StatisticsCardGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function StatisticsCardGrid({ 
  children, 
  columns = 4,
  className 
}: StatisticsCardGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }
  
  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  )
}

/**
 * MiniSparkline - Simple sparkline chart for StatisticsCard
 */

interface MiniSparklineProps {
  data: number[]
  trend: TrendType
  height?: number
}

function MiniSparkline({ data, trend, height = 24 }: MiniSparklineProps) {
  if (data.length === 0) return null
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(" ")
  
  const color = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#6b7280"
  
  return (
    <svg 
      width="100%" 
      height={height} 
      className="opacity-50"
      preserveAspectRatio="none"
      viewBox={`0 0 100 ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * StatisticsCardSkeleton - Loading skeleton
 */

export function StatisticsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  )
}

/**
 * Pre-built stat card variants
 */

export function DocumentStatsCard(props: Omit<StatisticsCardProps, "icon" | "variant">) {
  return <StatisticsCard {...props} icon={FileText} variant="primary" />
}

export function UserStatsCard(props: Omit<StatisticsCardProps, "icon" | "variant">) {
  return <StatisticsCard {...props} icon={Users} variant="success" />
}

export function RevenueStatsCard(props: Omit<StatisticsCardProps, "icon" | "variant">) {
  return <StatisticsCard {...props} icon={DollarSign} variant="success" />
}

export function ActivityStatsCard(props: Omit<StatisticsCardProps, "icon" | "variant">) {
  return <StatisticsCard {...props} icon={Activity} variant="default" />
}

