"use client"

import { useEffect, useCallback, useRef } from "react"

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean // Command on Mac, Windows key on Windows
  callback: (event: KeyboardEvent) => void
  description?: string
  preventDefault?: boolean
  enabled?: boolean
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enableInInputs?: boolean // Whether to trigger shortcuts when focused in input elements
}

/**
 * useKeyboardShortcuts - Enterprise keyboard navigation system
 * 
 * Features:
 * - Multiple shortcut registration
 * - Modifier key support (Ctrl, Shift, Alt, Meta)
 * - Input element detection
 * - preventDefault control
 * - Enable/disable individual shortcuts
 * - TypeScript support
 * 
 * @example
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 's',
 *       ctrl: true,
 *       callback: () => saveDocument(),
 *       description: 'Save document',
 *       preventDefault: true
 *     },
 *     {
 *       key: '/',
 *       callback: () => focusSearch(),
 *       description: 'Focus search'
 *     },
 *     {
 *       key: 'Escape',
 *       callback: () => closeModal(),
 *       description: 'Close modal'
 *     }
 *   ]
 * })
 */
export function useKeyboardShortcuts({
  shortcuts,
  enableInInputs = false,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts)

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if we're in an input element
      const target = event.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"

      if (isInput && !enableInInputs) {
        return
      }

      // Check each shortcut
      shortcutsRef.current.forEach((shortcut) => {
        if (shortcut.enabled === false) {
          return
        }

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrl === undefined || event.ctrlKey === shortcut.ctrl
        const shiftMatches = shortcut.shift === undefined || event.shiftKey === shortcut.shift
        const altMatches = shortcut.alt === undefined || event.altKey === shortcut.alt
        const metaMatches = shortcut.meta === undefined || event.metaKey === shortcut.meta

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.callback(event)
        }
      })
    },
    [enableInInputs]
  )

  useEffect(() => {
    if (typeof window === "undefined") return

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])
}

/**
 * useKeyPress - Simple hook to detect if a specific key is pressed
 * 
 * @example
 * const escapePressed = useKeyPress('Escape')
 * 
 * useEffect(() => {
 *   if (escapePressed) {
 *     closeModal()
 *   }
 * }, [escapePressed])
 */
export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const downHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setKeyPressed(true)
      }
    }

    const upHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setKeyPressed(false)
      }
    }

    window.addEventListener("keydown", downHandler)
    window.addEventListener("keyup", upHandler)

    return () => {
      window.removeEventListener("keydown", downHandler)
      window.removeEventListener("keyup", upHandler)
    }
  }, [targetKey])

  return keyPressed
}

// Fix missing import
import { useState } from "react"

/**
 * Common keyboard shortcuts for LexiScan AI
 * Use these constants for consistency across the app
 */
export const COMMON_SHORTCUTS = {
  SAVE: { key: "s", ctrl: true, description: "Save" },
  SEARCH: { key: "/", description: "Focus search" },
  CLOSE: { key: "Escape", description: "Close/Cancel" },
  NEW_DOCUMENT: { key: "n", ctrl: true, description: "New document" },
  UPLOAD: { key: "u", ctrl: true, description: "Upload document" },
  HELP: { key: "?", shift: true, description: "Show help" },
  DASHBOARD: { key: "d", ctrl: true, alt: true, description: "Go to dashboard" },
  SETTINGS: { key: ",", ctrl: true, description: "Open settings" },
  LOGOUT: { key: "q", ctrl: true, shift: true, description: "Logout" },
} as const

