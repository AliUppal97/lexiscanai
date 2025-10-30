/**
 * LexiScan AI - Enterprise Context Providers
 * 
 * Centralized state management for enterprise SaaS application
 * 
 * @module contexts
 * @author LexiScan AI Team
 * @since 1.0.0
 */

// ============================================================================
// AUTHENTICATION CONTEXT
// ============================================================================

/**
 * AuthContext - Global authentication state
 * 
 * Provides centralized auth state management with:
 * - User session management
 * - Token refresh
 * - Route protection
 * - Auto-redirect logic
 */
export {
  AuthProvider,
  useAuthContext,
  withAuthProtection,
  RequireAuth,
} from "./AuthContext"

// ============================================================================
// TENANT/ORGANIZATION CONTEXT
// ============================================================================

/**
 * TenantContext - Multi-tenant organization management
 * 
 * Provides tenant/organization features:
 * - Organization data access
 * - Member management
 * - Invitation system
 * - Custom branding
 */
export {
  TenantProvider,
  useTenantContext,
  RequireTenant,
  TenantBranding,
  withTenantAccess,
  useTenantSettings,
} from "./TenantContext"

// ============================================================================
// THEME CONTEXT
// ============================================================================

/**
 * ThemeContext - Dark/Light mode management
 * 
 * Provides theme switching with:
 * - System theme detection
 * - Persistent preferences
 * - Smooth transitions
 * - SSR support
 */
export {
  ThemeProvider,
  useTheme,
  ThemeToggle,
  ThemeScript,
  useMediaQuery,
  type Theme,
  type ResolvedTheme,
} from "./ThemeContext"

// ============================================================================
// NOTIFICATION CONTEXT
// ============================================================================

/**
 * NotificationContext - Global notification system
 * 
 * Provides comprehensive notifications:
 * - Toast notifications
 * - Real-time updates
 * - Notification center
 * - Read/unread tracking
 */
export {
  NotificationProvider,
  useNotifications,
  NotificationBell,
  NotificationItem,
  notify,
  type Notification,
} from "./NotificationContext"

// ============================================================================
// FEATURE FLAG CONTEXT
// ============================================================================

/**
 * FeatureFlagContext - Feature toggle management
 * 
 * Provides feature flag system:
 * - Environment-based flags
 * - User/tenant targeting
 * - A/B testing
 * - Gradual rollouts
 */
export {
  FeatureFlagProvider,
  useFeatureFlags,
  useFeatureFlag,
  FeatureGate,
  withFeatureFlag,
  FeatureFlagDebugger,
  type FeatureFlag,
  type FeatureFlagConfig,
} from "./FeatureFlagContext"

// ============================================================================
// COMPOSED PROVIDER
// ============================================================================

/**
 * AppProviders - Compose all providers in correct order
 * 
 * @example
 * import { AppProviders } from '@/contexts'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AppProviders>
 *           {children}
 *         </AppProviders>
 *       </body>
 *     </html>
 *   )
 * }
 */
import { ReactNode } from "react"
import { AuthProvider } from "./AuthContext"
import { TenantProvider } from "./TenantContext"
import { ThemeProvider } from "./ThemeContext"
import { NotificationProvider } from "./NotificationContext"
import { FeatureFlagProvider } from "./FeatureFlagContext"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <FeatureFlagProvider>
        <AuthProvider requireAuth={false}>
          <TenantProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </TenantProvider>
        </AuthProvider>
      </FeatureFlagProvider>
    </ThemeProvider>
  )
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * @example Basic Setup
 * ```tsx
 * // In app/layout.tsx
 * import { AppProviders, ThemeScript } from '@/contexts'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html suppressHydrationWarning>
 *       <head>
 *         <ThemeScript />
 *       </head>
 *       <body>
 *         <AppProviders>
 *           {children}
 *         </AppProviders>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */

/**
 * @example Using Auth Context
 * ```tsx
 * import { useAuthContext, RequireAuth } from '@/contexts'
 * 
 * function DashboardPage() {
 *   const { user, logout } = useAuthContext()
 *   
 *   return (
 *     <RequireAuth>
 *       <div>
 *         <h1>Welcome, {user?.firstName}!</h1>
 *         <button onClick={logout}>Logout</button>
 *       </div>
 *     </RequireAuth>
 *   )
 * }
 * ```
 */

/**
 * @example Using Theme Context
 * ```tsx
 * import { useTheme, ThemeToggle } from '@/contexts'
 * 
 * function Header() {
 *   const { theme, resolvedTheme } = useTheme()
 *   
 *   return (
 *     <header>
 *       <h1>Current theme: {resolvedTheme}</h1>
 *       <ThemeToggle />
 *     </header>
 *   )
 * }
 * ```
 */

/**
 * @example Using Notifications
 * ```tsx
 * import { useNotifications, NotificationBell } from '@/contexts'
 * 
 * function UploadButton() {
 *   const { success, error } = useNotifications()
 *   
 *   const handleUpload = async (file: File) => {
 *     try {
 *       await uploadFile(file)
 *       success('Upload complete', 'Your file is ready')
 *     } catch (err) {
 *       error('Upload failed', err.message)
 *     }
 *   }
 *   
 *   return (
 *     <div>
 *       <button onClick={handleUpload}>Upload</button>
 *       <NotificationBell />
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * @example Using Feature Flags
 * ```tsx
 * import { useFeatureFlags, FeatureGate } from '@/contexts'
 * 
 * function DocumentList() {
 *   const { isEnabled } = useFeatureFlags()
 *   
 *   return (
 *     <div>
 *       <FeatureGate feature="ai-review-v2">
 *         <AIReviewV2Button />
 *       </FeatureGate>
 *       
 *       {isEnabled('real-time-collab') && (
 *         <CollaborationPanel />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * @example Using Tenant Context
 * ```tsx
 * import { useTenantContext, RequireTenant } from '@/contexts'
 * 
 * function TeamPage() {
 *   const { tenant, members, inviteMember } = useTenantContext()
 *   
 *   return (
 *     <RequireTenant>
 *       <div>
 *         <h1>{tenant?.name}</h1>
 *         <p>{members.length} members</p>
 *         <InviteButton onInvite={inviteMember} />
 *       </div>
 *     </RequireTenant>
 *   )
 * }
 * ```
 */

