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
  Star
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
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
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
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            {/* Main Dashboard Mockup */}
            <div className="relative">
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 z-10">
                <div className="rounded-lg bg-white p-4 shadow-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">AI Analysis</p>
                      <p className="text-xs text-gray-500">98% accuracy</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-2 -right-6 z-10">
                <div className="rounded-lg bg-white p-4 shadow-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Secure</p>
                      <p className="text-xs text-gray-500">SOC 2 compliant</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-2 z-10">
                <div className="rounded-lg bg-white p-4 shadow-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Fast</p>
                      <p className="text-xs text-gray-500">2.3s avg response</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Dashboard */}
              <div className="rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    <div className="ml-4 text-sm text-gray-500">LexiScan AI Dashboard</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="h-20 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200"></div>
                      <div className="h-20 bg-green-50 rounded-lg border-2 border-dashed border-green-200"></div>
                      <div className="h-20 bg-purple-50 rounded-lg border-2 border-dashed border-purple-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Carousel */}
            <div className="mt-8">
              <div className="relative">
                <div className="overflow-hidden">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                  >
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        <div className="rounded-lg bg-white/80 p-6 shadow-lg backdrop-blur-sm border">
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                          <div>
                            <p className="font-semibold text-gray-900">{testimonial.name}</p>
                            <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center mt-4 gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "h-2 w-2 rounded-full transition-colors",
                        index === currentTestimonial ? "bg-blue-600" : "bg-gray-300"
                      )}
                      onClick={() => setCurrentTestimonial(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

