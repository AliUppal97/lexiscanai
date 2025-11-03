"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  Brain, 
  Shield, 
  Zap,
  CheckCircle,
  Star,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  "AI-Powered Analysis",
  "Enterprise Security", 
  "Lightning Fast",
  "99.9% Uptime"
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Senior Partner",
    company: "Johnson & Associates",
    content: "LexiScan AI reduced our contract review time by 80%",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Legal Director", 
    company: "TechCorp",
    content: "The AI insights are incredibly accurate and save us hours daily",
    rating: 5
  }
]

export function Hero() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8 lg:pr-4">
          {/* Badge */}
          <div className="mb-8">
            <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Legal Analysis
              </span>
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Intelligent Document
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analysis Platform
            </span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Transform your legal workflow with AI-powered document analysis, 
            contract review, and intelligent insights. Save time and reduce errors 
            with our advanced natural language processing technology.
          </p>

          {/* Feature Pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {features.map((feature, index) => (
              <div
                key={feature}
                className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                {feature}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center gap-x-6">
            <Link href="/signup">
              <Button size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12">
            <p className="text-sm font-medium text-gray-500 mb-4">
              Trusted by 500+ legal professionals
            </p>
            <div className="flex items-center gap-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-gray-600">4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Right Side - Visual Elements */}
        <div className="mx-auto mt-16 w-full max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-xl lg:flex-shrink-0 xl:ml-16 xl:max-w-2xl">
          <div className="w-full relative overflow-visible">
            {/* Main Dashboard Mockup */}
            <div className="relative w-full">
              {/* Main Dashboard */}
              <div className="rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-200/80 w-full backdrop-blur-sm overflow-hidden">
                {/* Enhanced Header with Trust Indicators */}
                <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 px-6 py-4 border-b border-gray-200/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-400 shadow-sm"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-sm"></div>
                        <div className="h-3 w-3 rounded-full bg-green-400 shadow-sm"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">LexiScan AI Dashboard</h3>
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" title="System Online"></div>
                      </div>
                    </div>
                    {/* Trust Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60">
                      <Shield className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">Enterprise Secure</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 bg-gradient-to-b from-white to-gray-50/30 overflow-visible">
                  {/* Enhanced Dashboard Stats Header */}
                  <div className="mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3 w-full sm:w-auto">
                        {/* Main Title Section */}
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60 shadow-sm flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <Sparkles className="h-2.5 w-2.5 text-yellow-500 absolute -top-0.5 -right-0.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="h-6 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg w-full max-w-[280px] mb-2 border border-gray-200/60"></div>
                            <div className="h-4 bg-gradient-to-r from-gray-100/80 via-gray-50/60 to-gray-100/80 rounded-md w-full max-w-[240px] border border-gray-200/40"></div>
                          </div>
                        </div>
                        {/* Stats Indicators */}
                        <div className="flex items-center gap-4 pt-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm"></div>
                            <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded w-16 border border-gray-200/40"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-sm"></div>
                            <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded w-20 border border-gray-200/40"></div>
                          </div>
                        </div>
                      </div>
                      {/* Live Status Badge */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 shadow-sm">
                          <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"></div>
                          <span className="text-xs font-semibold text-green-700">Live</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/80 border border-blue-200/40 shadow-sm">
                          <Zap className="h-3.5 w-3.5 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">Real-time</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature Sections with Enhanced Design */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                    {/* Secure Section */}
                    <div className="group cursor-pointer flex flex-col h-full">
                      <div className="rounded-2xl bg-gradient-to-br from-white to-blue-50/20 border-2 border-dashed border-blue-300/50 p-4 sm:p-5 shadow-[0_4px_12px_rgba(59,130,246,0.08)] transition-all duration-300 ease-out hover:border-blue-400 hover:shadow-[0_8px_24px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 hover:scale-[1.01] relative overflow-visible flex flex-col flex-1 min-h-[200px]">
                        {/* Subtle gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/0 group-hover:from-blue-50/40 group-hover:to-blue-100/20 transition-all duration-300 ease-out rounded-2xl"></div>
                        <div className="relative flex flex-col flex-1">
                          {/* Badge Header */}
                          <div className="flex items-start justify-between mb-4 flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 ring-2 ring-blue-100 group-hover:scale-105 transition-transform duration-200 ease-out">
                                <Shield className="h-6 w-6 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-base font-bold text-gray-900 tracking-tight mb-1 truncate">Secure</p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md whitespace-nowrap">SOC 2</span>
                                  <span className="text-xs text-gray-600 font-medium whitespace-nowrap">compliant</span>
                                </div>
                              </div>
                            </div>
                            {/* Status indicator */}
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 flex-shrink-0"></div>
                          </div>
                          {/* Content Area */}
                          <div className="h-20 sm:h-24 flex-1 min-h-[80px] bg-gradient-to-br from-blue-50/80 via-blue-100/40 to-blue-50/60 rounded-xl border border-blue-200/60 shadow-inner relative overflow-hidden mt-auto">
                            {/* Subtle pattern overlay */}
                            <div className="absolute inset-0 opacity-5" style={{
                              backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(59,130,246) 1px, transparent 0)',
                              backgroundSize: '16px 16px'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="group cursor-pointer flex flex-col h-full">
                      <div className="rounded-2xl bg-gradient-to-br from-white to-green-50/20 border-2 border-dashed border-green-300/50 p-4 sm:p-5 shadow-[0_4px_12px_rgba(34,197,94,0.08)] transition-all duration-300 ease-out hover:border-green-400 hover:shadow-[0_8px_24px_rgba(34,197,94,0.15)] hover:-translate-y-0.5 hover:scale-[1.01] relative overflow-visible flex flex-col flex-1 min-h-[200px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-100/0 group-hover:from-green-50/40 group-hover:to-green-100/20 transition-all duration-300 ease-out rounded-2xl"></div>
                        <div className="relative flex flex-col flex-1">
                          <div className="flex items-start justify-between mb-4 flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 via-green-400 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20 ring-2 ring-green-100 group-hover:scale-105 transition-transform duration-200 ease-out">
                                <Brain className="h-6 w-6 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-base font-bold text-gray-900 tracking-tight mb-1 truncate">AI Analysis</p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-green-700 bg-green-100/60 px-2 py-0.5 rounded-md whitespace-nowrap">98%</span>
                                  <span className="text-xs text-gray-600 font-medium whitespace-nowrap">accuracy</span>
                                </div>
                              </div>
                            </div>
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 flex-shrink-0"></div>
                          </div>
                          <div className="h-20 sm:h-24 flex-1 min-h-[80px] bg-gradient-to-br from-green-50/80 via-green-100/40 to-green-50/60 rounded-xl border border-green-200/60 shadow-inner relative overflow-hidden mt-auto">
                            <div className="absolute inset-0 opacity-5" style={{
                              backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(34,197,94) 1px, transparent 0)',
                              backgroundSize: '16px 16px'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fast Section */}
                    <div className="group cursor-pointer flex flex-col h-full">
                      <div className="rounded-2xl bg-gradient-to-br from-white to-purple-50/20 border-2 border-dashed border-purple-300/50 p-4 sm:p-5 shadow-[0_4px_12px_rgba(168,85,247,0.08)] transition-all duration-300 ease-out hover:border-purple-400 hover:shadow-[0_8px_24px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 hover:scale-[1.01] relative overflow-visible flex flex-col flex-1 min-h-[200px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-purple-100/0 group-hover:from-purple-50/40 group-hover:to-purple-100/20 transition-all duration-300 ease-out rounded-2xl"></div>
                        <div className="relative flex flex-col flex-1">
                          <div className="flex items-start justify-between mb-4 flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 ring-2 ring-purple-100 group-hover:scale-105 transition-transform duration-200 ease-out">
                                <Zap className="h-6 w-6 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-base font-bold text-gray-900 tracking-tight mb-1 truncate">Fast</p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-md whitespace-nowrap">2.3s</span>
                                  <span className="text-xs text-gray-600 font-medium whitespace-nowrap">avg response</span>
                                </div>
                              </div>
                            </div>
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 flex-shrink-0"></div>
                          </div>
                          <div className="h-20 sm:h-24 flex-1 min-h-[80px] bg-gradient-to-br from-purple-50/80 via-purple-100/40 to-purple-50/60 rounded-xl border border-purple-200/60 shadow-inner relative overflow-hidden mt-auto">
                            <div className="absolute inset-0 opacity-5" style={{
                              backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(168,85,247) 1px, transparent 0)',
                              backgroundSize: '16px 16px'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Carousel */}
            <div className="mt-8">
              <div className="rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-200/80 w-full backdrop-blur-sm overflow-hidden">
                <div className="relative">
                  <div className="overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                    >
                      {testimonials.map((testimonial, index) => (
                        <div key={index} className="w-full flex-shrink-0">
                          <div className="p-6">
                            <div className="flex items-center gap-1 mb-4">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                              ))}
                            </div>
                            <p className="text-gray-700 mb-4 text-base leading-relaxed italic">"{testimonial.content}"</p>
                            <div>
                              <p className="font-semibold text-gray-900">{testimonial.name}</p>
                              <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center pb-6 pt-2 gap-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "h-2.5 w-2.5 rounded-full transition-all duration-300",
                          index === currentTestimonial ? "bg-blue-600 w-8 shadow-md" : "bg-gray-300 hover:bg-gray-400"
                        )}
                        onClick={() => setCurrentTestimonial(index)}
                        aria-label={`View testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

