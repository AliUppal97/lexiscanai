"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NotificationCenter } from "@/components/dashboard/NotificationCenter"
import { useNotifications } from "@/hooks/useNotifications"
import { 
  FileText,
  BarChart3, 
  Users, 
  Settings, 
  Search,
  Menu,
  X,
  LogOut,
  User,
  CreditCard,
  HelpCircle,
  Brain,
  Upload,
  History,
  ChevronDown,
  PanelLeftClose
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: BarChart3,
    current: true,
  },
  {
    name: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
    current: false,
  },
  {
    name: "Upload",
    href: "/dashboard/upload",
    icon: Upload,
    current: false,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: Brain,
    current: false,
  },
  {
    name: "Team",
    href: "/dashboard/team",
    icon: Users,
    current: false,
  },
  {
    name: "History",
    href: "/dashboard/history",
    icon: History,
    current: false,
  },
]

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    name: "Help & Support",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState))
    }
  }, [])
  
  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])
  
  // Initialize notifications hook
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    clearAll,
    refresh: refreshNotifications,
    onNotificationClick
  } = useNotifications({
    enableRealtime: true,
    refreshInterval: 30000,
    limit: 50
  })
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 flex z-40 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-shrink-0 transition-all duration-300 ease-in-out relative will-change-[width] overflow-hidden",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col w-full relative min-w-0">
          <SidebarContent collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden transition-all duration-300 ease-in-out">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex items-center justify-between gap-x-4">
            {/* Search - Flexible width with max constraint */}
            <div className="flex-1 max-w-2xl">
              <form className="w-full" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    id="search-field"
                    className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search documents, contracts..."
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
            
            {/* Right side actions - Fixed width */}
            <div className="flex items-center gap-x-2 flex-shrink-0">
              {/* Notifications */}
              <NotificationCenter
                notifications={notifications}
                unreadCount={unreadCount}
                isLoading={notificationsLoading}
                error={notificationsError}
                onNotificationClick={onNotificationClick}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAll}
                onRetry={refreshNotifications}
                maxHeight="400px"
              />

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-x-2 px-2 sm:px-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden lg:block text-left min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">John Doe</p>
                      <p className="text-xs text-gray-500 truncate">john@company.com</p>
                    </div>
                    <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/billing" className="flex items-center cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  collapsed?: boolean
  onToggle?: () => void
}

function SidebarContent({ collapsed = false, onToggle }: SidebarContentProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white overflow-hidden">
        {/* Logo */}
        <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto overflow-x-hidden">
          <div className="px-2 py-2">
            <Link 
              href="/dashboard" 
              className="group relative w-full flex items-center px-2 py-2 rounded-lg transition-all duration-300 ease-in-out overflow-hidden active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              {/* Background gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/3 group-hover:to-blue-500/8 transition-all duration-300 rounded-lg" />
              
              {/* Content */}
              <div className="relative flex items-center z-10 w-full">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-none mr-3" style={{ minWidth: '2rem', minHeight: '2rem' }}>
                  <FileText className="h-5 w-5 text-white transition-none" style={{ minWidth: '1.25rem', minHeight: '1.25rem' }} />
                </div>
                <span className={cn(
                  "text-base font-bold text-gray-900 tracking-tight transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
                  collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-full"
                )}>
                  LexiScan AI
                </span>
              </div>
              
              {/* Subtle shine effect on hover */}
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300" />
              </div>
            </Link>
          </div>
        
        {/* Organization info */}
        <div className="px-2 py-2 mt-8 transition-all duration-300">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group relative w-full flex items-center px-2 py-2 rounded-lg transition-all duration-300 ease-in-out overflow-hidden active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                  {/* Background gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/3 group-hover:to-blue-500/8 transition-all duration-300 rounded-lg" />
                  
                  {/* Content */}
                  <div className="relative flex items-center z-10 w-full">
                    <div 
                      className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200/50 shadow-sm transition-none mr-3" 
                      style={{ 
                        minWidth: '2.5rem', 
                        minHeight: '2.5rem'
                      }}
                    >
                      <span className="text-sm font-bold text-gray-700 tracking-tight">AC</span>
                    </div>
                    <div className={cn(
                      "min-w-0 flex-1 transition-all duration-300 ease-in-out overflow-hidden",
                      collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-full"
                    )}>
                      <p className="text-sm font-semibold text-gray-900 truncate whitespace-nowrap leading-5">Acme Corp</p>
                      <p className="text-xs text-gray-500 truncate whitespace-nowrap leading-4 mt-0.5">acme-corp.lexiscan.ai</p>
                    </div>
                  </div>
                  
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300" />
                  </div>
                </div>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="ml-2">
                  <div>
                    <p className="font-semibold">Acme Corp</p>
                    <p className="text-xs text-gray-500 mt-0.5">acme-corp.lexiscan.ai</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-2 py-4 transition-all duration-300">
          <nav className="space-y-1">
          <TooltipProvider delayDuration={300}>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const linkContent = (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative w-full flex items-center px-2 py-2 rounded-lg transition-all duration-300 ease-in-out overflow-hidden",
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  )}
                >
                  {/* Background gradient overlay on hover */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/3 group-hover:to-blue-500/8 transition-all duration-300 rounded-lg" />
                  )}
                  
                  {/* Content */}
                  <div className="relative flex items-center z-10 w-full">
                    <item.icon
                      className={cn(
                        "flex-shrink-0 h-5 w-5 mr-3 transition-colors duration-200",
                        isActive 
                          ? "text-blue-500" 
                          : "text-gray-400 group-hover:text-blue-600"
                      )}
                      style={{ minWidth: '1.25rem', minHeight: '1.25rem' }}
                    />
                    <span className={cn(
                      "text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
                      isActive
                        ? "text-blue-900"
                        : "text-gray-600 group-hover:text-blue-600",
                      collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-full"
                    )}>{item.name}</span>
                  </div>
                  
                  {/* Subtle shine effect on hover */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300" />
                    </div>
                  )}
                </Link>
              )
              
              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }
              
              return linkContent
            })}
          </TooltipProvider>
          </nav>
        </div>

        {/* Secondary navigation */}
        <div className="flex-shrink-0 flex border-t border-gray-200 px-2 py-4 transition-all duration-300">
          <nav className="flex-1 space-y-1 w-full">
            <TooltipProvider delayDuration={300}>
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href
                const linkContent = (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group relative w-full flex items-center px-2 py-2 rounded-lg transition-all duration-300 ease-in-out overflow-hidden",
                      isActive
                        ? "bg-blue-100 text-blue-900"
                        : "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    )}
                  >
                    {/* Background gradient overlay on hover */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/3 group-hover:to-blue-500/8 transition-all duration-300 rounded-lg" />
                    )}
                    
                    {/* Content */}
                    <div className="relative flex items-center z-10 w-full">
                      <item.icon
                        className={cn(
                          "flex-shrink-0 h-5 w-5 mr-3 transition-colors duration-200",
                          isActive 
                            ? "text-blue-500" 
                            : "text-gray-400 group-hover:text-blue-600"
                        )}
                        style={{ minWidth: '1.25rem', minHeight: '1.25rem' }}
                      />
                      <span className={cn(
                        "text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
                        isActive
                          ? "text-blue-900"
                          : "text-gray-600 group-hover:text-blue-600",
                        collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-full"
                      )}>{item.name}</span>
                    </div>
                    
                    {/* Subtle shine effect on hover */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300" />
                      </div>
                    )}
                  </Link>
                )
                
                if (collapsed) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2">
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                }
                
                return linkContent
              })}
            </TooltipProvider>
          </nav>
        </div>

        {/* Premium Toggle Button */}
        {onToggle && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-2 py-4 transition-all duration-300">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggle}
                    className="group relative w-full flex items-center px-2 py-2 rounded-lg transition-all duration-300 ease-in-out overflow-hidden bg-gradient-to-br from-gray-50 via-gray-50/80 to-gray-100/60 border border-gray-200/80 shadow-sm hover:from-blue-50 hover:via-blue-50/90 hover:to-blue-100/70 hover:border-blue-300/80 hover:shadow-md hover:shadow-blue-500/5 active:scale-[0.97] active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    {/* Background gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/3 group-hover:to-blue-500/8 transition-all duration-300 rounded-lg" />
                    
                    {/* Content */}
                    <div className="relative flex items-center z-10 w-full">
                      <PanelLeftClose className={cn(
                        "flex-shrink-0 h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors duration-200",
                        collapsed && "rotate-180"
                      )} 
                      style={{ minWidth: '1.25rem', minHeight: '1.25rem' }}
                      />
                      <span className={cn(
                        "text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-all duration-300 whitespace-nowrap overflow-hidden",
                        collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-full"
                      )}>Collapse</span>
                    </div>
                    
                    {/* Subtle shine effect on hover */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300" />
                    </div>
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="ml-2">
                    <p>Expand sidebar</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  )
}

