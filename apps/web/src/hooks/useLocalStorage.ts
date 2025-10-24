"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * useLocalStorage - Enterprise-grade persistent state management
 * 
 * Features:
 * - Type-safe localStorage with TypeScript generics
 * - Automatic JSON serialization/deserialization
 * - SSR-safe (checks for window object)
 * - Event-based sync across tabs/windows
 * - Error handling with fallback values
 * - Automatic cleanup
 * 
 * @example
 * const [user, setUser] = useLocalStorage<User>('user', null)
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        
        setStoredValue(valueToStore)
        
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
          // Dispatch custom event for cross-tab synchronization
          window.dispatchEvent(new CustomEvent("local-storage", { detail: { key, value: valueToStore } }))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Remove the key from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)
        setStoredValue(initialValue)
        window.dispatchEvent(new CustomEvent("local-storage", { detail: { key, value: undefined } }))
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ("key" in e && e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error)
        }
      } else if ("detail" in e && e.detail?.key === key) {
        setStoredValue(e.detail.value ?? initialValue)
      }
    }

    // Listen for changes from other tabs
    window.addEventListener("storage", handleStorageChange as EventListener)
    // Listen for changes from current tab
    window.addEventListener("local-storage", handleStorageChange as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange as EventListener)
      window.removeEventListener("local-storage", handleStorageChange as EventListener)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

