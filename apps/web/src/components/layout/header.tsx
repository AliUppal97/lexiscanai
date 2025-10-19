"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NavigationDropdown, MobileDropdown, type DropdownItem } from "@/components/ui/navigation-dropdown"
import { 
  FileText, 
  Menu, 
  X, 
  Sparkles,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Solutions", href: "/solutions" },
  { name: "Security", href: "/security" },
  { name: "Compliance", href: "/compliance" },
  { name: "Resources", href: "/resources" },
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
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <div className="relative">
              <FileText className="h-8 w-8 text-blue-600" />
              <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LexiScan AI
            </span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors"
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
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
          <Badge variant="secondary" className="hidden sm:flex">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="group">
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
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold">LexiScan AI</span>
              </Link>
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
                  {navigation.filter(item => item.name !== "Solutions").map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Mobile Solutions Dropdown */}
                  <MobileDropdown
                    label="Solutions"
                    items={solutions}
                  />
                </div>
                <div className="py-6">
                  <Link
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
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

