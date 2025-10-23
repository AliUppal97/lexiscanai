"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface DropdownItem {
  name: string
  description: string
  href: string
  icon: string
  category: string
  popular?: boolean
}

export interface NavigationDropdownProps {
  label: string
  items: DropdownItem[]
  viewAllHref: string
  className?: string
  triggerClassName?: string
  dropdownClassName?: string
}

export function NavigationDropdown({
  label,
  items,
  viewAllHref,
  className = "",
  triggerClassName = "",
  dropdownClassName = ""
}: NavigationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors whitespace-nowrap",
          triggerClassName
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} aria-hidden="true" />
      </button>
      
      {isOpen && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 top-full z-50 pt-3 w-screen max-w-2xl",
            dropdownClassName
          )}
        >
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 border border-gray-100">
            <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry Solutions</h3>
              <p className="text-sm text-gray-600">Tailored AI-powered document analysis for your industry</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group relative flex items-start gap-x-4 rounded-xl p-4 text-sm leading-6 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div className="flex-auto min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </p>
                      {item.popular && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-gray-600 text-sm">{item.description}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.category}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                href={viewAllHref}
                className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all solutions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export interface MobileDropdownProps {
  label: string
  items: DropdownItem[]
  className?: string
}

export function MobileDropdown({
  label,
  items,
  className = ""
}: MobileDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className={cn("-mx-3", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
      >
        {label}
        <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", isExpanded && "rotate-180")} />
      </button>
      {isExpanded && (
        <div className="space-y-2 ml-4 mt-2">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
