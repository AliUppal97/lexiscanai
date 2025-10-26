# NotificationCenter Component

## Overview

The `NotificationCenter` component provides a comprehensive notification management system for the LexiScan AI dashboard. It displays real-time notifications with support for marking as read, bulk operations, and different notification types.

## Features

- **Real-time Updates**: WebSocket integration for live notifications
- **Notification Types**: Support for info, success, warning, and error notifications
- **Bulk Operations**: Mark all as read, clear all notifications
- **Tabbed Interface**: Separate views for unread and all notifications
- **Loading States**: Proper loading and error handling
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: ARIA compliant with keyboard navigation

## Usage

```tsx
import { NotificationCenter } from "@/components/dashboard/NotificationCenter"
import { useNotifications } from "@/hooks/useNotifications"

function Dashboard() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearAll,
    refresh,
    onNotificationClick
  } = useNotifications()

  return (
    <NotificationCenter
      notifications={notifications}
      unreadCount={unreadCount}
      isLoading={isLoading}
      error={error}
      onNotificationClick={onNotificationClick}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onClearAll={clearAll}
      onRetry={refresh}
      maxHeight="400px"
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notifications` | `Notification[]` | - | Array of notification objects |
| `unreadCount` | `number` | - | Number of unread notifications |
| `isLoading` | `boolean` | `false` | Loading state |
| `error` | `string \| null` | `null` | Error message |
| `onNotificationClick` | `(notification: Notification) => void` | - | Click handler for notifications |
| `onMarkAsRead` | `(id: string) => void` | - | Mark notification as read |
| `onMarkAllAsRead` | `() => void` | - | Mark all notifications as read |
| `onClearAll` | `() => void` | - | Clear all notifications |
| `onRetry` | `() => void` | - | Retry failed operations |
| `maxHeight` | `string` | `"400px"` | Maximum height of notification list |

## Notification Object

```typescript
interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  timestamp: Date | string
  actionLabel?: string
  onAction?: () => void
  href?: string
}
```

## Notification Types

- **Info**: General information (blue)
- **Success**: Successful operations (green)
- **Warning**: Important notices (yellow)
- **Error**: Error messages (red)

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Colors**: Uses semantic color tokens
- **Spacing**: Consistent padding and margins
- **Typography**: Proper text hierarchy
- **Animations**: Smooth transitions and hover effects

## Accessibility

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Color Contrast**: Meets WCAG guidelines

## Integration

The component integrates with:

- **useNotifications Hook**: State management and API calls
- **WebSocket Service**: Real-time updates
- **Notification Service**: API communication
- **Toast System**: User feedback

## Examples

### Basic Usage

```tsx
<NotificationCenter
  notifications={notifications}
  unreadCount={unreadCount}
  onNotificationClick={handleClick}
  onMarkAsRead={markAsRead}
/>
```

### With Loading State

```tsx
<NotificationCenter
  notifications={notifications}
  unreadCount={unreadCount}
  isLoading={isLoading}
  onNotificationClick={handleClick}
  onMarkAsRead={markAsRead}
  onRetry={refresh}
/>
```

### With Error Handling

```tsx
<NotificationCenter
  notifications={notifications}
  unreadCount={unreadCount}
  error={error}
  onNotificationClick={handleClick}
  onMarkAsRead={markAsRead}
  onRetry={refresh}
/>
```

## Testing

The component can be tested with:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationCenter } from './NotificationCenter'

const mockNotifications = [
  {
    id: '1',
    title: 'Test Notification',
    message: 'This is a test',
    type: 'info' as const,
    isRead: false,
    timestamp: new Date()
  }
]

test('renders notifications', () => {
  render(
    <NotificationCenter
      notifications={mockNotifications}
      unreadCount={1}
      onNotificationClick={jest.fn()}
      onMarkAsRead={jest.fn()}
    />
  )
  
  expect(screen.getByText('Test Notification')).toBeInTheDocument()
})
```

## Performance

- **Virtualization**: Large notification lists are virtualized
- **Memoization**: Components are memoized to prevent unnecessary re-renders
- **Lazy Loading**: Notifications are loaded on demand
- **Debouncing**: API calls are debounced to prevent spam

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- Tailwind CSS
- Lucide React (icons)
- Radix UI (popover, tabs)
- date-fns (date formatting)
