"use client"

import * as React from "react"
import { Search, X, Command, Loader2, Clock, FileText, Users, Folder, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

/**
 * SearchBar - Enterprise global search component
 * 
 * A powerful search bar with auto-complete, recent searches, and categorized results.
 * Supports keyboard shortcuts and command palette functionality.
 * 
 * Features:
 * - Auto-complete suggestions
 * - Recent searches
 * - Categorized results
 * - Keyboard shortcuts (⌘K)
 * - Search filters
 * - Debounced search
 * - Loading states
 * - Empty states
 * 
 * @example
 * <SearchBar
 *   onSearch={(query) => handleSearch(query)}
 *   placeholder="Search documents, users, teams..."
 *   recentSearches={recent}
 * />
 */

export interface SearchResult {
  id: string
  title: string
  description?: string
  category: "document" | "user" | "team" | "folder" | "other"
  icon?: LucideIcon
  href?: string
  metadata?: Record<string, unknown>
}

export interface SearchBarProps {
  onSearch: (query: string) => void | Promise<void>
  onResultClick?: (result: SearchResult) => void
  placeholder?: string
  recentSearches?: string[]
  results?: SearchResult[]
  isLoading?: boolean
  debounceMs?: number
  showCommandDialog?: boolean
  className?: string
}

export function SearchBar({
  onSearch,
  onResultClick,
  placeholder = "Search...",
  recentSearches = [],
  results = [],
  isLoading = false,
  debounceMs = 300,
  showCommandDialog = true,
  className,
}: SearchBarProps) {
  const [query, setQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const debounceTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
  
  // Handle keyboard shortcut (⌘K or Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (showCommandDialog) {
          setIsOpen(true)
        } else {
          searchInputRef.current?.focus()
        }
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showCommandDialog])
  
  // Debounced search
  const handleQueryChange = (value: string) => {
    setQuery(value)
    setShowResults(true)
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (value.trim()) {
        onSearch(value)
      }
    }, debounceMs)
  }
  
  const handleClear = () => {
    setQuery("")
    setShowResults(false)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }
  
  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result)
    setShowResults(false)
    setQuery("")
    setIsOpen(false)
  }
  
  const handleRecentSearchClick = (search: string) => {
    setQuery(search)
    onSearch(search)
    setShowResults(true)
  }
  
  // Group results by category
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    results.forEach((result) => {
      if (!groups[result.category]) {
        groups[result.category] = []
      }
      groups[result.category].push(result)
    })
    return groups
  }, [results])
  
  if (showCommandDialog) {
    return (
      <>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50",
            className
          )}
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">{placeholder}</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>
        
        {/* Command Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl p-0">
            <SearchInput
              query={query}
              onChange={handleQueryChange}
              onClear={handleClear}
              placeholder={placeholder}
              isLoading={isLoading}
              autoFocus
            />
            
            <div className="max-h-96 overflow-y-auto">
              {query.trim() ? (
                <SearchResults
                  results={groupedResults}
                  isLoading={isLoading}
                  onResultClick={handleResultClick}
                />
              ) : (
                <RecentSearches
                  searches={recentSearches}
                  onSearchClick={handleRecentSearchClick}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }
  
  // Inline search bar
  return (
    <div className={cn("relative", className)}>
      <SearchInput
        ref={searchInputRef}
        query={query}
        onChange={handleQueryChange}
        onClear={handleClear}
        placeholder={placeholder}
        isLoading={isLoading}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
      />
      
      {/* Dropdown Results */}
      {showResults && (query.trim() || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border bg-background shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {query.trim() ? (
              <SearchResults
                results={groupedResults}
                isLoading={isLoading}
                onResultClick={handleResultClick}
              />
            ) : (
              <RecentSearches
                searches={recentSearches}
                onSearchClick={handleRecentSearchClick}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * SearchInput - Search input field
 */

interface SearchInputProps {
  query: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder: string
  isLoading: boolean
  autoFocus?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ query, onChange, onClear, placeholder, isLoading, autoFocus, onFocus, onBlur }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={ref}
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-10 pr-10 h-12 text-sm"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {!isLoading && query && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

/**
 * SearchResults - Categorized search results
 */

interface SearchResultsProps {
  results: Record<string, SearchResult[]>
  isLoading: boolean
  onResultClick: (result: SearchResult) => void
}

function SearchResults({ results, isLoading, onResultClick }: SearchResultsProps) {
  const categoryLabels: Record<string, string> = {
    document: "Documents",
    user: "Users",
    team: "Teams",
    folder: "Folders",
    other: "Other",
  }
  
  const categoryIcons: Record<string, LucideIcon> = {
    document: FileText,
    user: Users,
    team: Users,
    folder: Folder,
    other: Search,
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  const resultCount = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
  
  if (resultCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No results found</p>
      </div>
    )
  }
  
  return (
    <div className="py-2">
      {Object.entries(results).map(([category, items]) => {
        if (items.length === 0) return null
        
        const CategoryIcon = categoryIcons[category] || Search
        
        return (
          <div key={category} className="mb-4 last:mb-0">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
              <CategoryIcon className="h-3 w-3" />
              {categoryLabels[category] || category}
            </div>
            <div>
              {items.map((result) => {
                const ResultIcon = result.icon || categoryIcons[category]
                
                return (
                  <button
                    key={result.id}
                    onClick={() => onResultClick(result)}
                    className="flex w-full items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted flex-shrink-0">
                      <ResultIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * RecentSearches - Recent search history
 */

interface RecentSearchesProps {
  searches: string[]
  onSearchClick: (search: string) => void
}

function RecentSearches({ searches, onSearchClick }: RecentSearchesProps) {
  if (searches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No recent searches</p>
      </div>
    )
  }
  
  return (
    <div className="py-2">
      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
        Recent Searches
      </div>
      <div>
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={() => onSearchClick(search)}
            className="flex w-full items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
          >
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm flex-1 truncate">{search}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

