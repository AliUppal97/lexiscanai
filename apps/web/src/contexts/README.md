# LexiScan AI - Enterprise Context Providers

Comprehensive React Context providers for enterprise-level state management in your SaaS application.

## 📚 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Context Providers](#context-providers)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Architecture](#architecture)
- [Integration Guide](#integration-guide)

## 🎯 Overview

This contexts library provides enterprise-grade global state management for:

- **Authentication**: User sessions, JWT tokens, route protection
- **Multi-Tenancy**: Organization management, members, branding
- **Theming**: Dark/light mode with system detection
- **Notifications**: Toasts, real-time alerts, notification center
- **Feature Flags**: A/B testing, gradual rollouts, targeting

### Key Features

✅ **Type-Safe**: Full TypeScript support  
✅ **SSR-Ready**: Compatible with Next.js 15  
✅ **Performance Optimized**: Minimal re-renders  
✅ **Production Tested**: Enterprise-grade reliability  
✅ **Well-Documented**: Comprehensive examples  
✅ **Composable**: Easy to integrate and extend  

## 🚀 Quick Start

### 1. Setup All Providers

```tsx
// app/layout.tsx
import { AppProviders, ThemeScript } from '@/contexts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
```

### 2. Use in Components

```tsx
import { useAuthContext, useTheme, useNotifications } from '@/contexts'

function MyComponent() {
  const { user } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const { success } = useNotifications()

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => success('Action completed!')}>
        Show Notification
      </button>
    </div>
  )
}
```

## 📦 Context Providers

### 1. AuthContext

**Purpose:** Global authentication state management

**Features:**
- JWT token management with auto-refresh
- Session persistence across page reloads
- Automatic route protection
- Login/logout flows
- User profile updates

**Basic Usage:**
```tsx
import { useAuthContext, RequireAuth } from '@/contexts'

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuthContext()

  return (
    <RequireAuth>
      <div>
        <p>Logged in as: {user?.email}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </RequireAuth>
  )
}
```

**Route Protection:**
```tsx
import { withAuthProtection } from '@/contexts'

function AdminPanel() {
  return <div>Admin Content</div>
}

export default withAuthProtection(AdminPanel)
```

### 2. TenantContext

**Purpose:** Multi-tenant organization management

**Features:**
- Organization data access
- Member management (invite, remove, update roles)
- Invitation system
- Custom branding per tenant
- Tenant switching for multi-org users
- Usage quotas and limits

**Basic Usage:**
```tsx
import { useTenantContext, RequireTenant } from '@/contexts'

function TeamPage() {
  const { tenant, members, inviteMember } = useTenantContext()

  const handleInvite = async (email: string, roleId: string) => {
    await inviteMember(email, roleId)
  }

  return (
    <RequireTenant>
      <div>
        <h1>{tenant?.name}</h1>
        <p>{members.length} members</p>
        <InviteForm onSubmit={handleInvite} />
      </div>
    </RequireTenant>
  )
}
```

**Custom Branding:**
```tsx
import { TenantBranding, useTenantSettings } from '@/contexts'

function App() {
  return (
    <TenantBranding>
      <YourApp />
    </TenantBranding>
  )
}

function FeatureCheck() {
  const { hasFeature } = useTenantSettings()

  if (!hasFeature('advanced-analytics')) {
    return <UpgradePrompt />
  }

  return <AdvancedAnalytics />
}
```

### 3. ThemeContext

**Purpose:** Dark/light mode management

**Features:**
- System theme detection
- Manual theme override (light/dark/system)
- Persistent user preference
- Smooth transitions
- SSR-safe implementation
- Meta theme-color updates

**Basic Usage:**
```tsx
import { useTheme, ThemeToggle } from '@/contexts'

function Header() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <header>
      <p>Current: {resolvedTheme}</p>
      <ThemeToggle showLabel />
      
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </header>
  )
}
```

**Prevent Flash of Unstyled Content:**
```tsx
// Add to your root layout <head>
import { ThemeScript } from '@/contexts'

<head>
  <ThemeScript />
</head>
```

**Media Query Hook:**
```tsx
import { useMediaQuery } from '@/contexts'

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isDark = useMediaQuery('(prefers-color-scheme: dark)')

  return <div>{isMobile ? <MobileView /> : <DesktopView />}</div>
}
```

### 4. NotificationContext

**Purpose:** Global notification system

**Features:**
- Toast notifications (success, error, warning, info)
- Real-time WebSocket notifications
- In-app notification center
- Read/unread tracking
- Action buttons
- Auto-dismiss with configurable duration

**Basic Usage:**
```tsx
import { useNotifications, NotificationBell } from '@/contexts'

function UploadButton() {
  const { success, error, notifications, unreadCount } = useNotifications()

  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file)
      success('Upload complete', 'Your file is ready')
    } catch (err) {
      error('Upload failed', err.message)
    }
  }

  return (
    <div>
      <button onClick={handleUpload}>Upload</button>
      <NotificationBell />
      {unreadCount > 0 && <Badge count={unreadCount} />}
    </div>
  )
}
```

**Notification with Action:**
```tsx
const { notifyWithAction } = useNotifications()

notifyWithAction({
  type: 'info',
  title: 'Document ready',
  message: 'Your document has been processed',
  action: {
    label: 'View',
    onClick: () => router.push('/documents/123')
  }
})
```

**Notification Center:**
```tsx
import { useNotifications, NotificationItem } from '@/contexts'

function NotificationPanel() {
  const { 
    notifications, 
    markAsRead, 
    dismissNotification, 
    markAllAsRead,
    clearAll 
  } = useNotifications()

  return (
    <div>
      <div className="flex justify-between">
        <h2>Notifications</h2>
        <button onClick={markAllAsRead}>Mark all read</button>
        <button onClick={clearAll}>Clear all</button>
      </div>
      
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={markAsRead}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  )
}
```

### 5. FeatureFlagContext

**Purpose:** Feature toggle / flag management

**Features:**
- Environment-based feature flags
- User-specific targeting
- Tenant-specific targeting
- Percentage-based rollouts
- A/B testing with variants
- Remote configuration
- Local dev overrides

**Basic Usage:**
```tsx
import { useFeatureFlags, FeatureGate } from '@/contexts'

function DocumentList() {
  const { isEnabled, getValue, getVariant } = useFeatureFlags()

  const maxDocuments = getValue('max-documents', 100)
  const uiVariant = getVariant('document-ui')

  return (
    <div>
      <FeatureGate feature="ai-review-v2">
        <AIReviewV2Button />
      </FeatureGate>

      {isEnabled('real-time-collab') && (
        <CollaborationPanel />
      )}

      {uiVariant === 'new-design' ? (
        <NewDocumentList />
      ) : (
        <OldDocumentList />
      )}
    </div>
  )
}
```

**Component Protection:**
```tsx
import { withFeatureFlag } from '@/contexts'

function NewFeature() {
  return <div>New Feature Content</div>
}

export default withFeatureFlag(NewFeature, 'new-feature-key')
```

**Development Debugger:**
```tsx
import { FeatureFlagDebugger } from '@/contexts'

// Only visible in development mode
function App() {
  return (
    <>
      <YourApp />
      <FeatureFlagDebugger />
    </>
  )
}
```

## 💡 Usage Examples

### Complete Dashboard Example

```tsx
import {
  useAuthContext,
  useTenantContext,
  useTheme,
  useNotifications,
  useFeatureFlags,
  RequireAuth,
  ThemeToggle,
  NotificationBell
} from '@/contexts'

function Dashboard() {
  const { user, logout } = useAuthContext()
  const { tenant } = useTenantContext()
  const { resolvedTheme } = useTheme()
  const { success } = useNotifications()
  const { isEnabled } = useFeatureFlags()

  return (
    <RequireAuth>
      <div className="dashboard">
        <header>
          <h1>{tenant?.name} Dashboard</h1>
          <div className="actions">
            <ThemeToggle />
            <NotificationBell />
            <button onClick={logout}>Logout</button>
          </div>
        </header>

        <main>
          <h2>Welcome, {user?.firstName}!</h2>
          <p>Theme: {resolvedTheme}</p>
          
          {isEnabled('advanced-analytics') && (
            <AnalyticsDashboard />
          )}
        </main>
      </div>
    </RequireAuth>
  )
}
```

### Protected Admin Panel

```tsx
import { 
  useAuthContext, 
  withAuthProtection,
  useFeatureFlags,
  FeatureGate 
} from '@/contexts'
import { usePermissions } from '@/hooks'

function AdminPanel() {
  const { user } = useAuthContext()
  const { hasPermission } = usePermissions()
  const { isEnabled } = useFeatureFlags()

  if (!hasPermission('admin.access')) {
    return <AccessDenied />
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      
      {hasPermission('users.manage') && (
        <UserManagement />
      )}

      <FeatureGate feature="audit-logs">
        <AuditLogsViewer />
      </FeatureGate>
    </div>
  )
}

export default withAuthProtection(AdminPanel)
```

## 🎨 Best Practices

### 1. Provider Order Matters

Always use `AppProviders` which sets up providers in the correct order:

```tsx
ThemeProvider
  ↓
FeatureFlagProvider
  ↓
AuthProvider
  ↓
TenantProvider
  ↓
NotificationProvider
```

### 2. Conditional Rendering

Always check loading and authentication states:

```tsx
function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <LoginPrompt />

  return <div>Content for {user?.email}</div>
}
```

### 3. Error Boundaries

Wrap context providers with error boundaries:

```tsx
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary fallback={<ErrorScreen />}>
  <AppProviders>
    <App />
  </AppProviders>
</ErrorBoundary>
```

### 4. Memoize Callbacks

Prevent unnecessary re-renders:

```tsx
const { success } = useNotifications()

const handleSuccess = useCallback(() => {
  success('Action completed!')
}, [success])
```

### 5. Feature Flag Strategy

Use feature flags for:
- New features in beta
- A/B testing experiments
- Gradual rollouts
- Emergency kill switches

```tsx
// Good: Feature gating
<FeatureGate feature="new-editor" fallback={<OldEditor />}>
  <NewEditor />
</FeatureGate>

// Bad: Too many nested checks
{isEnabled('feature1') && isEnabled('feature2') && isEnabled('feature3') && <Component />}
```

## 🏗️ Architecture

### Context Hierarchy

```
AppProviders
├── ThemeProvider (outermost - UI concerns)
│   └── FeatureFlagProvider (feature control)
│       └── AuthProvider (user session)
│           └── TenantProvider (organization data)
│               └── NotificationProvider (innermost - UI feedback)
```

### Data Flow

```
User Action
    ↓
Context Hook (useAuthContext, etc.)
    ↓
Context State Update
    ↓
Backend API Call (if needed)
    ↓
Optimistic UI Update
    ↓
Component Re-render
```

### Integration with Hooks

Contexts integrate seamlessly with custom hooks:

```tsx
// Context uses hook internally
function AuthProvider({ children }) {
  const auth = useAuth() // Custom hook
  // ...
}

// Components use context
function MyComponent() {
  const { user } = useAuthContext() // Context
  const { documents } = useDocuments() // Hook
  // ...
}
```

## 🔧 Integration Guide

### Step 1: Install Dependencies

All dependencies are already included in your project.

### Step 2: Setup Root Layout

```tsx
// app/layout.tsx
import { AppProviders, ThemeScript } from '@/contexts'
import '@/app/globals.css'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
```

### Step 3: Add Theme Styles

```css
/* globals.css */
.theme-transitioning,
.theme-transitioning *,
.theme-transitioning *:before,
.theme-transitioning *:after {
  transition: background-color 300ms ease, color 300ms ease, border-color 300ms ease !important;
  transition-delay: 0 !important;
}

:root {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}

.dark {
  --color-background: #1a1a1a;
  --color-foreground: #ffffff;
}

.light {
  --color-background: #ffffff;
  --color-foreground: #000000;
}
```

### Step 4: Use in Your Components

Start using contexts in your components as shown in the examples above.

## 📊 Performance Considerations

### Optimization Tips

1. **Selective Re-renders**: Contexts are optimized to minimize re-renders
2. **Memoization**: Use `useCallback` and `useMemo` for derived values
3. **Context Splitting**: Each context manages its own slice of state
4. **Lazy Loading**: Components wrapped in `RequireAuth` won't render until authenticated

### Bundle Size

- Total contexts bundle: ~50KB (minified)
- Individual context average: ~10KB
- Tree-shakeable: Import only what you need

## 🔐 Security Notes

- **Auth tokens**: Stored securely with HttpOnly cookies (when implemented on backend)
- **XSS Protection**: All user inputs are sanitized
- **CSRF Protection**: Tokens included in state-changing requests
- **Route Protection**: Automatic redirects for unauthenticated users
- **Permission Checks**: Client-side checks backed by server-side validation

## 📝 TypeScript Support

All contexts are fully typed with exported interfaces:

```tsx
import type { 
  Theme,
  Notification,
  FeatureFlag,
  Tenant,
  User
} from '@/contexts'
```

## 🧪 Testing

### Testing with Contexts

```tsx
import { render } from '@testing-library/react'
import { AppProviders } from '@/contexts'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AppProviders>
      {ui}
    </AppProviders>
  )
}

// Use in tests
test('renders with auth', () => {
  const { getByText } = renderWithProviders(<MyComponent />)
  // ...
})
```

## 📖 Additional Resources

- [React Context Documentation](https://react.dev/reference/react/createContext)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Built with ❤️ by the LexiScan AI Team**

Enterprise-grade state management for modern SaaS applications.

