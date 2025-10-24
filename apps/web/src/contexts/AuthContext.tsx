"use client"

import React, { createContext, useContext, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth as useAuthHook, type User, type AuthSession } from "@/hooks/useAuth"

/**
 * AuthContext - Global authentication state management
 * 
 * Features:
 * - Centralized auth state
 * - Automatic route protection
 * - Session persistence
 * - Token refresh management
 * - Login/logout flows
 * - User profile updates
 * 
 * @example
 * // Wrap your app with AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * // Use in components
 * const { user, isAuthenticated, login, logout } = useAuthContext()
 */

interface AuthContextValue {
  user: User | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>
  signup: (data: { email: string; password: string; firstName?: string; lastName?: string; organizationName?: string }) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  requireAuth?: boolean // If true, redirects to login when not authenticated
  publicRoutes?: string[] // Routes that don't require authentication
}

/**
 * AuthProvider - Provides authentication context to the entire app
 */
export function AuthProvider({ 
  children, 
  requireAuth = false,
  publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/about", "/pricing", "/features", "/contact", "/security", "/compliance", "/blog", "/press", "/careers", "/help", "/docs", "/api", "/integrations", "/case-studies", "/resources"]
}: AuthProviderProps) {
  const auth = useAuthHook()
  const router = useRouter()
  const pathname = usePathname()

  // Auto-redirect logic for protected routes
  useEffect(() => {
    if (typeof window === "undefined") return

    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || 
      pathname.startsWith(`${route}/`) ||
      pathname.startsWith("/solutions/")
    )

    // If requireAuth is enabled and user is not authenticated and not on a public route
    if (requireAuth && !auth.isLoading && !auth.isAuthenticated && !isPublicRoute) {
      // Store the intended destination
      const intendedPath = pathname !== "/login" ? pathname : "/dashboard"
      sessionStorage.setItem("auth_redirect", intendedPath)
      router.push("/login")
    }

    // If user is authenticated and on login/signup, redirect to dashboard
    if (auth.isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
      const redirectPath = sessionStorage.getItem("auth_redirect") || "/dashboard"
      sessionStorage.removeItem("auth_redirect")
      router.push(redirectPath)
    }
  }, [auth.isAuthenticated, auth.isLoading, pathname, router, requireAuth, publicRoutes])

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!auth.session?.expiresAt) return

    const expiresAt = new Date(auth.session.expiresAt).getTime()
    const now = Date.now()
    const timeUntilExpiry = expiresAt - now
    
    // Refresh 5 minutes before expiration
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000)

    if (refreshTime > 0) {
      const timer = setTimeout(() => {
        auth.refreshSession().catch(console.error)
      }, refreshTime)

      return () => clearTimeout(timer)
    }
  }, [auth.session?.expiresAt, auth])

  const value: AuthContextValue = {
    user: auth.user,
    session: auth.session,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login: auth.login,
    signup: auth.signup,
    logout: auth.logout,
    refreshSession: auth.refreshSession,
    updateUser: auth.updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuthContext - Hook to access authentication context
 * 
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * const { user, isAuthenticated, logout } = useAuthContext()
 * 
 * if (!isAuthenticated) return <LoginPrompt />
 * 
 * return (
 *   <div>
 *     <p>Welcome, {user?.firstName}!</p>
 *     <button onClick={logout}>Logout</button>
 *   </div>
 * )
 */
export function useAuthContext() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  
  return context
}

/**
 * withAuthProtection - HOC to protect routes that require authentication
 * 
 * @example
 * export default withAuthProtection(DashboardPage)
 */
export function withAuthProtection<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string
    loadingComponent?: React.ComponentType
  }
) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading, user } = useAuthContext()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(options?.redirectTo || "/login")
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      const LoadingComponent = options?.loadingComponent
      return LoadingComponent ? <LoadingComponent /> : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated || !user) {
      return null
    }

    return <Component {...props} />
  }
}

/**
 * RequireAuth - Component wrapper for protecting routes
 * 
 * @example
 * <RequireAuth>
 *   <DashboardContent />
 * </RequireAuth>
 */
export function RequireAuth({ 
  children,
  fallback
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  return <>{children}</>
}

