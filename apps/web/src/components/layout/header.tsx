"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { NavigationDropdown, MobileDropdown, type DropdownItem } from "@/components/ui/navigation-dropdown"
import { 
  Menu, 
  X, 
  Sparkles,
  ArrowRight
} from "lucide-react"

const navigation = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Security", href: "/security" },
  { name: "Company", href: "/about" },
]

const solutions: DropdownItem[] = [
  {
    name: "Legal Firms",
    description: "Streamline document review for law firms",
    href: "/solutions/legal-firms",
    icon: "⚖️",
    category: "Legal Services",
    popular: true
  },
  {
    name: "Corporate Legal",
    description: "Enterprise contract analysis",
    href: "/solutions/corporate",
    icon: "🏢",
    category: "Enterprise",
    popular: true
  },
  {
    name: "Compliance Teams",
    description: "Regulatory compliance automation",
    href: "/solutions/compliance",
    icon: "📋",
    category: "Compliance",
    popular: false
  },
  {
    name: "Healthcare",
    description: "HIPAA-compliant document analysis",
    href: "/solutions/healthcare",
    icon: "🏥",
    category: "Healthcare",
    popular: false
  },
  {
    name: "Financial Services",
    description: "Banking and finance compliance",
    href: "/solutions/financial",
    icon: "💰",
    category: "Finance",
    popular: false
  },
  {
    name: "Real Estate",
    description: "Property and lease management",
    href: "/solutions/real-estate",
    icon: "🏠",
    category: "Real Estate",
    popular: false
  },
  {
    name: "Government",
    description: "FedRAMP authorized for public sector",
    href: "/solutions/government",
    icon: "🏛️",
    category: "Public Sector",
    popular: true
  },
]

const resources: DropdownItem[] = [
  {
    name: "Documentation",
    description: "API docs and integration guides",
    href: "/docs",
    icon: "📚",
    category: "Developers",
    popular: true
  },
  {
    name: "API Reference",
    description: "RESTful API documentation",
    href: "/api",
    icon: "🔌",
    category: "Developers",
    popular: true
  },
  {
    name: "Integrations",
    description: "Connect with your favorite tools",
    href: "/integrations",
    icon: "🔗",
    category: "Platform",
    popular: true
  },
  {
    name: "Help Center",
    description: "Get support and find answers",
    href: "/help",
    icon: "💬",
    category: "Support",
    popular: false
  },
  {
    name: "Blog",
    description: "Latest news and insights",
    href: "/blog",
    icon: "📝",
    category: "Content",
    popular: false
  },
  {
    name: "Case Studies",
    description: "Customer success stories",
    href: "/case-studies",
    icon: "📊",
    category: "Content",
    popular: false
  },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-4 p-6 lg:px-8" aria-label="Global">
        {/* Logo - Fixed width on desktop */}
        <div className="flex items-center flex-shrink-0">
          <Logo className="-m-1.5 p-1.5" />
        </div>
        
        {/* Mobile menu button */}
        <div className="flex lg:hidden ml-auto">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:text-gray-900 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        {/* Desktop Navigation - Center */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-6 xl:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
          
          {/* Solutions Dropdown */}
          <NavigationDropdown
            label="Solutions"
            items={solutions}
            viewAllHref="/solutions"
          />
          
          {/* Resources Dropdown */}
          <NavigationDropdown
            label="Resources"
            items={resources}
            viewAllHref="/resources"
          />
        </div>
        
        {/* Desktop Actions - Right side */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-3 lg:ml-auto flex-shrink-0">
          <Badge variant="secondary" className="hidden xl:flex items-center">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="whitespace-nowrap">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="group whitespace-nowrap">
              Get Started
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Logo className="-m-1.5 p-1.5" />
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Mobile Solutions Dropdown */}
                  <MobileDropdown
                    label="Solutions"
                    items={solutions}
                  />
                  
                  {/* Mobile Resources Dropdown */}
                  <MobileDropdown
                    label="Resources"
                    items={resources}
                  />
                </div>
                <div className="py-6 space-y-2">
                  <Link
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

