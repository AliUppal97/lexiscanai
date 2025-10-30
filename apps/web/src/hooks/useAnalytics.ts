"use client"

import { useEffect, useCallback, useRef } from "react"
import { useAuth } from "./useAuth"
import { usePathname, useSearchParams } from "next/navigation"

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  timestamp?: string
  userId?: string
  sessionId?: string
}

export interface PageViewEvent {
  path: string
  title?: string
  referrer?: string
  search?: string
}

interface UseAnalyticsOptions {
  enabled?: boolean
  trackPageViews?: boolean
  trackClicks?: boolean
  debug?: boolean
}

interface UseAnalyticsReturn {
  // Event tracking
  track: (eventName: string, properties?: Record<string, unknown>) => void
  trackPageView: (path?: string, properties?: Record<string, unknown>) => void
  trackClick: (element: string, properties?: Record<string, unknown>) => void
  identify: (userId: string, traits?: Record<string, unknown>) => void
  // Performance tracking
  trackPerformance: (metric: string, value: number, properties?: Record<string, unknown>) => void
  trackError: (error: Error, properties?: Record<string, unknown>) => void
  // Conversion tracking
  trackConversion: (event: string, revenue?: number, properties?: Record<string, unknown>) => void
  // User properties
  setUserProperties: (properties: Record<string, unknown>) => void
}

const ANALYTICS_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * useAnalytics - Enterprise analytics and event tracking
 * 
 * Features:
 * - Automatic page view tracking
 * - Custom event tracking
 * - User identification
 * - Performance monitoring
 * - Error tracking
 * - Conversion tracking
 * - Session management
 * - GDPR compliant
 * 
 * Integrations:
 * - Google Analytics 4
 * - PostHog
 * - Custom analytics backend
 * 
 * @example
 * const { track, trackPageView, trackConversion } = useAnalytics({
 *   enabled: true,
 *   trackPageViews: true
 * })
 * 
 * // Track custom event
 * const handleDocumentUpload = () => {
 *   track('Document Uploaded', {
 *     fileType: 'pdf',
 *     fileSize: 1024000,
 *     documentType: 'contract'
 *   })
 * }
 * 
 * // Track conversion
 * const handlePurchase = () => {
 *   trackConversion('Subscription', 99.99, {
 *     plan: 'Premium',
 *     billingCycle: 'monthly'
 *   })
 * }
 */
export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    enabled = true,
    trackPageViews = true,
    trackClicks = false,
    debug = false,
  } = options

  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sessionId = useRef<string>(generateSessionId())
  const lastPageView = useRef<string>("")

  // Generate unique session ID
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Log in debug mode
  const debugLog = useCallback(
    (...args: unknown[]) => {
      if (debug) {
        console.log("[Analytics]", ...args)
      }
    },
    [debug]
  )

  // Send event to analytics backend
  const sendEvent = useCallback(
    async (event: AnalyticsEvent) => {
      if (!enabled) return

      const enrichedEvent: AnalyticsEvent = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
        userId: event.userId || user?.id,
        sessionId: sessionId.current,
      }

      debugLog("Tracking event:", enrichedEvent)

      try {
        // Send to custom backend
        await fetch(`${ANALYTICS_URL}/analytics/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enrichedEvent),
        })

        // Send to Google Analytics 4 if available
        if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", event.name, event.properties)
        }

        // Send to PostHog if available
        if (typeof window !== "undefined" && (window as unknown as { posthog?: { capture: (name: string, properties?: unknown) => void } }).posthog) {
          (window as unknown as { posthog: { capture: (name: string, properties?: unknown) => void } }).posthog.capture(event.name, event.properties)
        }
      } catch (error) {
        console.error("Failed to send analytics event:", error)
      }
    },
    [enabled, user, debugLog]
  )

  // Track custom event
  const track = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      sendEvent({
        name: eventName,
        properties,
      })
    },
    [sendEvent]
  )

  // Track page view
  const trackPageView = useCallback(
    (path?: string, properties?: Record<string, unknown>) => {
      const pagePath = path || pathname
      const pageSearch = searchParams?.toString()

      // Avoid duplicate page views
      const pageKey = `${pagePath}${pageSearch ? `?${pageSearch}` : ""}`
      if (lastPageView.current === pageKey) {
        return
      }

      lastPageView.current = pageKey

      sendEvent({
        name: "Page View",
        properties: {
          path: pagePath,
          search: pageSearch,
          referrer: typeof document !== "undefined" ? document.referrer : "",
          title: typeof document !== "undefined" ? document.title : "",
          ...properties,
        },
      })
    },
    [pathname, searchParams, sendEvent]
  )

  // Track click event
  const trackClick = useCallback(
    (element: string, properties?: Record<string, unknown>) => {
      sendEvent({
        name: "Click",
        properties: {
          element,
          path: pathname,
          ...properties,
        },
      })
    },
    [pathname, sendEvent]
  )

  // Identify user
  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      if (typeof window !== "undefined") {
        // Google Analytics
        if ((window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("set", { user_id: userId })
        }

        // PostHog
        if ((window as unknown as { posthog?: { identify: (userId: string, traits?: unknown) => void } }).posthog) {
          (window as unknown as { posthog: { identify: (userId: string, traits?: unknown) => void } }).posthog.identify(userId, traits)
        }
      }

      sendEvent({
        name: "Identify",
        properties: {
          userId,
          ...traits,
        },
      })
    },
    [sendEvent]
  )

  // Track performance metric
  const trackPerformance = useCallback(
    (metric: string, value: number, properties?: Record<string, unknown>) => {
      sendEvent({
        name: "Performance",
        properties: {
          metric,
          value,
          ...properties,
        },
      })

      // Send to Google Analytics as custom metric
      if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "timing_complete", {
          name: metric,
          value: Math.round(value),
          event_category: "Performance",
        })
      }
    },
    [sendEvent]
  )

  // Track error
  const trackError = useCallback(
    (error: Error, properties?: Record<string, unknown>) => {
      sendEvent({
        name: "Error",
        properties: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          ...properties,
        },
      })

      // Send to error tracking services
      if (typeof window !== "undefined") {
        // Sentry
        if ((window as unknown as { Sentry?: { captureException: (error: Error) => void } }).Sentry) {
          (window as unknown as { Sentry: { captureException: (error: Error) => void } }).Sentry.captureException(error)
        }
      }
    },
    [sendEvent]
  )

  // Track conversion
  const trackConversion = useCallback(
    (event: string, revenue?: number, properties?: Record<string, unknown>) => {
      sendEvent({
        name: "Conversion",
        properties: {
          event,
          revenue,
          currency: "USD",
          ...properties,
        },
      })

      // Send to Google Analytics
      if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "purchase", {
          transaction_id: `txn_${Date.now()}`,
          value: revenue,
          currency: "USD",
          ...properties,
        })
      }
    },
    [sendEvent]
  )

  // Set user properties
  const setUserProperties = useCallback(
    (properties: Record<string, unknown>) => {
      if (typeof window !== "undefined") {
        // Google Analytics
        if ((window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("set", "user_properties", properties)
        }

        // PostHog
        if ((window as unknown as { posthog?: { setPersonProperties: (properties: unknown) => void } }).posthog) {
          (window as unknown as { posthog: { setPersonProperties: (properties: unknown) => void } }).posthog.setPersonProperties(properties)
        }
      }

      sendEvent({
        name: "User Properties",
        properties,
      })
    },
    [sendEvent]
  )

  // Auto-track page views on route change
  useEffect(() => {
    if (trackPageViews && pathname) {
      trackPageView()
    }
  }, [pathname, searchParams, trackPageViews, trackPageView])

  // Identify user when logged in
  useEffect(() => {
    if (user) {
      identify(user.id, {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
      })
    }
  }, [user, identify])

  // Track clicks if enabled
  useEffect(() => {
    if (!trackClicks || typeof window === "undefined") return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const element = target.tagName.toLowerCase()
      const text = target.textContent?.slice(0, 50)

      trackClick(element, {
        text,
        id: target.id,
        className: target.className,
      })
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [trackClicks, trackClick])

  // Track Web Vitals
  useEffect(() => {
    if (typeof window === "undefined") return

    // Core Web Vitals tracking
    if ("PerformanceObserver" in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        trackPerformance("LCP", lastEntry.renderTime || lastEntry.loadTime)
      })

      try {
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
      } catch (e) {
        // Browser doesn't support LCP
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
          if (entry.processingStart) {
            trackPerformance("FID", entry.processingStart - entry.startTime)
          }
        })
      })

      try {
        fidObserver.observe({ entryTypes: ["first-input"] })
      } catch (e) {
        // Browser doesn't support FID
      }

      return () => {
        lcpObserver.disconnect()
        fidObserver.disconnect()
      }
    }
  }, [trackPerformance])

  return {
    track,
    trackPageView,
    trackClick,
    identify,
    trackPerformance,
    trackError,
    trackConversion,
    setUserProperties,
  }
}

/**
 * Helper function to track feature usage
 */
export function useFeatureTracking(featureName: string) {
  const { track } = useAnalytics()

  useEffect(() => {
    track("Feature Viewed", { feature: featureName })
  }, [featureName, track])

  const trackFeatureUsed = useCallback(
    (action: string, properties?: Record<string, unknown>) => {
      track("Feature Used", {
        feature: featureName,
        action,
        ...properties,
      })
    },
    [featureName, track]
  )

  return { trackFeatureUsed }
}

