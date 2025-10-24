"use client"

import { useState, useCallback } from "react"

interface UseClipboardOptions {
  timeout?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseClipboardReturn {
  copied: boolean
  copy: (text: string) => Promise<void>
  reset: () => void
  isSupported: boolean
}

/**
 * useClipboard - Copy text to clipboard with feedback
 * 
 * Features:
 * - Modern Clipboard API with fallback
 * - Automatic reset after timeout
 * - Success/Error callbacks
 * - Browser support detection
 * - TypeScript support
 * 
 * @example
 * const { copied, copy } = useClipboard({ timeout: 2000 })
 * 
 * <button onClick={() => copy(documentId)}>
 *   {copied ? 'Copied!' : 'Copy ID'}
 * </button>
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000, onSuccess, onError } = options
  const [copied, setCopied] = useState(false)
  const [isSupported] = useState(() => {
    return typeof window !== "undefined" && 
           (!!navigator.clipboard || document.queryCommandSupported?.("copy"))
  })

  const copy = useCallback(
    async (text: string) => {
      if (!isSupported) {
        const error = new Error("Clipboard not supported")
        onError?.(error)
        return
      }

      try {
        // Try modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
        } else {
          // Fallback for older browsers
          const textArea = document.createElement("textarea")
          textArea.value = text
          textArea.style.position = "fixed"
          textArea.style.left = "-999999px"
          textArea.style.top = "-999999px"
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          
          const successful = document.execCommand("copy")
          textArea.remove()
          
          if (!successful) {
            throw new Error("Copy command was unsuccessful")
          }
        }

        setCopied(true)
        onSuccess?.()

        // Reset copied state after timeout
        setTimeout(() => {
          setCopied(false)
        }, timeout)
      } catch (error) {
        setCopied(false)
        onError?.(error as Error)
        console.error("Failed to copy text:", error)
      }
    },
    [isSupported, timeout, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setCopied(false)
  }, [])

  return {
    copied,
    copy,
    reset,
    isSupported,
  }
}

