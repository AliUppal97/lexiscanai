"use client"

import Link from "next/link"
import { 
  FileText, 
  Users, 
  Clock, 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  BarChart3,
  Zap,
  Target,
  Award,
  Globe
} from "lucide-react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const benefits = [
  {
    icon: Clock,
    title: "Save 80% Time on Document Review",
    description: "Process contracts and legal documents 10x faster with AI-powered analysis.",
    metric: "80% time saved"
  },
  {
    icon: Target,
    title: "Improve Accuracy & Consistency",
    description: "Reduce human errors and ensure consistent analysis across all documents.",
    metric: "98.7% accuracy"
  },
  {
    icon: TrendingUp,
    title: "Increase Billable Hours",
    description: "Focus on high-value legal work while AI handles routine document analysis.",
    metric: "25% more billable hours"
  },
  {
    icon: Shield,
    title: "Reduce Risk & Liability",
    description: "Identify potential risks and compliance issues before they become problems.",
    metric: "90% risk reduction"
  }
]

const features = [
  {
    title: "Contract Analysis",
    description: "Automated review of contracts, NDAs, and legal agreements with risk assessment.",
    icon: FileText
  },
  {
    title: "Case File Management",
    description: "Organize and analyze case files, depositions, and legal documents.",
    icon: BarChart3
  },
  {
    title: "Compliance Checking",
    description: "Ensure documents meet regulatory requirements and industry standards.",
    icon: CheckCircle
  },
  {
    title: "Team Collaboration",
    description: "Work together on document reviews with real-time collaboration tools.",
    icon: Users
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Managing Partner",
    company: "Johnson & Associates",
    content: "LexiScan AI has transformed our contract review process. We can now process 10x more documents with higher accuracy.",
    rating: 5
  },
  {
    name: "Michael Chen",
    title: "Senior Associate",
    company: "Chen Legal Group",
    content: "The AI analysis is incredibly accurate and saves us hours of manual review. It's like having a senior associate working 24/7.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    title: "Partner",
    company: "Rodriguez & Partners",
    content: "Our clients are impressed with the speed and thoroughness of our document analysis. LexiScan AI gives us a competitive edge.",
    rating: 5
  }
]

const stats = [
  { label: "Legal Firms Using LexiScan AI", value: "500+" },
  { label: "Documents Processed Monthly", value: "1M+" },
  { label: "Average Time Saved", value: "80%" },
  { label: "Client Satisfaction", value: "98%" }
]

export default function LegalFirmsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4">For Legal Firms</Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Transform your legal practice with AI-powered document analysis
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Streamline document review, reduce risk, and increase billable hours with LexiScan AI's advanced legal document analysis platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/contact">
                      Schedule Demo
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Contract Analysis</h3>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-sm">3 risks identified</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-sm">Compliance score: 87%</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-sm">2 clauses need attention</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Processing time</span>
                        <span className="font-medium">2.3 seconds</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Legal Firms Choose LexiScan AI
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join hundreds of legal firms that have transformed their practice with AI-powered document analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <benefit.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {benefit.description}
                        </p>
                        <Badge variant="secondary">
                          {benefit.metric}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Built for Legal Professionals
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to streamline your legal document workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Trusted by Leading Legal Firms
              </h2>
              <p className="text-xl text-gray-600">
                See what legal professionals are saying about LexiScan AI.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Award key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.title}, {testimonial.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to transform your legal practice?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of legal firms using LexiScan AI to streamline document analysis and increase efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Start Free Trial
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent" asChild>
                <Link href="/contact">
                  Schedule Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

