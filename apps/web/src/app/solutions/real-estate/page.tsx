"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  Building, 
  Home, 
  FileText, 
  Users, 
  CheckCircle,
  ArrowRight,
  Play,
  MessageCircle,
  Star,
  Clock,
  Target,
  Zap,
  Lock,
  Eye,
  Database,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Key
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const features = [
  {
    icon: Building,
    title: "Property Document Analysis",
    description: "AI-powered analysis of leases, contracts, and property documents",
    benefits: ["Lease analysis", "Contract review", "Risk assessment", "Compliance checking"]
  },
  {
    icon: Home,
    title: "Property Management",
    description: "Streamlined property management and tenant relationship tools",
    benefits: ["Tenant screening", "Lease management", "Maintenance tracking", "Financial reporting"]
  },
  {
    icon: FileText,
    title: "Legal Compliance",
    description: "Automated compliance with real estate regulations and laws",
    benefits: ["Fair housing", "Zoning compliance", "Environmental regulations", "Safety standards"]
  },
  {
    icon: BarChart3,
    title: "Market Analysis",
    description: "Advanced analytics for property valuation and market trends",
    benefits: ["Property valuation", "Market trends", "Investment analysis", "Performance metrics"]
  }
]

const documentTypes = [
  {
    name: "Lease Agreements",
    description: "Comprehensive analysis of residential and commercial leases",
    icon: FileText,
    features: ["Term analysis", "Rent escalation", "Maintenance clauses", "Renewal options"]
  },
  {
    name: "Purchase Contracts",
    description: "Real estate purchase and sale agreement analysis",
    icon: Key,
    features: ["Price analysis", "Contingency review", "Timeline tracking", "Risk assessment"]
  },
  {
    name: "Property Reports",
    description: "Property inspection and appraisal document analysis",
    icon: Building,
    features: ["Condition assessment", "Value analysis", "Compliance review", "Recommendations"]
  },
  {
    name: "Zoning Documents",
    description: "Zoning and land use regulation compliance analysis",
    icon: MapPin,
    features: ["Zoning compliance", "Use restrictions", "Development rights", "Permit requirements"]
  }
]

const useCases = [
  {
    title: "Commercial Real Estate",
    description: "Streamline commercial property management and leasing operations",
    icon: Building,
    benefits: ["Lease management", "Tenant relations", "Financial reporting", "Compliance tracking"]
  },
  {
    title: "Residential Property",
    description: "Automated residential property management and tenant screening",
    icon: Home,
    benefits: ["Tenant screening", "Lease processing", "Maintenance coordination", "Rent collection"]
  },
  {
    title: "Real Estate Investment",
    description: "Investment analysis and portfolio management for real estate assets",
    icon: TrendingUp,
    benefits: ["Investment analysis", "Portfolio optimization", "Risk assessment", "Performance tracking"]
  },
  {
    title: "Property Development",
    description: "Project management and compliance for real estate development",
    icon: Target,
    benefits: ["Project tracking", "Permit management", "Compliance monitoring", "Timeline management"]
  }
]

const testimonials = [
  {
    name: "Jennifer Martinez",
    role: "Property Manager",
    company: "Metro Properties",
    content: "LexiScan AI has transformed our lease management process. We've reduced review time by 50% while improving accuracy.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Robert Thompson",
    role: "Real Estate Developer",
    company: "Urban Development Group",
    content: "The compliance features have been invaluable for our development projects. We can track multiple regulations simultaneously.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  },
  {
    name: "Lisa Chen",
    role: "Investment Analyst",
    company: "Real Estate Capital",
    content: "The market analysis capabilities have helped us identify investment opportunities we would have missed otherwise.",
    rating: 5,
    avatar: "/placeholder-avatar.jpg"
  }
]

const realEstateMetrics = [
  {
    metric: "50%",
    description: "Faster Processing",
    icon: Clock,
    color: "text-blue-600"
  },
  {
    metric: "99.5%",
    description: "Accuracy Rate",
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    metric: "100+",
    description: "Property Types",
    icon: Building,
    color: "text-purple-600"
  },
  {
    metric: "24/7",
    description: "Support",
    icon: Eye,
    color: "text-orange-600"
  }
]

export default function RealEstatePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-purple-100 text-purple-800">
              <Building className="h-3 w-3 mr-1" />
              Real Estate Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Real Estate
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Intelligence</span>
              <br />Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform real estate operations with AI-powered document analysis, property management, 
              and compliance automation for property managers, developers, and investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="group">
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Fair Housing Compliant
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Zoning Compliant
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Secure & Private
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-16">
              {/* Key Features */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Real Estate AI Platform</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Built for real estate professionals who need to manage properties, analyze documents, 
                    and maintain compliance across diverse property portfolios.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {features.map((feature, index) => (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="mx-auto p-3 bg-purple-100 rounded-lg w-fit mb-4">
                          <feature.icon className="h-8 w-8 text-purple-600" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {feature.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Real Estate Metrics */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Proven Real Estate Results</h3>
                  <p className="text-gray-600">Trusted by real estate professionals worldwide</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  {realEstateMetrics.map((metric, index) => (
                    <div key={index}>
                      <div className={`text-3xl font-bold ${metric.color} mb-2`}>{metric.metric}</div>
                      <div className="text-gray-600">{metric.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Real Estate Documents</h2>
                <p className="text-lg text-gray-600">
                  Comprehensive analysis of all types of real estate documents
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {documentTypes.map((docType, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <docType.icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{docType.name}</CardTitle>
                          <CardDescription className="text-base">{docType.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {docType.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="use-cases" className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Real Estate Applications</h2>
                <p className="text-lg text-gray-600">
                  Tailored solutions for different real estate professionals
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {useCases.map((useCase, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <useCase.icon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{useCase.title}</CardTitle>
                          <CardDescription className="text-base">{useCase.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {useCase.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-gray-600">
                            <Zap className="h-4 w-4 text-yellow-500 mr-3 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Real Estate-Specific Features</h2>
                <p className="text-lg text-gray-600">
                  Advanced features designed for real estate workflows and requirements
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <feature.icon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                          <CardDescription className="text-base">{feature.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Testimonials */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Real Estate Professionals</h2>
              <p className="text-lg text-gray-600">
                See what real estate professionals are saying about LexiScan AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="py-16">
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Real Estate Operations?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join real estate professionals worldwide who trust LexiScan AI for efficient, compliant document analysis.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button size="lg" variant="secondary">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Demo
                  </Button>
                  <Button size="lg" variant="outline" className="!bg-transparent !text-white !border-white hover:!bg-white hover:!text-gray-900">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Talk to Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
