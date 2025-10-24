"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { 
  FileText, 
  MoreVertical, 
  Download, 
  Share2, 
  Trash2, 
  Edit,
  Grid,
  List,
  Filter,
  SortAsc
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * DocumentList - Enterprise document grid/list component
 * 
 * A comprehensive document listing with grid/list views, sorting, filtering,
 * and bulk actions. Perfect for document management systems.
 * 
 * Features:
 * - Grid and list layouts
 * - Sort and filter
 * - Bulk selection
 * - Document actions
 * - Status badges
 * - User avatars
 * - Loading states
 * - Empty states
 * 
 * @example
 * <DocumentList
 *   documents={documents}
 *   view="grid"
 *   onDocumentClick={(doc) => navigate(`/documents/${doc.id}`)}
 * />
 */

export interface Document {
  id: string
  name: string
  description?: string
  status: "draft" | "review" | "approved" | "archived"
  createdAt: Date | string
  updatedAt: Date | string
  author?: {
    id: string
    name: string
    avatar?: string
  }
  size?: number
  type?: string
  tags?: string[]
  thumbnail?: string
}

export interface DocumentListProps {
  documents: Document[]
  view?: "grid" | "list"
  isLoading?: boolean
  onDocumentClick?: (document: Document) => void
  onDownload?: (document: Document) => void
  onShare?: (document: Document) => void
  onDelete?: (document: Document) => void
  onEdit?: (document: Document) => void
  showSelection?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  showFilters?: boolean
  emptyMessage?: string
  className?: string
}

export function DocumentList({
  documents,
  view: initialView = "grid",
  isLoading = false,
  onDocumentClick,
  onDownload,
  onShare,
  onDelete,
  onEdit,
  showSelection = false,
  selectedIds = [],
  onSelectionChange,
  showFilters = false,
  emptyMessage = "No documents found",
  className,
}: DocumentListProps) {
  const [view, setView] = React.useState<"grid" | "list">(initialView)
  const [sortBy, setSortBy] = React.useState<"name" | "date">("date")
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(documents.map(d => d.id))
    } else {
      onSelectionChange?.([])
    }
  }
  
  const handleSelectDocument = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedIds, id])
    } else {
      onSelectionChange?.(selectedIds.filter(selectedId => selectedId !== id))
    }
  }
  
  const filteredDocuments = React.useMemo(() => {
    let filtered = documents
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(doc => doc.status === filterStatus)
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      }
      const dateA = typeof a.updatedAt === "string" ? new Date(a.updatedAt) : a.updatedAt
      const dateB = typeof b.updatedAt === "string" ? new Date(b.updatedAt) : b.updatedAt
      return dateB.getTime() - dateA.getTime()
    })
  }, [documents, sortBy, filterStatus])
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showSelection && filteredDocuments.length > 0 && (
            <Checkbox
              checked={selectedIds.length === filteredDocuments.length}
              onCheckedChange={handleSelectAll}
            />
          )}
          <h3 className="text-lg font-semibold">
            {selectedIds.length > 0 ? `${selectedIds.length} selected` : `${filteredDocuments.length} documents`}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {showFilters && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("draft")}>
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("review")}>
                    In Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("approved")}>
                    Approved
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("date")}>
                    Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name")}>
                    Name
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          <div className="flex rounded-lg border">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Documents */}
      {isLoading ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <DocumentListItemSkeleton key={i} />
            ))}
          </div>
        )
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              isSelected={selectedIds.includes(document.id)}
              onSelect={showSelection ? (checked) => handleSelectDocument(document.id, checked) : undefined}
              onClick={onDocumentClick}
              onDownload={onDownload}
              onShare={onShare}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map((document) => (
            <DocumentListItem
              key={document.id}
              document={document}
              isSelected={selectedIds.includes(document.id)}
              onSelect={showSelection ? (checked) => handleSelectDocument(document.id, checked) : undefined}
              onClick={onDocumentClick}
              onDownload={onDownload}
              onShare={onShare}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * DocumentCard - Grid view item
 */

interface DocumentCardProps {
  document: Document
  isSelected?: boolean
  onSelect?: (checked: boolean) => void
  onClick?: (document: Document) => void
  onDownload?: (document: Document) => void
  onShare?: (document: Document) => void
  onDelete?: (document: Document) => void
  onEdit?: (document: Document) => void
}

function DocumentCard({
  document,
  isSelected,
  onSelect,
  onClick,
  onDownload,
  onShare,
  onDelete,
  onEdit,
}: DocumentCardProps) {
  const updatedAt = typeof document.updatedAt === "string" ? new Date(document.updatedAt) : document.updatedAt
  const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true })
  
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all hover:shadow-md",
      isSelected && "ring-2 ring-primary"
    )}>
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="bg-background"
          />
        </div>
      )}
      
      <div
        onClick={() => onClick?.(document)}
        className={cn("cursor-pointer", onSelect && "pt-10")}
      >
        {/* Thumbnail */}
        <div className="aspect-video w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
          {document.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={document.thumbnail} alt={document.name} className="object-cover w-full h-full" />
          ) : (
            <FileText className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-2">{document.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(document) }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
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
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onDelete(document) }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {document.description && (
            <CardDescription className="line-clamp-2 text-xs">
              {document.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs">
            <Badge variant={getStatusVariant(document.status)}>
              {document.status}
            </Badge>
            <span className="text-muted-foreground">{timeAgo}</span>
          </div>
          
          {document.author && (
            <div className="flex items-center gap-2 mt-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={document.author.avatar} alt={document.author.name} />
                <AvatarFallback className="text-xs">
                  {document.author.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{document.author.name}</span>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

/**
 * DocumentListItem - List view item
 */

function DocumentListItem({
  document,
  isSelected,
  onSelect,
  onClick,
  onDownload,
  onShare,
  onDelete,
  onEdit,
}: DocumentCardProps) {
  const updatedAt = typeof document.updatedAt === "string" ? new Date(document.updatedAt) : document.updatedAt
  const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true })
  
  return (
    <Card className={cn(
      "group transition-all hover:shadow-sm",
      isSelected && "ring-2 ring-primary"
    )}>
      <CardContent 
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => onClick?.(document)}
      >
        {onSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex-shrink-0">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{document.name}</p>
          <p className="text-sm text-muted-foreground truncate">{document.description || "No description"}</p>
        </div>
        
        <Badge variant={getStatusVariant(document.status)} className="flex-shrink-0">
          {document.status}
        </Badge>
        
        <span className="text-sm text-muted-foreground flex-shrink-0 hidden md:block">
          {timeAgo}
        </span>
        
        {document.author && (
          <div className="flex items-center gap-2 flex-shrink-0 hidden lg:flex">
            <Avatar className="h-6 w-6">
              <AvatarImage src={document.author.avatar} alt={document.author.name} />
              <AvatarFallback className="text-xs">
                {document.author.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{document.author.name}</span>
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(document) }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
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
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(document) }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
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

function DocumentCardSkeleton() {
  return (
    <Card>
      <div className="aspect-video w-full bg-muted" />
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

function DocumentListItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  )
}

