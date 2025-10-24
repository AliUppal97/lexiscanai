# LexiScan AI - Enterprise Custom Hooks

A comprehensive collection of production-ready React hooks for building enterprise-level SaaS applications with Next.js 15 and React 19.

## 📚 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Hook Categories](#hook-categories)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Architecture](#architecture)
- [Testing](#testing)
- [Contributing](#contributing)

## 🎯 Overview

This hooks library provides enterprise-grade functionality for:

- **Authentication & Authorization**: Complete JWT-based auth with RBAC
- **Multi-tenant Management**: Organization and member management
- **Document Processing**: AI-powered document analysis workflow
- **Real-time Communication**: WebSocket with auto-reconnection
- **File Upload**: Progress tracking with validation
- **Analytics**: Comprehensive event and performance tracking
- **Utilities**: Local storage, debouncing, clipboard, notifications

### Key Features

✅ **Type-Safe**: Full TypeScript support with strict mode  
✅ **SSR-Ready**: Compatible with Next.js 15 server components  
✅ **Performance Optimized**: SWR caching, optimistic updates  
✅ **Enterprise-Grade**: Error handling, retry logic, security  
✅ **Fully Documented**: JSDoc comments with examples  
✅ **Production Tested**: Used in production at scale  

## 📦 Installation

All hooks are already included in the project. Import from the centralized index:

```tsx
import { useAuth, useDocuments, useUpload } from '@/hooks'
```

## 🗂️ Hook Categories

### Utility Hooks

| Hook | Purpose | Key Features |
|------|---------|--------------|
| `useLocalStorage` | Persistent storage | Type-safe, cross-tab sync |
| `useDebounce` | Value/callback debouncing | Performance optimization |
| `useClipboard` | Copy to clipboard | Modern API with fallback |
| `useToast` | Toast notifications | Global state, auto-dismiss |
| `useKeyboardShortcuts` | Keyboard navigation | Multi-key, modifiers |
| `useInfiniteScroll` | Pagination | Intersection Observer |

### Authentication Hooks

| Hook | Purpose | Key Features |
|------|---------|--------------|
| `useAuth` | Authentication flow | JWT, session, refresh |
| `useUser` | User profile | Preferences, avatar, password |
| `useTenant` | Organization mgmt | Members, invitations, branding |
| `usePermissions` | RBAC system | Granular permissions, HOCs |

### Business Logic Hooks

| Hook | Purpose | Key Features |
|------|---------|--------------|
| `useDocuments` | Document CRUD | Filters, search, AI review |
| `useUpload` | File upload | Progress, validation, cancel |
| `useWebSocket` | Real-time updates | Auto-reconnect, subscriptions |
| `useAnalytics` | Event tracking | GA4, PostHog, Web Vitals |

## 💡 Usage Examples

### Authentication Flow

```tsx
import { useAuth, useToast } from '@/hooks'
import { useRouter } from 'next/navigation'

function LoginPage() {
  const router = useRouter()
  const { login, isLoading, isAuthenticated } = useAuth()
  const { success, error } = useToast()

  const handleLogin = async (credentials) => {
    try {
      await login(credentials)
      success('Welcome back!')
      router.push('/dashboard')
    } catch (err) {
      error('Login failed', err.message)
    }
  }

  if (isAuthenticated) {
    router.push('/dashboard')
    return null
  }

  return <LoginForm onSubmit={handleLogin} loading={isLoading} />
}
```

### Permission-Based Rendering

```tsx
import { usePermissions } from '@/hooks'

function DocumentActions({ documentId }) {
  const { canUpdate, canDelete, hasRole } = usePermissions()

  return (
    <div className="flex gap-2">
      {canUpdate('documents') && (
        <Button onClick={() => editDocument(documentId)}>
          Edit
        </Button>
      )}
      
      {canDelete('documents') && (
        <Button variant="destructive" onClick={() => deleteDocument(documentId)}>
          Delete
        </Button>
      )}
      
      {hasRole('Admin') && (
        <Button onClick={() => auditDocument(documentId)}>
          Audit Log
        </Button>
      )}
    </div>
  )
}
```

### File Upload with Progress

```tsx
import { useUpload } from '@/hooks'
import { Progress } from '@/components/ui/progress'

function DocumentUploader() {
  const { upload, uploadProgress, isUploading, cancelUpload } = useUpload({
    maxSize: 50 * 1024 * 1024, // 50MB
    acceptedTypes: ['application/pdf', 'application/msword'],
    onUploadComplete: (files) => {
      console.log('Uploaded:', files)
      refetchDocuments()
    }
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await upload(files)
  }

  return (
    <div>
      <input
        type="file"
        multiple
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      
      {Array.from(uploadProgress.values()).map((progress) => (
        <div key={progress.filename} className="mt-4">
          <div className="flex justify-between mb-2">
            <span>{progress.filename}</span>
            <span>{progress.progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress.progress} />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>
              {(progress.uploadedBytes / 1024 / 1024).toFixed(2)} MB / 
              {(progress.totalBytes / 1024 / 1024).toFixed(2)} MB
            </span>
            {progress.speed && (
              <span>
                {(progress.speed / 1024 / 1024).toFixed(2)} MB/s
              </span>
            )}
          </div>
          {progress.status === 'uploading' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelUpload(progress.filename)}
            >
              Cancel
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
```

### Real-time Document Updates

```tsx
import { useDocumentUpdates } from '@/hooks'
import { useEffect } from 'react'

function DocumentList() {
  const { documents, refetch } = useDocuments()
  const { onDocumentProcessed, onDocumentFailed } = useDocumentUpdates()

  useEffect(() => {
    // Subscribe to document processing completion
    const unsubscribe1 = onDocumentProcessed((data) => {
      toast.success('Document processed!', data.title)
      refetch() // Refresh document list
    })

    // Subscribe to processing failures
    const unsubscribe2 = onDocumentFailed((error) => {
      toast.error('Processing failed', error.message)
      refetch()
    })

    return () => {
      unsubscribe1()
      unsubscribe2()
    }
  }, [onDocumentProcessed, onDocumentFailed, refetch])

  return (
    <div>
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  )
}
```

### Analytics Tracking

```tsx
import { useAnalytics, useFeatureTracking } from '@/hooks'

function AIPoweredFeature() {
  const { track, trackConversion } = useAnalytics()
  const { trackFeatureUsed } = useFeatureTracking('ai-document-review')

  const handleStartReview = async (documentId: string) => {
    // Track feature usage
    trackFeatureUsed('start_review', {
      documentId,
      documentType: 'contract',
      timestamp: new Date().toISOString()
    })

    try {
      const result = await startAIReview(documentId)
      
      // Track successful conversion
      trackConversion('AI_Review_Completed', undefined, {
        documentId,
        processingTime: result.processingTime,
        accuracy: result.accuracy
      })
    } catch (error) {
      // Track errors
      track('AI_Review_Failed', {
        documentId,
        error: error.message
      })
    }
  }

  return <Button onClick={() => handleStartReview(doc.id)}>Start AI Review</Button>
}
```

### Multi-tenant Organization

```tsx
import { useTenant } from '@/hooks'

function TeamManagement() {
  const { 
    tenant, 
    members, 
    invitations,
    inviteMember, 
    removeMember,
    updateMemberRoles 
  } = useTenant()

  const handleInvite = async (email: string, roleId: string) => {
    await inviteMember(email, roleId)
    // Toast notification handled by hook
  }

  return (
    <div>
      <h2>{tenant?.name}</h2>
      
      {/* Member list */}
      <div>
        {members.map(member => (
          <MemberCard
            key={member.id}
            member={member}
            onRemove={() => removeMember(member.userId)}
            onUpdateRoles={(roles) => updateMemberRoles(member.userId, roles)}
          />
        ))}
      </div>

      {/* Pending invitations */}
      <div>
        {invitations.map(invite => (
          <InvitationCard key={invite.id} invitation={invite} />
        ))}
      </div>

      {/* Invite form */}
      <InviteForm onSubmit={handleInvite} />
    </div>
  )
}
```

## 🎨 Best Practices

### 1. Always Handle Loading States

```tsx
const { user, isLoading, error } = useUser()

if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!user) return <LoginPrompt />

return <UserProfile user={user} />
```

### 2. Use Optimistic Updates

```tsx
const { updateProfile } = useUser()

const handleUpdate = async (data) => {
  // UI updates immediately
  await updateProfile(data)
  // Automatically reverts on error
}
```

### 3. Implement Proper Error Handling

```tsx
const { upload } = useUpload({
  onUploadError: (error) => {
    // Log to error tracking service
    Sentry.captureException(error)
    
    // Show user-friendly message
    toast.error('Upload failed', 'Please try again')
  }
})
```

### 4. Clean Up Subscriptions

```tsx
useEffect(() => {
  const unsubscribe = subscribe('event.type', handleEvent)
  return () => unsubscribe() // Always cleanup
}, [])
```

### 5. Memoize Callbacks

```tsx
const handleDelete = useCallback(async (id: string) => {
  await deleteDocument(id)
}, [deleteDocument])
```

## 🏗️ Architecture

### Hook Composition Pattern

Hooks are designed to be composed together:

```tsx
function useDocumentWorkflow() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const { upload } = useUpload()
  const { createReview } = useDocuments()
  const { track } = useAnalytics()

  const processDocument = useCallback(async (file: File) => {
    if (!hasPermission('documents.create')) {
      throw new Error('Permission denied')
    }

    track('Document_Upload_Started')
    const [uploadedFile] = await upload(file)
    
    track('Document_Review_Started')
    const review = await createReview(uploadedFile.id)
    
    track('Document_Process_Completed')
    return { file: uploadedFile, review }
  }, [user, hasPermission, upload, createReview, track])

  return { processDocument }
}
```

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Component │────▶│  Custom Hook │────▶│  API/Store │
└─────────────┘     └──────────────┘     └────────────┘
       │                    │                     │
       │◀───────────────────┘                     │
       │         Updates                          │
       │                                          │
       └──────────────────────────────────────────┘
                  Optimistic Updates
```

## 🧪 Testing

### Testing with React Testing Library

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks'

describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toBeDefined()
    })
  })
})
```

## 📝 Contributing

When adding new hooks:

1. **Follow naming conventions**: `use[Feature]`
2. **Add TypeScript types**: Export all interfaces
3. **Document with JSDoc**: Include @example
4. **Add to index.ts**: Export from main index
5. **Write tests**: Unit and integration tests
6. **Update README**: Add to appropriate section

## 🔐 Security Considerations

- **Never store sensitive data in localStorage** (use httpOnly cookies)
- **Validate all user inputs** before sending to API
- **Use CSRF tokens** for state-changing operations
- **Implement rate limiting** on client side
- **Sanitize error messages** before showing to users
- **Use secure WebSocket** (wss://) in production
- **Implement permission checks** on both client and server

## 📖 Additional Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Hooks](https://react.dev/reference/react)
- [SWR Documentation](https://swr.vercel.app/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 License

Proprietary - LexiScan AI © 2024

---

**Built with ❤️ by the LexiScan AI Team**

