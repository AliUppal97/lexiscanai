"use client"

import { useState, useCallback } from "react"

export type ToastType = "default" | "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface UseToastReturn {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => string
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

// Global toast state (singleton pattern for cross-component access)
let toastCount = 0
const toastListeners: Set<(toasts: Toast[]) => void> = new Set()
let toastsState: Toast[] = []

const updateToasts = (newToasts: Toast[]) => {
  toastsState = newToasts
  toastListeners.forEach((listener) => listener(newToasts))
}

/**
 * useToast - Enterprise toast notification system
 * 
 * Features:
 * - Multiple toast types (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Action buttons
 * - Global state management
 * - Accessible (ARIA compliant via Radix)
 * - Type-safe
 * 
 * @example
 * const { toast, success, error } = useToast()
 * 
 * // Simple success toast
 * success('Document uploaded', 'Your file is being processed')
 * 
 * // Toast with action
 * toast({
 *   title: 'Changes saved',
 *   description: 'Your document has been updated',
 *   type: 'success',
 *   action: {
 *     label: 'Undo',
 *     onClick: () => undoChanges()
 *   }
 * })
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>(toastsState)

  // Subscribe to global toast state
  useState(() => {
    toastListeners.add(setToasts)
    return () => {
      toastListeners.delete(setToasts)
    }
  })

  const toast = useCallback((options: Omit<Toast, "id">) => {
    const id = `toast-${++toastCount}-${Date.now()}`
    const duration = options.duration ?? 5000

    const newToast: Toast = {
      id,
      ...options,
      type: options.type ?? "default",
    }

    updateToasts([...toastsState, newToast])

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return id
  }, [])

  const success = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, type: "success" })
    },
    [toast]
  )

  const error = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, type: "error", duration: 7000 }) // Errors stay longer
    },
    [toast]
  )

  const warning = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, type: "warning" })
    },
    [toast]
  )

  const info = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, type: "info" })
    },
    [toast]
  )

  const dismiss = useCallback((id: string) => {
    updateToasts(toastsState.filter((t) => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    updateToasts([])
  }, [])

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  }
}

// Export individual toast functions for use outside components
export const toast = {
  show: (options: Omit<Toast, "id">) => {
    const id = `toast-${++toastCount}-${Date.now()}`
    const duration = options.duration ?? 5000

    const newToast: Toast = {
      id,
      ...options,
      type: options.type ?? "default",
    }

    updateToasts([...toastsState, newToast])

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id)
      }, duration)
    }

    return id
  },
  success: (title: string, description?: string) => {
    return toast.show({ title, description, type: "success" })
  },
  error: (title: string, description?: string) => {
    return toast.show({ title, description, type: "error", duration: 7000 })
  },
  warning: (title: string, description?: string) => {
    return toast.show({ title, description, type: "warning" })
  },
  info: (title: string, description?: string) => {
    return toast.show({ title, description, type: "info" })
  },
  dismiss: (id: string) => {
    updateToasts(toastsState.filter((t) => t.id !== id))
  },
  dismissAll: () => {
    updateToasts([])
  },
}

