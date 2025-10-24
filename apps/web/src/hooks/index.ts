/**
 * LexiScan AI - Enterprise Custom Hooks
 * 
 * A comprehensive collection of production-ready React hooks for building
 * enterprise-level SaaS applications with Next.js 15 and React 19.
 * 
 * @module hooks
 * @author LexiScan AI Team
 * @since 1.0.0
 */

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Local Storage Management
 * - Type-safe persistent storage
 * - Cross-tab synchronization
 * - SSR-safe implementation
 */
export { useLocalStorage } from "./useLocalStorage"

/**
 * Debouncing Utilities
 * - Value debouncing for performance
 * - Callback debouncing for API calls
 */
export { useDebounce, useDebouncedCallback } from "./useDebounce"

/**
 * Clipboard Operations
 * - Modern Clipboard API with fallback
 * - Copy feedback with auto-reset
 */
export { useClipboard } from "./useClipboard"
export type { UseClipboardReturn } from "./useClipboard"

/**
 * Toast Notifications
 * - Global toast state management
 * - Multiple toast types
 * - Auto-dismiss with actions
 */
export { useToast, toast } from "./useToast"
export type { Toast, ToastType } from "./useToast"

/**
 * Keyboard Shortcuts
 * - Multi-key combinations
 * - Modifier key support
 * - Input element detection
 */
export { useKeyboardShortcuts, useKeyPress, COMMON_SHORTCUTS } from "./useKeyboardShortcuts"
export type { KeyboardShortcut } from "./useKeyboardShortcuts"

/**
 * Infinite Scroll Pagination
 * - Intersection Observer based
 * - Configurable thresholds
 * - Auto-loading management
 */
export { useInfiniteScroll, useScrollPagination } from "./useInfiniteScroll"

// ============================================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================================

/**
 * Authentication System
 * - JWT-based auth flow
 * - Session management
 * - Token refresh
 * - Multi-tenant ready
 */
export { useAuth } from "./useAuth"
export type {
  User,
  AuthSession,
  LoginCredentials,
  SignupData,
} from "./useAuth"

/**
 * User Profile Management
 * - Profile CRUD operations
 * - Preferences management
 * - Avatar handling
 * - Password management
 */
export { useUser } from "./useUser"
export type { UserPreferences } from "./useUser"

/**
 * Multi-Tenant Organization
 * - Organization management
 * - Member invitation system
 * - Role assignment
 * - Tenant switching
 */
export { useTenant } from "./useTenant"
export type {
  Tenant,
  TenantMember,
  TenantInvitation,
} from "./useTenant"

/**
 * RBAC Permission System
 * - Granular permission checks
 * - Resource-based permissions
 * - Role hierarchy
 * - Component protection
 */
export { usePermissions, withPermission, useRequireRole } from "./usePermissions"
export type { Role, Permission } from "./usePermissions"

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

/**
 * Document Management
 * - Document CRUD with filters
 * - AI review workflow
 * - Status tracking
 * - Download and sharing
 */
export { useDocuments } from "./useDocuments"
export type {
  Document,
  Review,
  DocumentStatus,
  ReviewStatus,
  DocumentFilters,
} from "./useDocuments"

/**
 * File Upload System
 * - Multi-file upload
 * - Progress tracking
 * - Speed calculation
 * - File validation
 */
export { useUpload } from "./useUpload"
export type {
  UploadProgress,
  UploadedFile,
} from "./useUpload"

/**
 * WebSocket Real-time
 * - Auto-reconnection
 * - Message subscriptions
 * - Heartbeat mechanism
 * - Type-safe messaging
 */
export { useWebSocket, useDocumentUpdates } from "./useWebSocket"
export type {
  WebSocketStatus,
  WebSocketMessage,
} from "./useWebSocket"

/**
 * Analytics & Tracking
 * - Event tracking
 * - Page view tracking
 * - Performance monitoring
 * - Conversion tracking
 */
export { useAnalytics, useFeatureTracking } from "./useAnalytics"
export type {
  AnalyticsEvent,
  PageViewEvent,
} from "./useAnalytics"

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * @example Authentication Flow
 * ```tsx
 * import { useAuth, useToast } from '@/hooks'
 * 
 * function LoginPage() {
 *   const { login, isLoading } = useAuth()
 *   const { success, error } = useToast()
 *   
 *   const handleLogin = async (email: string, password: string) => {
 *     try {
 *       await login({ email, password })
 *       success('Welcome back!')
 *       router.push('/dashboard')
 *     } catch (err) {
 *       error('Login failed', err.message)
 *     }
 *   }
 *   
 *   return <LoginForm onSubmit={handleLogin} loading={isLoading} />
 * }
 * ```
 */

/**
 * @example Document Upload with Progress
 * ```tsx
 * import { useUpload } from '@/hooks'
 * 
 * function UploadButton() {
 *   const { upload, uploadProgress, isUploading } = useUpload({
 *     maxSize: 50 * 1024 * 1024, // 50MB
 *     acceptedTypes: ['application/pdf'],
 *     onUploadComplete: (files) => {
 *       console.log('Uploaded:', files)
 *     }
 *   })
 *   
 *   return (
 *     <div>
 *       <input
 *         type="file"
 *         multiple
 *         onChange={(e) => upload(Array.from(e.target.files!))}
 *       />
 *       {Array.from(uploadProgress.values()).map((progress) => (
 *         <ProgressBar key={progress.filename} {...progress} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * @example Permission-Protected Component
 * ```tsx
 * import { usePermissions } from '@/hooks'
 * 
 * function AdminPanel() {
 *   const { hasPermission, canManage } = usePermissions()
 *   
 *   if (!hasPermission('users.manage')) {
 *     return <AccessDenied />
 *   }
 *   
 *   return (
 *     <div>
 *       {canManage('documents') && <DocumentSettings />}
 *       {canManage('billing') && <BillingSettings />}
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * @example Real-time Document Updates
 * ```tsx
 * import { useDocumentUpdates } from '@/hooks'
 * 
 * function DocumentList() {
 *   const { onDocumentProcessed } = useDocumentUpdates()
 *   
 *   useEffect(() => {
 *     const unsubscribe = onDocumentProcessed((doc) => {
 *       toast.success('Document processed!', doc.title)
 *       refetchDocuments()
 *     })
 *     return unsubscribe
 *   }, [])
 *   
 *   return <div>...</div>
 * }
 * ```
 */

/**
 * @example Analytics Tracking
 * ```tsx
 * import { useAnalytics, useFeatureTracking } from '@/hooks'
 * 
 * function FeaturePage() {
 *   const { track } = useAnalytics()
 *   const { trackFeatureUsed } = useFeatureTracking('ai-review')
 *   
 *   const handleReview = () => {
 *     trackFeatureUsed('start_review', { documentType: 'contract' })
 *     // ... start review
 *   }
 *   
 *   return <button onClick={handleReview}>Start AI Review</button>
 * }
 * ```
 */

