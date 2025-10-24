"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useTenantContext } from "./TenantContext"

/**
 * FeatureFlagContext - Feature flag / toggle management
 * 
 * Features:
 * - Environment-based flags
 * - User-based flags
 * - Tenant-based flags
 * - A/B testing support
 * - Gradual rollouts
 * - Remote config
 * - Local overrides for development
 * 
 * @example
 * // Wrap your app with FeatureFlagProvider
 * <FeatureFlagProvider>
 *   <App />
 * </FeatureFlagProvider>
 * 
 * // Use in components
 * const { isEnabled, getVariant } = useFeatureFlags()
 * 
 * if (isEnabled('ai-review-v2')) {
 *   return <AIReviewV2 />
 * }
 */

export type FeatureFlagValue = boolean | string | number | object

export interface FeatureFlag {
  key: string
  enabled: boolean
  value?: FeatureFlagValue
  description?: string
  // Targeting rules
  users?: string[] // Specific user IDs
  tenants?: string[] // Specific tenant IDs
  percentage?: number // Rollout percentage (0-100)
  environments?: string[] // dev, staging, production
}

export interface FeatureFlagConfig {
  flags: Record<string, FeatureFlag>
  lastUpdated?: Date
}

interface FeatureFlagContextValue {
  flags: Record<string, FeatureFlag>
  isEnabled: (key: string) => boolean
  getValue: <T = FeatureFlagValue>(key: string, defaultValue?: T) => T
  getVariant: (key: string) => string | null
  isLoading: boolean
  refresh: () => Promise<void>
  // Development helpers
  enableFlag: (key: string) => void
  disableFlag: (key: string) => void
  resetFlags: () => void
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined)

interface FeatureFlagProviderProps {
  children: ReactNode
  config?: FeatureFlagConfig
  apiEndpoint?: string
  refreshInterval?: number // in milliseconds
  enableLocalOverrides?: boolean
}

// Default feature flags (can be overridden by remote config)
const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  "ai-powered-review": {
    key: "ai-powered-review",
    enabled: true,
    description: "Enable AI-powered document review",
  },
  "real-time-collaboration": {
    key: "real-time-collaboration",
    enabled: false,
    description: "Enable real-time collaboration features",
  },
  "advanced-analytics": {
    key: "advanced-analytics",
    enabled: true,
    description: "Enable advanced analytics dashboard",
  },
  "document-templates": {
    key: "document-templates",
    enabled: true,
    description: "Enable document template library",
  },
  "api-access": {
    key: "api-access",
    enabled: true,
    description: "Enable API access for integrations",
  },
  "custom-branding": {
    key: "custom-branding",
    enabled: false,
    percentage: 50,
    description: "Enable custom tenant branding",
  },
  "multi-language": {
    key: "multi-language",
    enabled: false,
    description: "Enable multi-language support",
  },
  "audit-logs": {
    key: "audit-logs",
    enabled: true,
    description: "Enable comprehensive audit logging",
  },
  "sso-integration": {
    key: "sso-integration",
    enabled: false,
    description: "Enable SSO integration",
  },
  "mobile-app": {
    key: "mobile-app",
    enabled: false,
    description: "Enable mobile app features",
  },
}

const STORAGE_KEY = "lexiscan-feature-flags-overrides"

/**
 * FeatureFlagProvider - Provides feature flag context to the entire app
 * 
 * Supports remote config, local overrides, and environment-based flags
 */
export function FeatureFlagProvider({ 
  children,
  config,
  apiEndpoint = "/api/feature-flags",
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  enableLocalOverrides = process.env.NODE_ENV === "development"
}: FeatureFlagProviderProps) {
  const { user } = useAuth()
  const { tenant } = useTenantContext()
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>(config?.flags || DEFAULT_FLAGS)
  const [isLoading, setIsLoading] = useState(false)
  const [localOverrides, setLocalOverrides] = useState<Record<string, boolean>>({})

  // Load local overrides from localStorage
  useEffect(() => {
    if (!enableLocalOverrides || typeof window === "undefined") return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setLocalOverrides(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load feature flag overrides:", error)
    }
  }, [enableLocalOverrides])

  // Fetch remote feature flags
  const fetchFlags = useCallback(async () => {
    if (!apiEndpoint) return

    setIsLoading(true)
    try {
      const response = await fetch(apiEndpoint)
      if (response.ok) {
        const data: FeatureFlagConfig = await response.json()
        setFlags(data.flags)
      }
    } catch (error) {
      console.error("Failed to fetch feature flags:", error)
    } finally {
      setIsLoading(false)
    }
  }, [apiEndpoint])

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchFlags()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchFlags, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchFlags, refreshInterval])

  // Check if flag is enabled for current user/tenant
  const isEnabled = useCallback((key: string): boolean => {
    // Check local override first (dev mode)
    if (enableLocalOverrides && key in localOverrides) {
      return localOverrides[key]
    }

    const flag = flags[key]
    if (!flag) return false
    if (!flag.enabled) return false

    // Check environment
    if (flag.environments && flag.environments.length > 0) {
      const currentEnv = process.env.NODE_ENV || "development"
      if (!flag.environments.includes(currentEnv)) return false
    }

    // Check user targeting
    if (flag.users && flag.users.length > 0 && user) {
      if (!flag.users.includes(user.id)) return false
    }

    // Check tenant targeting
    if (flag.tenants && flag.tenants.length > 0 && tenant) {
      if (!flag.tenants.includes(tenant.id)) return false
    }

    // Check percentage rollout
    if (flag.percentage !== undefined && flag.percentage < 100) {
      if (!user) return false
      
      // Deterministic rollout based on user ID
      const hash = user.id.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc)
      }, 0)
      const bucket = Math.abs(hash) % 100
      
      if (bucket >= flag.percentage) return false
    }

    return true
  }, [flags, localOverrides, enableLocalOverrides, user, tenant])

  // Get flag value (for non-boolean flags)
  const getValue = useCallback(<T = FeatureFlagValue,>(key: string, defaultValue?: T): T => {
    const flag = flags[key]
    
    if (!flag || !isEnabled(key)) {
      return (defaultValue ?? false) as T
    }

    return (flag.value ?? flag.enabled) as T
  }, [flags, isEnabled])

  // Get variant for A/B testing
  const getVariant = useCallback((key: string): string | null => {
    const flag = flags[key]
    
    if (!flag || !isEnabled(key)) return null
    
    if (typeof flag.value === "string") {
      return flag.value
    }
    
    if (typeof flag.value === "object" && flag.value !== null) {
      const variants = flag.value as Record<string, any>
      
      if (!user) return Object.keys(variants)[0] || null
      
      // Deterministic variant assignment based on user ID
      const hash = user.id.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc)
      }, 0)
      const variantKeys = Object.keys(variants)
      const index = Math.abs(hash) % variantKeys.length
      
      return variantKeys[index]
    }
    
    return null
  }, [flags, isEnabled, user])

  // Development helpers
  const enableFlag = useCallback((key: string) => {
    if (!enableLocalOverrides) return

    const newOverrides = { ...localOverrides, [key]: true }
    setLocalOverrides(newOverrides)
    
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides))
    }
  }, [localOverrides, enableLocalOverrides])

  const disableFlag = useCallback((key: string) => {
    if (!enableLocalOverrides) return

    const newOverrides = { ...localOverrides, [key]: false }
    setLocalOverrides(newOverrides)
    
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides))
    }
  }, [localOverrides, enableLocalOverrides])

  const resetFlags = useCallback(() => {
    if (!enableLocalOverrides) return

    setLocalOverrides({})
    
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [enableLocalOverrides])

  const value: FeatureFlagContextValue = {
    flags,
    isEnabled,
    getValue,
    getVariant,
    isLoading,
    refresh: fetchFlags,
    enableFlag,
    disableFlag,
    resetFlags,
  }

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>
}

/**
 * useFeatureFlags - Hook to access feature flag context
 * 
 * @throws {Error} If used outside of FeatureFlagProvider
 * 
 * @example
 * const { isEnabled, getValue, getVariant } = useFeatureFlags()
 * 
 * // Simple boolean check
 * if (isEnabled('ai-review-v2')) {
 *   return <AIReviewV2 />
 * }
 * 
 * // Get value
 * const maxDocuments = getValue('max-documents', 100)
 * 
 * // Get variant for A/B testing
 * const variant = getVariant('pricing-page')
 * if (variant === 'new-design') {
 *   return <NewPricingPage />
 * }
 */
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext)
  
  if (context === undefined) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagProvider")
  }
  
  return context
}

/**
 * FeatureGate - Component wrapper for feature-gated content
 * 
 * @example
 * <FeatureGate feature="ai-review-v2">
 *   <AIReviewV2 />
 * </FeatureGate>
 * 
 * // With fallback
 * <FeatureGate feature="advanced-analytics" fallback={<BasicAnalytics />}>
 *   <AdvancedAnalytics />
 * </FeatureGate>
 */
export function FeatureGate({ 
  feature,
  children,
  fallback = null
}: { 
  feature: string
  children: ReactNode
  fallback?: ReactNode 
}) {
  const { isEnabled } = useFeatureFlags()

  return <>{isEnabled(feature) ? children : fallback}</>
}

/**
 * withFeatureFlag - HOC to wrap components with feature flag check
 * 
 * @example
 * export default withFeatureFlag(NewFeature, 'new-feature-flag')
 */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  featureKey: string,
  fallback?: React.ComponentType<P>
) {
  return function FeatureFlaggedComponent(props: P) {
    const { isEnabled } = useFeatureFlags()

    if (!isEnabled(featureKey)) {
      return fallback ? React.createElement(fallback, props) : null
    }

    return <Component {...props} />
  }
}

/**
 * FeatureFlagDebugger - Development tool to view and toggle flags
 * 
 * Only visible in development mode
 * 
 * @example
 * <FeatureFlagDebugger />
 */
export function FeatureFlagDebugger() {
  const { flags, isEnabled, enableFlag, disableFlag, resetFlags } = useFeatureFlags()

  if (process.env.NODE_ENV !== "development") return null

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-purple-700"
      >
        🚩 Flags
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Feature Flags</h2>
              <div className="flex gap-2">
                <button
                  onClick={resetFlags}
                  className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto p-4">
              <div className="space-y-2">
                {Object.values(flags).map((flag) => {
                  const enabled = isEnabled(flag.key)
                  
                  return (
                    <div
                      key={flag.key}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono">{flag.key}</code>
                          <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                            enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {enabled ? "ON" : "OFF"}
                          </span>
                        </div>
                        {flag.description && (
                          <p className="mt-1 text-xs text-gray-600">{flag.description}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => enabled ? disableFlag(flag.key) : enableFlag(flag.key)}
                        className={`ml-4 rounded px-3 py-1 text-sm font-medium ${
                          enabled
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * useFeatureFlag - Simple hook for single feature flag check
 * 
 * @example
 * const isEnabled = useFeatureFlag('new-feature')
 */
export function useFeatureFlag(key: string): boolean {
  const { isEnabled } = useFeatureFlags()
  return isEnabled(key)
}

