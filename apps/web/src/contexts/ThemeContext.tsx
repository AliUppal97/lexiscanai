"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

/**
 * ThemeContext - Dark/Light mode theme management
 * 
 * Features:
 * - System theme detection
 * - Manual theme override
 * - Persistent theme preference
 * - Smooth transitions
 * - SSR-safe
 * - Accessibility support
 * 
 * @example
 * // Wrap your app with ThemeProvider
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * 
 * // Use in components
 * const { theme, setTheme, toggleTheme } = useTheme()
 */

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  systemTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
  enableTransitions?: boolean
}

/**
 * ThemeProvider - Provides theme context to the entire app
 * 
 * Automatically detects system theme and applies it.
 * Persists user preference to localStorage.
 */
export function ThemeProvider({ 
  children,
  defaultTheme = "system",
  storageKey = "lexiscan-theme",
  enableTransitions = true
}: ThemeProviderProps) {
  const [theme, setThemeState] = useLocalStorage<Theme>(storageKey, defaultTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light")
  const [mounted, setMounted] = useState(false)

  // Get resolved theme (actual theme being displayed)
  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme

  // Detect system theme preference
  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? "dark" : "light")
    }

    // Set initial value
    handleChange(mediaQuery)

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (typeof window === "undefined") return

    const root = document.documentElement
    const isDark = resolvedTheme === "dark"

    // Remove old theme classes
    root.classList.remove("light", "dark")

    // Add transitions class if enabled
    if (enableTransitions && mounted) {
      root.classList.add("theme-transitioning")
    }

    // Apply new theme
    root.classList.add(resolvedTheme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDark ? "#1a1a1a" : "#ffffff")
    }

    // Update color-scheme for native browser elements
    root.style.colorScheme = resolvedTheme

    // Remove transition class after animation
    if (enableTransitions && mounted) {
      const timer = setTimeout(() => {
        root.classList.remove("theme-transitioning")
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [resolvedTheme, mounted, enableTransitions])

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(systemTheme === "dark" ? "light" : "dark")
    } else {
      setTheme(theme === "dark" ? "light" : "dark")
    }
  }

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    systemTheme,
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }}>
        {children}
      </div>
    )
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * useTheme - Hook to access theme context
 * 
 * @throws {Error} If used outside of ThemeProvider
 * 
 * @example
 * const { theme, setTheme, toggleTheme, resolvedTheme } = useTheme()
 * 
 * return (
 *   <div>
 *     <p>Current theme: {resolvedTheme}</p>
 *     <button onClick={toggleTheme}>
 *       Toggle Theme
 *     </button>
 *     <select value={theme} onChange={(e) => setTheme(e.target.value)}>
 *       <option value="light">Light</option>
 *       <option value="dark">Dark</option>
 *       <option value="system">System</option>
 *     </select>
 *   </div>
 * )
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  
  return context
}

/**
 * ThemeToggle - Pre-built theme toggle button component
 * 
 * @example
 * import { ThemeToggle } from '@/contexts/ThemeContext'
 * 
 * <ThemeToggle />
 */
export function ThemeToggle({ 
  className = "",
  showLabel = false 
}: { 
  className?: string
  showLabel?: boolean 
}) {
  const { theme, resolvedTheme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === "system" ? "System" : resolvedTheme === "dark" ? "Dark" : "Light"}
        </span>
      )}
    </button>
  )
}

/**
 * ThemeScript - Script to prevent flash of unstyled content
 * 
 * Add this to your app's <head> section
 * 
 * @example
 * // In app/layout.tsx
 * import { ThemeScript } from '@/contexts/ThemeContext'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <ThemeScript />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   )
 * }
 */
export function ThemeScript({ storageKey = "lexiscan-theme" }: { storageKey?: string }) {
  const themeScript = `
    (function() {
      try {
        const theme = localStorage.getItem('${storageKey}') || 'system';
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const resolvedTheme = theme === 'system' ? systemTheme : theme;
        
        document.documentElement.classList.add(resolvedTheme);
        document.documentElement.style.colorScheme = resolvedTheme;
        
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff');
        }
      } catch (e) {
        console.error('Theme initialization error:', e);
      }
    })();
  `

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  )
}

/**
 * useMediaQuery - Hook to detect media query matches
 * 
 * @example
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)')
 * const isMobile = useMediaQuery('(max-width: 768px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia(query)
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches)
    }

    // Set initial value
    handleChange(mediaQuery)

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [query])

  return mounted ? matches : false
}

