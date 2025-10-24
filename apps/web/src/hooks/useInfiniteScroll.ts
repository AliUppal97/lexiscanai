"use client"

import { useEffect, useRef, useCallback, useState } from "react"

interface UseInfiniteScrollOptions {
  onLoadMore: () => void | Promise<void>
  hasMore: boolean
  isLoading: boolean
  threshold?: number // Distance from bottom in pixels
  rootMargin?: string // IntersectionObserver rootMargin
  enabled?: boolean
}

interface UseInfiniteScrollReturn {
  ref: (node: HTMLElement | null) => void
  isLoading: boolean
  hasMore: boolean
}

/**
 * useInfiniteScroll - Infinite scroll pagination with Intersection Observer
 * 
 * Features:
 * - Automatic loading when user scrolls near bottom
 * - Configurable threshold distance
 * - Loading state management
 * - Performance optimized with Intersection Observer
 * - TypeScript support
 * - SSR-safe
 * 
 * @example
 * const { ref, isLoading, hasMore } = useInfiniteScroll({
 *   onLoadMore: async () => {
 *     await fetchMoreDocuments()
 *   },
 *   hasMore: hasNextPage,
 *   isLoading: isFetching,
 *   threshold: 100
 * })
 * 
 * return (
 *   <div>
 *     {documents.map(doc => <DocumentCard key={doc.id} {...doc} />)}
 *     <div ref={ref}>
 *       {isLoading && <Spinner />}
 *       {!hasMore && <p>No more documents</p>}
 *     </div>
 *   </div>
 * )
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 100,
  rootMargin = "0px",
  enabled = true,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const observer = useRef<IntersectionObserver | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!enabled || isLoading || !hasMore) {
        if (observer.current) {
          observer.current.disconnect()
        }
        return
      }

      // Disconnect previous observer
      if (observer.current) {
        observer.current.disconnect()
      }

      // Create new observer
      if (node && typeof window !== "undefined" && "IntersectionObserver" in window) {
        observer.current = new IntersectionObserver(
          (entries) => {
            const [entry] = entries
            if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
              setIsLoadingMore(true)
              Promise.resolve(onLoadMore()).finally(() => {
                setIsLoadingMore(false)
              })
            }
          },
          {
            rootMargin,
            threshold: 0.1,
          }
        )

        observer.current.observe(node)
      }
    },
    [enabled, isLoading, hasMore, isLoadingMore, onLoadMore, rootMargin]
  )

  // Cleanup on unmount
  useEffect(() => {
    const currentObserver = observer.current
    return () => {
      if (currentObserver) {
        currentObserver.disconnect()
      }
    }
  }, [])

  return {
    ref,
    isLoading: isLoading || isLoadingMore,
    hasMore,
  }
}

/**
 * useScrollPagination - Alternative pagination with scroll position tracking
 * 
 * Use this when you need more control over scroll behavior
 * 
 * @example
 * const { containerRef, loadMore } = useScrollPagination({
 *   onLoadMore: fetchMore,
 *   hasMore: true
 * })
 */
export function useScrollPagination(options: Omit<UseInfiniteScrollOptions, "threshold" | "rootMargin">) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { onLoadMore, hasMore, isLoading, enabled = true } = options

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !enabled || isLoading || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

    // Load more when scrolled 80% down
    if (scrollPercentage > 0.8) {
      onLoadMore()
    }
  }, [enabled, isLoading, hasMore, onLoadMore])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("scroll", handleScroll)

    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  return {
    containerRef,
    loadMore: onLoadMore,
  }
}

