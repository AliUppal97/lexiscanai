"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { FileText, MoreVertical, Download, Share2, Eye, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * RecentDocuments - Enterprise recent files component
 * 
 * Displays recently accessed or modified documents with quick actions.
 * Perfect for dashboard quick access and activity tracking.
 * 
 * Features:
 * - Recent file list
 * - Quick actions
 * - Status badges
 * - Relative timestamps
 * - Author info
 * - Compact layout
 * 
 * @example
 * <RecentDocuments
 *   documents={recentDocs}
 *   onDocumentClick={(doc) => navigate(`/documents/${doc.id}`)}
 *   maxItems={5}
 * />
 */

export interface RecentDocument {
  id: string
  name: string
  type?: string
  status?: "draft" | "review" | "approved" | "archived"
  updatedAt: Date | string
  author?: {
    id: string
    name: string
    avatar?: string
  }
  thumbnail?: string
}

export interface RecentDocumentsProps {
  documents: RecentDocument[]
  isLoading?: boolean
  onDocumentClick?: (document: RecentDocument) => void
  onView?: (document: RecentDocument) => void
  onDownload?: (document: RecentDocument) => void
  onShare?: (document: RecentDocument) => void
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
  title?: string
  description?: string
  variant?: "default" | "compact"
  className?: string
}

export function RecentDocuments({
  documents,
  isLoading = false,
  onDocumentClick,
  onView,
  onDownload,
  onShare,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  title = "Recent Documents",
  description,
  variant = "default",
  className,
}: RecentDocumentsProps) {
  const displayDocuments = documents.slice(0, maxItems)
  
  if (variant === "compact") {
    return (
      <div className={cn("space-y-3", className)}>
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <CompactDocumentSkeleton key={i} />
          ))
        ) : displayDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No recent documents</p>
          </div>
        ) : (
          <>
            {displayDocuments.map((document) => (
              <CompactDocumentItem
                key={document.id}
                document={document}
                onClick={onDocumentClick}
              />
            ))}
            
            {showViewAll && onViewAll && documents.length > maxItems && (
              <Button variant="ghost" size="sm" className="w-full" onClick={onViewAll}>
                View all {documents.length} documents
              </Button>
            )}
          </>
        )}
      </div>
    )
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showViewAll && onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(maxItems)].map((_, i) => (
              <RecentDocumentSkeleton key={i} />
            ))}
          </div>
        ) : displayDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No recent documents</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayDocuments.map((document) => (
              <RecentDocumentItem
                key={document.id}
                document={document}
                onClick={onDocumentClick}
                onView={onView}
                onDownload={onDownload}
                onShare={onShare}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * RecentDocumentItem - Full document item
 */

interface RecentDocumentItemProps {
  document: RecentDocument
  onClick?: (document: RecentDocument) => void
  onView?: (document: RecentDocument) => void
  onDownload?: (document: RecentDocument) => void
  onShare?: (document: RecentDocument) => void
}

function RecentDocumentItem({
  document,
  onClick,
  onView,
  onDownload,
  onShare,
}: RecentDocumentItemProps) {
  const updatedAt = typeof document.updatedAt === "string" ? new Date(document.updatedAt) : document.updatedAt
  const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true })
  
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 transition-all",
        onClick && "cursor-pointer hover:shadow-sm hover:border-primary/50"
      )}
      onClick={() => onClick?.(document)}
    >
      {/* Thumbnail/Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex-shrink-0">
        {document.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={document.thumbnail} alt={document.name} className="h-full w-full object-cover rounded-lg" />
        ) : (
          <FileText className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{document.name}</p>
            <div className="flex items-center gap-2 mt-1">
              {document.author && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={document.author.avatar} alt={document.author.name} />
                    <AvatarFallback className="text-[8px]">
                      {document.author.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{document.author.name}</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
          </div>
          
          {document.status && (
            <Badge variant={getStatusVariant(document.status)} className="flex-shrink-0 text-xs">
              {document.status}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {onView && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onView(document)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onDownload && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(document) }}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            {onShare && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(document) }}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

/**
 * CompactDocumentItem - Compact version for sidebars
 */

function CompactDocumentItem({
  document,
  onClick,
}: {
  document: RecentDocument
  onClick?: (document: RecentDocument) => void
}) {
  const updatedAt = typeof document.updatedAt === "string" ? new Date(document.updatedAt) : document.updatedAt
  const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true })
  
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg p-2 transition-all",
        onClick && "cursor-pointer hover:bg-accent"
      )}
      onClick={() => onClick?.(document)}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex-shrink-0">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{document.name}</p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
      
      {document.status && (
        <Badge variant={getStatusVariant(document.status)} className="flex-shrink-0 text-xs h-5 px-1.5">
          {document.status.charAt(0).toUpperCase()}
        </Badge>
      )}
    </div>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default"
    case "review":
      return "secondary"
    case "draft":
      return "outline"
    case "archived":
      return "destructive"
    default:
      return "secondary"
  }
}

function RecentDocumentSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  )
}

function CompactDocumentSkeleton() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Skeleton className="h-8 w-8 rounded" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  )
}

