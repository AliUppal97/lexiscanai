import Link from "next/link"
import { FileText, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LogoProps {
  href?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "light" | "dark" | "dashboard"
  showSparkles?: boolean
  className?: string
  textClassName?: string
}

const sizeConfig = {
  sm: {
    icon: "h-6 w-6",
    sparkles: "h-2.5 w-2.5",
    text: "text-lg"
  },
  md: {
    icon: "h-8 w-8",
    sparkles: "h-3 w-3",
    text: "text-xl"
  },
  lg: {
    icon: "h-10 w-10",
    sparkles: "h-4 w-4",
    text: "text-2xl"
  }
}

export function Logo({ 
  href = "/", 
  size = "md",
  variant = "default",
  showSparkles = true,
  className = "",
  textClassName = ""
}: LogoProps) {
  const sizes = sizeConfig[size]
  
  const iconColor = variant === "light" ? "text-blue-400" : "text-blue-600"
  const textColor = variant === "light" 
    ? "text-white" 
    : variant === "dark"
    ? "text-gray-900"
    : variant === "dashboard"
    ? "text-gray-900"
    : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
  
  const content = (
    <>
      {variant === "dashboard" ? (
        <div className="relative">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          {showSparkles && (
            <Sparkles className="h-2.5 w-2.5 text-yellow-500 absolute -top-0.5 -right-0.5" />
          )}
        </div>
      ) : (
        <div className="relative">
          <FileText className={cn(sizes.icon, iconColor)} />
          {showSparkles && (
            <Sparkles className={cn(sizes.sparkles, "text-yellow-500 absolute -top-1 -right-1")} />
          )}
        </div>
      )}
      <span className={cn(
        sizes.text,
        "font-bold whitespace-nowrap",
        textColor,
        textClassName
      )}>
        LexiScan AI
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn("flex items-center space-x-2", className)}>
        {content}
      </Link>
    )
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {content}
    </div>
  )
}

